import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "./ui/dialog";
import { Plus, ShoppingCart, Trash2, Printer, Clock, Search, RotateCcw } from "lucide-react";
import { Input } from "./ui/input";
import { useRestaurant } from "../contexts/RestaurantContext";
import * as api from "../services/api";
import { MenuItem, Table } from "../types";

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  sentToKitchen?: boolean;
  department?: string;
  printedQuantity?: number; // Track quantity already printed on KOT
}

// Define interface for pending orders
interface PendingOrder {
  id: string;
  invoiceNumber: string;
  items: CartItem[];
  subtotal: number;
  tax: number;
  total: number;
  timestamp: Date;
}

export const TakeawayPage: React.FC = () => {
  const {
    tables,
    addItemsToTable,
    getTableOrder,
    completeTableOrder,
    markItemsAsSent,
    addInvoice,
    kotConfig,
    billConfig,
  } = useRestaurant();

  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<string[]>(["All"]);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [showBillDialog, setShowBillDialog] = useState(false);
  const [showHoldDialog, setShowHoldDialog] = useState(false);
  const [showRecallDialog, setShowRecallDialog] = useState(false);
  const [currentOrder, setCurrentOrder] = useState<CartItem[]>([]);
  const [pendingOrders, setPendingOrders] = useState<PendingOrder[]>([]);
  const [selectedPendingOrder, setSelectedPendingOrder] = useState<PendingOrder | null>(null);
  const [currentTime, setCurrentTime] = useState(Date.now());
  const [restaurantSettings, setRestaurantSettings] = useState<api.RestaurantSettings | null>(null);

  // Update time every minute for real-time display
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(Date.now());
    }, 60000); // Update every minute

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const [items, cats] = await Promise.all([api.getMenuItems(), api.getCategories()]);
        if (!mounted) return;
        setMenuItems(items || []);
        setCategories(["All", ...(cats || []).map((c: any) => c.name || c)]);
      } catch (err) {
        console.error("Failed to load menu data", err);
      }
    };
    load();
    return () => {
      mounted = false;
    };
  }, []);

  // Reset state when component unmounts
  useEffect(() => {
    return () => {
      // Cleanup function when component unmounts
      console.log("TakeawayPage unmounted");
    };
  }, []);

  // Load pending orders from localStorage on component mount
  useEffect(() => {
    const loadPendingOrders = () => {
      try {
        const savedOrders = localStorage.getItem('takeawayPendingOrders');
        if (savedOrders) {
          const parsedOrders = JSON.parse(savedOrders);
          // Convert timestamp strings back to Date objects
          const ordersWithDates = parsedOrders.map((order: any) => ({
            ...order,
            timestamp: new Date(order.timestamp)
          }));
          setPendingOrders(ordersWithDates);
        }
      } catch (err) {
        console.error("Failed to load pending orders from localStorage", err);
      }
    };
    
    loadPendingOrders();
  }, []);

  // Load data when component mounts
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        // Load menu items, categories, and restaurant settings
        const [items, cats, settings] = await Promise.all([
          api.getMenuItems(),
          api.getCategories(),
          api.getRestaurantSettings()
        ]);
        setMenuItems(items || []);
        setCategories(["All", ...(cats || []).map((c: any) => c.name || c)]);
        setRestaurantSettings(settings);
      } catch (err) {
        console.error("Failed to load initial data", err);
      }
    };
    
    loadInitialData();
  }, []);

  // Persist pending orders to localStorage
  useEffect(() => {
    const savePendingOrders = () => {
      localStorage.setItem('takeawayPendingOrders', JSON.stringify(pendingOrders));
    };
    
    // Save pending orders whenever they change
    savePendingOrders();
  }, [pendingOrders]);

  const filteredItems = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return menuItems.filter((item) => {
      const byCat = selectedCategory === "All" || item.category === selectedCategory;
      const bySearch =
        !q ||
        item.name?.toLowerCase().includes(q) ||
        item.productCode?.toLowerCase().includes(q) ||
        item.description?.toLowerCase().includes(q);
      return byCat && bySearch;
    });
  }, [menuItems, selectedCategory, searchQuery]);

  const getPendingItems = useCallback(() => {
    // If there's a selected pending order (recalled order), calculate items that need KOT
    if (selectedPendingOrder) {
      const pendingItems: CartItem[] = [];
      
      currentOrder.forEach(currentItem => {
        // Find if this item exists in the recalled order
        const pendingItem = selectedPendingOrder.items.find(
          item => item.id === currentItem.id
        );
        
        if (pendingItem) {
          // Item exists in recalled order - check if quantity increased
          const qtyIncrease = currentItem.quantity - pendingItem.quantity;
          if (qtyIncrease > 0) {
            // Only print the increased quantity
            pendingItems.push({
              ...currentItem,
              quantity: qtyIncrease
            });
          }
        } else {
          // New item not in recalled order - print full quantity
          if (!currentItem.sentToKitchen) {
            const qtyToPrint = currentItem.quantity - (currentItem.printedQuantity || 0);
            if (qtyToPrint > 0) {
              pendingItems.push({
                ...currentItem,
                quantity: qtyToPrint
              });
            }
          }
        }
      });
      
      return pendingItems;
    }
    
    // Normal case: return items not sent to kitchen with quantity adjustment
    return currentOrder.map((it) => {
      // Calculate the quantity that needs to be printed (current qty - already printed qty)
      const qtyToPrint = it.quantity - (it.printedQuantity || 0);
      return qtyToPrint > 0 ? { ...it, quantity: qtyToPrint, sentToKitchen: false } : null;
    }).filter(Boolean) as CartItem[];
  }, [currentOrder, selectedPendingOrder]);

  const getAllCombinedItems = useCallback(() => {
    // When a pending order is recalled, its items are already loaded into currentOrder
    // So we should just return currentOrder to avoid double counting
    return currentOrder;
  }, [currentOrder]);

  const subtotal = useMemo(() => {
    // Simply calculate from all combined items (which includes recalled order items if any)
    return getAllCombinedItems().reduce((s: number, i: CartItem) => s + i.price * i.quantity, 0);
  }, [getAllCombinedItems]);
  
  const tax = useMemo(() => {
    const taxRate = restaurantSettings?.taxRate || 0.0;
    return subtotal * (taxRate / 100);
  }, [subtotal, restaurantSettings]);
  
  const total = useMemo(() => subtotal + tax, [subtotal, tax]);

  // Format time helper function
  const formatTimeAgo = useCallback((startTime: string | Date) => {
    const start = typeof startTime === 'string' ? new Date(startTime) : startTime;
    const diffMs = currentTime - start.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffDays > 0) {
      return `${diffDays}d ${diffHours % 24}h`;
    } else if (diffHours > 0) {
      return `${diffHours}h ${diffMins % 60}m`;
    } else {
      return `${diffMins}m`;
    }
  }, [currentTime]);

  // Format date time helper
  const formatDateTime = useCallback((date: Date | string) => {
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    });
  }, []);

  const handleCategorySelect = useCallback((c: string) => setSelectedCategory(c), []);
  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value), []);

  const generateKOTContent = useCallback(
    (items: CartItem[], isAdditional = false, department?: string, kotNumber?: number) => {
      const now = new Date();
      const orderNumber = kotNumber ? `KOT-${kotNumber}` : `KOT-${Date.now()}`;
      
      // Get paper size and format from context
      const paperSize = kotConfig.paperSize || "80mm";
      const formatType = kotConfig.formatType || "detailed";
      
      // Adjust styling based on paper size
      let fontSize = "12px";
      let padding = "8px";
      let maxWidth = "80mm";
      
      if (paperSize === "58mm") {
        fontSize = "10px";
        padding = "5px";
        maxWidth = "58mm";
      } else if (paperSize === "112mm") {
        fontSize = "14px";
        padding = "12px";
        maxWidth = "112mm";
      }
      
      // Generate content based on format type
      let content = "";
      
      if (formatType === "compact") {
        // Compact format
        content = `<!doctype html><html><head><meta charset="utf-8"><title>${orderNumber}</title><style>
          body {
            font-family: Arial, Helvetica, sans-serif;
            font-size: ${fontSize};
            padding: ${padding};
            max-width: ${maxWidth};
            margin: 0 auto;
            box-sizing: border-box;
          }
          .h {
            text-align: center;
            font-weight: 700;
          }
          hr {
            border: none;
            border-top: 1px dashed #000;
            margin: 5px 0;
          }
          @media print {
            @page {
              size: ${maxWidth} auto;
              margin: 0;
            }
            body {
              width: ${maxWidth};
              max-width: ${maxWidth};
              padding: ${padding};
              margin: 0;
            }
          }
        </style></head><body>` +
          `<div class="h">KOT ${kotNumber || ''}</div>` +
          (department ? `<div style="text-align:center">[${department}]</div>` : "") +
          (isAdditional ? `<div style="text-align:center;font-weight:700;margin:5px 0">*** ADDITIONAL ***</div>` : "") +
          `<div>${now.toLocaleString()}</div>` +
          `<div>Takeaway</div>` +
          `<hr/>` +
          items
            .map((it) => `<div>${it.name} x ${it.quantity}</div>`)
            .join("") +
          `<hr/><div style="text-align:center">Generated by POS</div></body></html>`;
      } else if (formatType === "grouped") {
        // Grouped by department format
        const groupedItems: Record<string, CartItem[]> = {};
        items.forEach(item => {
          const dept = item.department || "General";
          if (!groupedItems[dept]) {
            groupedItems[dept] = [];
          }
          groupedItems[dept].push(item);
        });
        
        content = `<!doctype html><html><head><meta charset="utf-8"><title>${orderNumber}</title><style>
          body {
            font-family: Arial, Helvetica, sans-serif;
            font-size: ${fontSize};
            padding: ${padding};
            max-width: ${maxWidth};
            margin: 0 auto;
            box-sizing: border-box;
          }
          .h {
            text-align: center;
            font-weight: 700;
          }
          hr {
            border: none;
            border-top: 1px dashed #000;
            margin: 5px 0;
          }
          @media print {
            @page {
              size: ${maxWidth} auto;
              margin: 0;
            }
            body {
              width: ${maxWidth};
              max-width: ${maxWidth};
              padding: ${padding};
              margin: 0;
            }
          }
        </style></head><body>` +
          `<div class="h">KITCHEN ORDER TICKET</div>` +
          (isAdditional ? `<div style="text-align:center;font-weight:700;margin:5px 0">*** ADDITIONAL ITEMS ***</div>` : "") +
          `<div>Date: ${now.toLocaleString()}</div>` +
          `<div>Type: Takeaway</div>` +
          `<hr/>`;
          
        Object.entries(groupedItems).forEach(([dept, deptItems]) => {
          content += `<div style="font-weight:700;margin-top:10px">[${dept}]</div>`;
          deptItems.forEach(it => {
            content += `<div><strong>${it.name}</strong> x ${it.quantity}</div>`;
          });
        });
          
        content += `<hr/><div style="text-align:center">Generated by Restaurant POS</div></body></html>`;
      } else {
        // Detailed format (default)
        content = `<!doctype html><html><head><meta charset="utf-8"><title>${orderNumber}</title><style>
          body {
            font-family: Arial, Helvetica, sans-serif;
            font-size: ${fontSize};
            padding: ${padding};
            max-width: ${maxWidth};
            margin: 0 auto;
            box-sizing: border-box;
          }
          .h {
            text-align: center;
            font-weight: 700;
          }
          hr {
            border: none;
            border-top: 1px dashed #000;
            margin: 5px 0;
          }
          @media print {
            @page {
              size: ${maxWidth} auto;
              margin: 0;
            }
            body {
              width: ${maxWidth};
              max-width: ${maxWidth};
              padding: ${padding};
              margin: 0;
            }
          }
        </style></head><body>` +
          `<div class="h">KITCHEN ORDER TICKET #${kotNumber || 'N/A'}</div>` +
          (department ? `<div style="text-align:center">[${department}]</div>` : "") +
          (isAdditional ? `<div style="text-align:center;font-weight:700;margin:5px 0">*** ADDITIONAL ITEMS ***</div>` : "") +
          `<div>Date: ${now.toLocaleString()}</div>` +
          `<div>Type: Takeaway</div>` +
          `<hr/>` +
          items
            .map((it) => `<div><strong>${it.name}</strong> x ${it.quantity} <span style="float:right">[${it.department || "General"}]</span></div>`)
            .join("") +
          `<hr/><div style="text-align:center">Generated by Restaurant POS</div></body></html>`;
      }
      
      return content;
    },
    [kotConfig]
  );

  // Helper function to auto-print KOT (defined early to avoid hoisting issues)
  const autoPrintKOT = useCallback(async (items: CartItem[]) => {
    if (items.length === 0) return;

    if (kotConfig.printByDepartment) {
      // Group items by department
      const groupedItems: Record<string, CartItem[]> = {};
      items.forEach(item => {
        const dept = item.department || "General";
        if (!groupedItems[dept]) {
          groupedItems[dept] = [];
        }
        groupedItems[dept].push(item);
      });

      // Print separate KOT for each department
      for (const [department, deptItems] of Object.entries(groupedItems)) {
        const popup = window.open("", "_blank", "width=400,height=600");
        if (!popup) continue;

        const paperSize = kotConfig.paperSize || "80mm";
        let windowWidth = 400;
        if (paperSize === "58mm") {
          windowWidth = 300;
        } else if (paperSize === "112mm") {
          windowWidth = 500;
        }

        popup.resizeTo(windowWidth, 600);
        popup.document.write(generateKOTContent(deptItems, true, department));
        popup.document.close();

        const printStyle = popup.document.createElement('style');
        printStyle.innerHTML = `
          @media print {
            @page {
              size: ${paperSize === "58mm" ? "58mm" : paperSize === "112mm" ? "112mm" : "80mm"} auto;
              margin: 0;
            }
            body {
              width: ${paperSize === "58mm" ? "58mm" : paperSize === "112mm" ? "112mm" : "80mm"};
              margin: 0;
              padding: 0;
            }
          }
        `;
        popup.document.head.appendChild(printStyle);

        setTimeout(() => {
          popup.print();
          popup.close();
        }, 200);

        await new Promise(resolve => setTimeout(resolve, 500));
      }
    } else {
      // Print single KOT for all items
      const popup = window.open("", "_blank", "width=400,height=600");
      if (!popup) return;

      const paperSize = kotConfig.paperSize || "80mm";
      let windowWidth = 400;
      if (paperSize === "58mm") {
        windowWidth = 300;
      } else if (paperSize === "112mm") {
        windowWidth = 500;
      }

      popup.resizeTo(windowWidth, 600);
      popup.document.write(generateKOTContent(items, true));
      popup.document.close();

      const printStyle = popup.document.createElement('style');
      printStyle.innerHTML = `
        @media print {
          @page {
            size: ${paperSize === "58mm" ? "58mm" : paperSize === "112mm" ? "112mm" : "80mm"} auto;
            margin: 0;
          }
          body {
            width: ${paperSize === "58mm" ? "58mm" : paperSize === "112mm" ? "112mm" : "80mm"};
            margin: 0;
            padding: 0;
          }
        }
      `;
      popup.document.head.appendChild(printStyle);

      setTimeout(() => {
        popup.print();
        popup.close();
      }, 200);
    }
  }, [kotConfig, generateKOTContent]);

  const addToOrder = useCallback((item: MenuItem) => {
    console.log('Adding item to order:', item);
    
    setCurrentOrder((prev) => {
      // Check if we already have this item in the current order
      const existingIndex = prev.findIndex((p) => p.id === item.id);
      
      if (existingIndex !== -1) {
        // Update quantity of existing item
        const updated = [...prev];
        updated[existingIndex] = { ...updated[existingIndex], quantity: updated[existingIndex].quantity + 1 };
        console.log('Updated existing item, new order:', updated);
        return updated;
      }
      
      // Add new item
      const orderItem: CartItem = { 
        id: item.id,
        name: item.name,
        price: item.price,
        quantity: 1, 
        sentToKitchen: false,
        department: item.department
      };
      const newOrder = [...prev, orderItem];
      console.log('Added new item, new order:', newOrder);
      return newOrder;
    });
  }, []);

  const updateQuantity = useCallback((id: string, delta: number) => {
    setCurrentOrder((prev) =>
      prev
        .map((it) => (it.id === id ? { ...it, quantity: Math.max(0, it.quantity + delta) } : it))
        .filter((it) => it.quantity > 0)
    );
  }, []);

  const removeFromOrder = useCallback((id: string) => {
    setCurrentOrder((prev) => prev.filter((it) => it.id !== id));
  }, []);

  const clearOrder = useCallback(() => {
    setCurrentOrder([]);
    setSearchQuery("");
  }, []);

  const printKOT = useCallback(
    async (items: CartItem[], isAdditional = false, kotNumber?: number) => {
      const popup = window.open("", "_blank", "width=400,height=600");
      if (!popup) return;
      
      // Get paper size from context
      const paperSize = kotConfig.paperSize || "80mm";
      
      // Set width based on paper size
      let windowWidth = 400;
      if (paperSize === "58mm") {
        windowWidth = 300;
      } else if (paperSize === "112mm") {
        windowWidth = 500;
      }
      
      // Resize window to match paper size
      popup.resizeTo(windowWidth, 600);
      
      popup.document.write(generateKOTContent(items, isAdditional, undefined, kotNumber));
      popup.document.close();
      
      // Add print-specific styling
      const printStyle = popup.document.createElement('style');
      printStyle.innerHTML = `
        @media print {
          @page {
            size: ${paperSize === "58mm" ? "58mm" : paperSize === "112mm" ? "112mm" : "80mm"} auto;
            margin: 0;
          }
          body {
            width: ${paperSize === "58mm" ? "58mm" : paperSize === "112mm" ? "112mm" : "80mm"};
            margin: 0;
            padding: 0;
          }
        }
      `;
      popup.document.head.appendChild(printStyle);
      
      setTimeout(() => {
        popup.print();
        popup.close();
      }, 200);
    },
    [generateKOTContent, kotConfig]
  );

  const printKOTByDepartment = useCallback(
    async (items: CartItem[], isAdditional = false, kotNumber?: number) => {
      // Group items by department
      const groupedItems: Record<string, CartItem[]> = {};
      items.forEach(item => {
        const dept = item.department || "General";
        if (!groupedItems[dept]) {
          groupedItems[dept] = [];
        }
        groupedItems[dept].push(item);
      });

      // Print separate KOT for each department
      for (const [department, deptItems] of Object.entries(groupedItems)) {
        const popup = window.open("", "_blank", "width=400,height=600");
        if (!popup) continue;

        const paperSize = kotConfig.paperSize || "80mm";
        let windowWidth = 400;
        if (paperSize === "58mm") {
          windowWidth = 300;
        } else if (paperSize === "112mm") {
          windowWidth = 500;
        }

        popup.resizeTo(windowWidth, 600);
        popup.document.write(generateKOTContent(deptItems, isAdditional, department, kotNumber));
        popup.document.close();

        const printStyle = popup.document.createElement('style');
        printStyle.innerHTML = `
          @media print {
            @page {
              size: ${paperSize === "58mm" ? "58mm" : paperSize === "112mm" ? "112mm" : "80mm"} auto;
              margin: 0;
            }
            body {
              width: ${paperSize === "58mm" ? "58mm" : paperSize === "112mm" ? "112mm" : "80mm"};
              margin: 0;
              padding: 0;
            }
          }
        `;
        popup.document.head.appendChild(printStyle);

        setTimeout(() => {
          popup.print();
          popup.close();
        }, 200);

        // Add delay between multiple prints
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    },
    [generateKOTContent, kotConfig]
  );

  const generateBillContent = useCallback(() => {
    const now = new Date();
    const billNumber = `BILL-${Date.now()}`;
    const items = getAllCombinedItems();
    const sub = items.reduce((s, i) => s + i.price * i.quantity, 0);
    const taxRate = restaurantSettings?.taxRate || 0.0;
    const t = sub * (taxRate / 100);
    const tot = sub + t;
    
    // Get paper size and format from context
    const paperSize = billConfig.paperSize || "80mm";
    const formatType = billConfig.formatType || "standard";
    
    // Adjust styling based on paper size
    let fontSize = "12px";
    let padding = "8px";
    let maxWidth = "80mm";
    
    if (paperSize === "58mm") {
      fontSize = "10px";
      padding = "5px";
      maxWidth = "58mm";
    } else if (paperSize === "112mm") {
      fontSize = "14px";
      padding = "12px";
      maxWidth = "112mm";
    }
    
    let content = "";
    
    if (formatType === "compact") {
      // Compact bill format
      content = `<!doctype html><html><head><meta charset="utf-8"><title>${billNumber}</title><style>
        body {
          font-family: Arial, Helvetica, sans-serif;
          font-size: ${fontSize};
          padding: ${padding};
          max-width: ${maxWidth};
          margin: 0 auto;
          box-sizing: border-box;
        }
        hr {
          border: none;
          border-top: 1px dashed #000;
          margin: 5px 0;
        }
        @media print {
          @page {
            size: ${maxWidth} auto;
            margin: 0;
          }
          body {
            width: ${maxWidth};
            max-width: ${maxWidth};
            padding: ${padding};
            margin: 0;
          }
        }
      </style></head><body>` +
        `<div style="text-align:center;font-weight:700">TAX INVOICE</div>` +
        (restaurantSettings ? `<div style="text-align:center;font-weight:700;margin-top:5px">${restaurantSettings.restaurantName}</div>` : '') +
        (restaurantSettings?.address ? `<div style="text-align:center;font-size:${fontSize === '10px' ? '9px' : fontSize === '14px' ? '12px' : '11px'}">${restaurantSettings.address}</div>` : '') +
        (restaurantSettings?.phone ? `<div style="text-align:center;font-size:${fontSize === '10px' ? '9px' : fontSize === '14px' ? '12px' : '11px'}">Ph: ${restaurantSettings.phone}</div>` : '') +
        (restaurantSettings?.email ? `<div style="text-align:center;font-size:${fontSize === '10px' ? '9px' : fontSize === '14px' ? '12px' : '11px'}">Email: ${restaurantSettings.email}</div>` : '') +
        `<hr/>` +
        `<div>Bill: ${billNumber}</div><div>${now.toLocaleString()}</div>` +
        `<div>Type: Takeaway</div>` +
        `<hr/>` +
        items.map(i => `<div>${i.name} (${i.quantity} x ₹${i.price.toFixed(2)}) ₹${(i.quantity * i.price).toFixed(2)}</div>`).join("") +
        `<hr/>` +
        `<div>Subtotal: ₹${sub.toFixed(2)}</div>` +
        `<div>GST (${taxRate}%): ₹${t.toFixed(2)}</div>` +
        `<div style="font-weight:700">TOTAL: ₹${tot.toFixed(2)}</div>` +
        `</body></html>`;
    } else if (formatType === "detailed") {
      // Detailed bill format
      content = `<!doctype html><html><head><meta charset="utf-8"><title>${billNumber}</title><style>
        body {
          font-family: Arial, Helvetica, sans-serif;
          font-size: ${fontSize};
          padding: ${padding};
          max-width: ${maxWidth};
          margin: 0 auto;
          box-sizing: border-box;
        }
        hr {
          border: none;
          border-top: 1px dashed #000;
          margin: 5px 0;
        }
        @media print {
          @page {
            size: ${maxWidth} auto;
            margin: 0;
          }
          body {
            width: ${maxWidth};
            max-width: ${maxWidth};
            padding: ${padding};
            margin: 0;
          }
        }
      </style></head><body>` +
        `<div style="text-align:center;font-weight:700">TAX INVOICE</div>` +
        (restaurantSettings ? `<div style="text-align:center;font-weight:700;margin-top:5px">${restaurantSettings.restaurantName}</div>` : '') +
        (restaurantSettings?.address ? `<div style="text-align:center;font-size:${fontSize === '10px' ? '9px' : fontSize === '14px' ? '12px' : '11px'}">${restaurantSettings.address}</div>` : '') +
        (restaurantSettings?.phone ? `<div style="text-align:center;font-size:${fontSize === '10px' ? '9px' : fontSize === '14px' ? '12px' : '11px'}">Ph: ${restaurantSettings.phone}</div>` : '') +
        (restaurantSettings?.email ? `<div style="text-align:center;font-size:${fontSize === '10px' ? '9px' : fontSize === '14px' ? '12px' : '11px'}">Email: ${restaurantSettings.email}</div>` : '') +
        `<hr/>` +
        `<div>Bill No: ${billNumber}</div><div>Date: ${now.toLocaleString()}</div>` +
        `<div>Type: Takeaway</div>` +
        `<hr/>` +
        items.map(i => `<div>${i.name} (${i.quantity} x ₹${i.price.toFixed(2)}) <span style="float:right">₹${(i.quantity * i.price).toFixed(2)}</span></div>`).join("") +
        `<hr/>` +
        `<div>Subtotal <span style="float:right">₹${sub.toFixed(2)}</span></div>` +
        `<div>GST (${taxRate}%) <span style="float:right">₹${t.toFixed(2)}</span></div>` +
        `<div style="font-weight:700">TOTAL <span style="float:right">₹${tot.toFixed(2)}</span></div>` +
        `</body></html>`;
    } else {
      // Standard bill format (default)
      content = `<!doctype html><html><head><meta charset="utf-8"><title>${billNumber}</title><style>
        body {
          font-family: Arial, Helvetica, sans-serif;
          font-size: ${fontSize};
          padding: ${padding};
          max-width: ${maxWidth};
          margin: 0 auto;
          box-sizing: border-box;
        }
        hr {
          border: none;
          border-top: 1px dashed #000;
          margin: 5px 0;
        }
        @media print {
          @page {
            size: ${maxWidth} auto;
            margin: 0;
          }
          body {
            width: ${maxWidth};
            max-width: ${maxWidth};
            padding: ${padding};
            margin: 0;
          }
        }
      </style></head><body>` +
        `<div style="text-align:center;font-weight:700">TAX INVOICE</div>` +
        (restaurantSettings ? `<div style="text-align:center;font-weight:700;margin-top:5px">${restaurantSettings.restaurantName}</div>` : '') +
        (restaurantSettings?.address ? `<div style="text-align:center;font-size:${fontSize === '10px' ? '9px' : fontSize === '14px' ? '12px' : '11px'}">${restaurantSettings.address}</div>` : '') +
        (restaurantSettings?.phone ? `<div style="text-align:center;font-size:${fontSize === '10px' ? '9px' : fontSize === '14px' ? '12px' : '11px'}">Ph: ${restaurantSettings.phone}</div>` : '') +
        (restaurantSettings?.email ? `<div style="text-align:center;font-size:${fontSize === '10px' ? '9px' : fontSize === '14px' ? '12px' : '11px'}">Email: ${restaurantSettings.email}</div>` : '') +
        `<hr/>` +
        `<div>Bill No: ${billNumber}</div><div>Date: ${now.toLocaleString()}</div>` +
        `<div>Type: Takeaway</div>` +
        `<hr/>` +
        items.map(i => `<div>${i.name} (${i.quantity} x ₹${i.price.toFixed(2)}) <span style="float:right">₹${(i.quantity * i.price).toFixed(2)}</span></div>`).join("") +
        `<hr/>` +
        `<div>Subtotal <span style="float:right">₹${sub.toFixed(2)}</span></div>` +
        `<div>GST (${taxRate}%) <span style="float:right">₹${t.toFixed(2)}</span></div>` +
        `<div style="font-weight:700">TOTAL <span style="float:right">₹${tot.toFixed(2)}</span></div>` +
        `</body></html>`;
    }
    
    return content;
  }, [getAllCombinedItems, billConfig, restaurantSettings]);

  const printBill = useCallback(() => {
    const popup = window.open("", "_blank", "width=400,height=600");
    if (!popup) return;
    
    // Get paper size from context
    const paperSize = billConfig.paperSize || "80mm";
    
    // Set width based on paper size
    let windowWidth = 400;
    if (paperSize === "58mm") {
      windowWidth = 300;
    } else if (paperSize === "112mm") {
      windowWidth = 500;
    }
    
    // Resize window to match paper size
    popup.resizeTo(windowWidth, 600);
    
    popup.document.write(generateBillContent());
    popup.document.close();
    
    // Add print-specific styling
    const printStyle = popup.document.createElement('style');
    printStyle.innerHTML = `
      @media print {
        @page {
          size: ${paperSize === "58mm" ? "58mm" : paperSize === "112mm" ? "112mm" : "80mm"} auto;
          margin: 0;
        }
        body {
          width: ${paperSize === "58mm" ? "58mm" : paperSize === "112mm" ? "112mm" : "80mm"};
          margin: 0;
          padding: 0;
        }
      }
    `;
    popup.document.head.appendChild(printStyle);
    
    setTimeout(() => {
      popup.print();
      popup.close();
    }, 200);
  }, [generateBillContent, billConfig]);

  const placeOrder = useCallback(async () => {
    const pending = getPendingItems();
    
    // Check if we have a selected pending order (recalled order)
    if (selectedPendingOrder) {
      // If there are new items to add, print KOT for them and update the pending order
      if (pending.length > 0) {
        try {
          // Get next KOT number from backend
          const response = await api.getNextKOTNumber();
          const kotNumber = response.kotNumber;

          // Print KOT for new items only with KOT number
          if (kotConfig.printByDepartment) {
            await printKOTByDepartment(pending, false, kotNumber);
          } else {
            await printKOT(pending, false, kotNumber);
          }
        } catch (error) {
          console.error('Error getting KOT number:', error);
          // Continue even if KOT number fails
          if (kotConfig.printByDepartment) {
            await autoPrintKOT(pending);
          } else {
            await printKOT(pending, false);
          }
        }
        
        // Update printed quantities in current order
        setCurrentOrder((prev) => prev.map(item => ({
          ...item,
          printedQuantity: item.quantity  // Mark current quantity as printed
        })));
        
        // Merge items: combine quantities for same items, add new items
        const mergedItemsMap = new Map<string, CartItem>();
        
        // First, add all items from the recalled order
        selectedPendingOrder.items.forEach(item => {
          mergedItemsMap.set(item.id, { ...item });
        });
        
        // Then, merge current order items (increase quantities or add new)
        currentOrder.forEach(currentItem => {
          const existing = mergedItemsMap.get(currentItem.id);
          if (existing) {
            // Item exists - update quantity to match current order
            existing.quantity = currentItem.quantity;
          } else {
            // New item - add it
            mergedItemsMap.set(currentItem.id, { ...currentItem });
          }
        });
        
        const mergedItems = Array.from(mergedItemsMap.values());
        
        // Calculate totals with dynamic tax rate
        const mergedSubtotal = mergedItems.reduce((s, i) => s + i.price * i.quantity, 0);
        const taxRate = restaurantSettings?.taxRate || 0.0;
        const mergedTax = mergedSubtotal * (taxRate / 100);
        const mergedTotal = mergedSubtotal + mergedTax;
        
        // Update the selected pending order with merged items
        const updatedOrder = {
          ...selectedPendingOrder,
          items: mergedItems,
          subtotal: mergedSubtotal,
          tax: mergedTax,
          total: mergedTotal
        };
        
        // Update the pending orders list
        setPendingOrders(prev => prev.map(order => 
          order.id === selectedPendingOrder.id ? updatedOrder : order
        ));
        
        setSelectedPendingOrder(updatedOrder);
        
        // Update current order to show the merged items in cart
        setCurrentOrder(mergedItems);
      } else {
        // No new items to add
        alert("No new items to place order.");
        return;
      }
      
      alert("Items added to held order.");
      return;
    }
    
    // Normal flow: no recalled order
    if (!pending.length) {
      alert("No new items to place order.");
      return;
    }

    try {
      // Get next KOT number from backend
      const response = await api.getNextKOTNumber();
      const kotNumber = response.kotNumber;

      // Print KOT when placing order with KOT number
      if (kotConfig.printByDepartment) {
        await printKOTByDepartment(pending, false, kotNumber);
      } else {
        await printKOT(pending, false, kotNumber);
      }
    } catch (error) {
      console.error('Error getting KOT number:', error);
      // Continue even if KOT number fails
      if (kotConfig.printByDepartment) {
        await autoPrintKOT(pending);
      } else {
        await printKOT(pending, false);
      }
    }
    
    // Update printed quantities in current order
    setCurrentOrder((prev) => prev.map(item => ({
      ...item,
      printedQuantity: item.quantity  // Mark current quantity as printed
    })));
    
    // Generate invoice number for pending order
    const invoiceNumber = `INV-${Date.now()}`;
    
    // Store the order as pending (without generating invoice yet)
    // Use currentOrder for totals calculation to include all items
    const orderItems = currentOrder.map(item => ({
      ...item,
      printedQuantity: item.quantity  // Mark as printed
    }));
    
    const orderSubtotal = orderItems.reduce((s, i) => s + i.price * i.quantity, 0);
    const taxRate = restaurantSettings?.taxRate || 0.0;
    const orderTax = orderSubtotal * (taxRate / 100);
    const orderTotal = orderSubtotal + orderTax;
    
    const newPendingOrder: PendingOrder = {
      id: `PENDING-${Date.now()}`,
      invoiceNumber,
      items: orderItems,
      subtotal: orderSubtotal,
      tax: orderTax,
      total: orderTotal,
      timestamp: new Date()
    };
    
    setPendingOrders(prev => [...prev, newPendingOrder]);
    
    // Clear current order after placing it
    setCurrentOrder([]);
    
    // Show dialog to ask user whether to generate bill or hold
    setShowHoldDialog(true);
  }, [getPendingItems, currentOrder, selectedPendingOrder, kotConfig, autoPrintKOT, printKOT, printKOTByDepartment, restaurantSettings]);

  const holdOrder = useCallback(() => {
    clearOrder();
    setShowHoldDialog(false);
    alert("Order held. You can recall it later using the Recall button.");
  }, [clearOrder]);

  const generateBillNow = useCallback(async () => {
    if (pendingOrders.length === 0) return;
    
    // Get the most recent pending order
    const mostRecentOrder = pendingOrders[pendingOrders.length - 1];
    
    // Set it as selected pending order and show bill dialog
    setSelectedPendingOrder(mostRecentOrder);
    setCurrentOrder([...mostRecentOrder.items]);
    setShowHoldDialog(false);
    setShowBillDialog(true);
  }, [pendingOrders]);

  const completeBill = useCallback(async () => {
    if (!selectedPendingOrder) return;
    
    const invoice = {
      id: Date.now().toString(),
      billNumber: `BILL-${Date.now()}`,
      orderType: "takeaway",
      items: selectedPendingOrder.items,
      subtotal: selectedPendingOrder.subtotal,
      tax: selectedPendingOrder.tax,
      total: selectedPendingOrder.total,
      timestamp: new Date(),
    } as any;

    await addInvoice(invoice);
    
    // Remove the pending order from the list
    setPendingOrders(prev => prev.filter(order => order.id !== selectedPendingOrder.id));
    
    // Clear the selected pending order and current order
    setSelectedPendingOrder(null);
    setCurrentOrder([]);
    setShowBillDialog(false);
    
    alert("Bill generated and order completed.");
  }, [selectedPendingOrder, addInvoice]);

  const recallOrder = useCallback((order: PendingOrder) => {
    setCurrentOrder([...order.items]);
    setSelectedPendingOrder(order);
    setShowRecallDialog(false);
    alert(`Order ${order.invoiceNumber} recalled. You can now modify or generate a bill for this order.`);
  }, []);

  // Determine if cart should be visible
  const isCartVisible = currentOrder.length > 0 || selectedPendingOrder !== null;

  return (
    <>
      {/* Main Content Area - accounts for cart width, no gap */}
      <div 
        className="h-full overflow-y-auto"
        style={{ 
          width: isCartVisible ? 'calc(100% - 420px)' : '100%',
          transition: 'width 0.3s ease',
          marginRight: 0,
          paddingRight: 0
        }}
      >
        <div className="p-6">
          <div className="mb-6">
            <h2 className="text-gray-900 mb-2">Takeaway Order</h2>
            <p className="text-muted-foreground">Select items for takeaway order</p>
          </div>

          {/* Search bar and Recall button in the same row */}
          <div className="mb-6 flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input 
                value={searchQuery} 
                onChange={handleSearchChange} 
                placeholder="Search menu items..." 
                className="pl-10 w-full" 
              />
            </div>
            <Button 
              onClick={() => setShowRecallDialog(true)}
              className="text-white font-medium transition-all"
              style={{
                backgroundColor: '#6D9773',
              }}
              onMouseEnter={(e: any) => e.currentTarget.style.backgroundColor = '#5A7F61'}
              onMouseLeave={(e: any) => e.currentTarget.style.backgroundColor = '#6D9773'}
            >
              <RotateCcw className="size-4 mr-2" />
              Recall ({pendingOrders.length})
            </Button>
          </div>

          <div className="flex gap-2 mb-6 flex-wrap">{categories.map((c) => (<Button key={c} variant={selectedCategory === c ? "default" : "outline"} onClick={() => handleCategorySelect(c)}>{c}</Button>))}</div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredItems.length === 0 && (<div className="col-span-full text-center py-12 text-gray-500"><Search className="size-12 mx-auto mb-4 opacity-20" /><p>No items found</p></div>)}

            {filteredItems.map((item) => (
              <Card key={item.id} className="bg-white border-2 rounded-lg overflow-hidden hover:shadow-lg transition-shadow" style={{ borderColor: '#6D9773' }}>
                <CardHeader className="p-4"><div className="space-y-2"><div className="flex justify-between items-start"><div><CardTitle className="text-lg font-semibold">{item.name}</CardTitle><p className="text-sm text-gray-500">{item.category}</p></div><p className="text-lg font-bold" style={{ color: '#0C3B2E' }}>₹{item.price}</p></div><p className="text-sm text-gray-500">{item.description}</p></div></CardHeader>
                <CardContent className="p-4 pt-0">
                  <Button 
                    onClick={() => {
                      console.log('Button clicked for item:', item);
                      addToOrder(item);
                    }}
                    variant="default"
                    type="button"
                    className="w-full border-0 text-white font-medium transition-all"
                    style={{ backgroundColor: '#6D9773', cursor: 'pointer' }}
                    onMouseEnter={(e: any) => e.currentTarget.style.backgroundColor = '#5A7F61'}
                    onMouseLeave={(e: any) => e.currentTarget.style.backgroundColor = '#6D9773'}
                  >
                    <Plus className="size-4 mr-2" /> Add to Order
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Cart Sidebar - Fixed at viewport level, same height as side nav */}
      {isCartVisible && (
        <aside 
          className="w-[420px] bg-white flex flex-col shadow-2xl"
          style={{ 
            position: 'fixed',
            top: '0',
            right: '0',
            width: '420px',
            height: '100vh',
            backgroundColor: '#ffffff',
            zIndex: 30,
            borderLeft: '2px solid #e5e7eb'
          }}
        >
          {/* Cart Header - Fixed, no scroll */}
          <header className="px-8 py-5 border-b-2 flex-shrink-0 bg-white pt-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-semibold">
                  {selectedPendingOrder ? `Order: ${selectedPendingOrder.invoiceNumber}` : "Current Order"}
                </h3>
                {selectedPendingOrder && (
                  <div className="flex items-center gap-2 mt-1">
                    <Clock className="size-3 text-gray-500" />
                    <p className="text-xs text-gray-500">
                      Placed: {formatTimeAgo(selectedPendingOrder.timestamp)} ago
                    </p>
                  </div>
                )}
                <p className="text-sm text-gray-500 mt-1">
                  {getAllCombinedItems().length} {getAllCombinedItems().length === 1 ? 'item' : 'items'}
                </p>
              </div>
              <div>
                {getAllCombinedItems().length > 0 ? (
                  <div className="flex items-center gap-2">
                    <ShoppingCart className="size-6" style={{ color: '#0C3B2E' }} />
                    <span className="text-xs font-medium px-2 py-1 rounded-full" style={{ backgroundColor: '#6D977320', color: '#0C3B2E' }}>
                      {getAllCombinedItems().length}
                    </span>
                  </div>
                ) : (
                  <ShoppingCart className="size-6 text-gray-400" />
                )}
              </div>
            </div>
          </header>

          {/* Cart Items - Scrollable section only */}
          <div className="flex-1 overflow-y-auto min-h-0" style={{ overflowY: 'auto' }}>
            <div className="px-8 py-5 space-y-4">
              {currentOrder.length === 0 && (!selectedPendingOrder || selectedPendingOrder.items.length === 0) ? (
                <div className="text-center py-10 text-gray-500">
                  <ShoppingCart className="size-16 mx-auto mb-4 text-gray-300" />
                  <div>No items in order</div>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Display all current order items */}
                  {getAllCombinedItems().map((it, idx) => (
                      <div key={`${it.id}-${idx}`} className="flex items-start justify-between p-5 border-2 border-gray-200 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold text-lg mb-3">{it.name}</div>
                          <div className="flex items-center gap-4">
                            <div className="flex items-center gap-3">
                              <Button variant="outline" size="sm" onClick={() => updateQuantity(it.id, -1)} className="h-9 w-18 text-base font-bold">
                                -
                              </Button>
                              <div className="w-12 text-center font-semibold text-lg">{it.quantity}</div>
                              <Button variant="outline" size="sm" onClick={() => updateQuantity(it.id, 1)} className="h-9 w-18 text-base font-bold">
                                +
                              </Button>
                            </div>
                            <div className="ml-auto font-bold text-lg" style={{ color: '#0C3B2E' }}>
                              ₹{(it.price * it.quantity).toFixed(2)}
                            </div>
                          </div>
                        </div>
                        <div className="ml-4">
                          <Button variant="ghost" size="sm" onClick={() => removeFromOrder(it.id)} className="text-red-500 hover:text-red-700 hover:bg-red-50 h-9 w-9">
                            <Trash2 className="size-5" />
                          </Button>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>
          </div>

          {/* Cart Footer - Fixed, no scroll */}
          <div className="border-t-2 px-8 py-5 flex-shrink-0 bg-white">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Subtotal</span>
                <span>₹{subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>GST (5%)</span>
                <span>₹{tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-base font-semibold pt-2 border-t">
                <span>Total</span>
                <span style={{ color: '#0C3B2E' }}>₹{total.toFixed(2)}</span>
              </div>
            </div>

            <div className="mt-4 space-y-2 mb-6">
              <Button 
                onClick={placeOrder} 
                disabled={getPendingItems().length === 0} 
                className="w-full text-white font-medium transition-all"
                style={{ backgroundColor: '#6D9773' }}
                onMouseEnter={(e: any) => !e.currentTarget.disabled && (e.currentTarget.style.backgroundColor = '#5A7F61')}
                onMouseLeave={(e: any) => !e.currentTarget.disabled && (e.currentTarget.style.backgroundColor = '#6D9773')}
              >
                Place Order
              </Button>
              
              {selectedPendingOrder && (
                <Button 
                  onClick={() => setShowBillDialog(true)} 
                  variant="outline" 
                  className="w-full"
                  style={{ borderColor: '#6D9773', color: '#0C3B2E' }}
                >
                  Generate Bill
                </Button>
              )}
              
              {selectedPendingOrder && (
                <Button 
                  onClick={() => {
                    setSelectedPendingOrder(null);
                    setCurrentOrder([]);
                  }} 
                  variant="outline" 
                  className="w-full"
                >
                  Start New Order
                </Button>
              )}
            </div>
          </div>
        </aside>
      )}

      {/* Recall Orders Dialog */}
      <Dialog open={showRecallDialog} onOpenChange={setShowRecallDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Recall Orders</DialogTitle>
            <DialogDescription>Select an order to recall</DialogDescription>
          </DialogHeader>
          <div className="py-4 max-h-60 overflow-y-auto">
            {pendingOrders.length === 0 ? (
              <p className="text-center text-gray-500">No pending orders</p>
            ) : (
              <div className="space-y-2">
                {pendingOrders.map((order) => (
                  <div 
                    key={order.id} 
                    className="p-3 border rounded-lg cursor-pointer hover:bg-gray-100"
                    onClick={() => recallOrder(order)}
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-semibold">{order.invoiceNumber}</span>
                      <span className="text-sm text-gray-500">
                        ₹{order.total.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                      <Clock className="size-3" />
                      <span>{formatTimeAgo(order.timestamp)} ago</span>
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {formatDateTime(order.timestamp)}
                    </div>
                    <div className="text-sm text-gray-600 mt-1">
                      {order.items.length} items
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Hold or Generate Bill Dialog */}
      <Dialog open={showHoldDialog} onOpenChange={setShowHoldDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Order Placed</DialogTitle>
            <DialogDescription>What would you like to do with this order?</DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <p className="text-center">KOT has been generated. Would you like to generate the bill now or hold the order?</p>
            <div className="flex gap-2">
              <Button 
                onClick={holdOrder}
                variant="outline"
                className="flex-1"
              >
                Hold Order
              </Button>
              <Button 
                onClick={generateBillNow}
                className="flex-1 text-white font-medium transition-all"
                style={{ backgroundColor: '#6D9773' }}
                onMouseEnter={(e: any) => e.currentTarget.style.backgroundColor = '#5A7F61'}
                onMouseLeave={(e: any) => e.currentTarget.style.backgroundColor = '#6D9773'}
              >
                Generate Bill
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Generate Bill Dialog */}
      <Dialog open={showBillDialog} onOpenChange={setShowBillDialog}>
        <DialogContent className="max-w-md max-h-[80vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle>Generate Bill</DialogTitle>
            <DialogDescription>Review order details before completing</DialogDescription>
          </DialogHeader>
          <div className="py-4 overflow-y-auto flex-1">
            {selectedPendingOrder && (
              <>
                {/* Restaurant Details */}
                {restaurantSettings && (
                  <div className="mb-4 p-3 bg-gradient-to-r from-green-50 to-green-100 rounded-lg border-2 border-green-200">
                    <div className="text-center">
                      <div className="font-bold text-lg" style={{ color: '#0C3B2E' }}>
                        {restaurantSettings.restaurantName}
                      </div>
                      {restaurantSettings.address && (
                        <div className="text-xs text-gray-600 mt-1">
                          {restaurantSettings.address}
                        </div>
                      )}
                      {restaurantSettings.phone && (
                        <div className="text-xs text-gray-600">
                          Phone: {restaurantSettings.phone}
                        </div>
                      )}
                      {restaurantSettings.email && (
                        <div className="text-xs text-gray-600">
                          Email: {restaurantSettings.email}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Order Info */}
                <div className="mb-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                    <Clock className="size-4" />
                    <span>Order Time: {formatDateTime(selectedPendingOrder.timestamp)}</span>
                  </div>
                  <div className="text-xs text-gray-500 ml-6">
                    Duration: {formatTimeAgo(selectedPendingOrder.timestamp)}
                  </div>
                  <div className="text-sm font-semibold mt-2">
                    Invoice: {selectedPendingOrder.invoiceNumber}
                  </div>
                </div>

                {/* Items List */}
                <div className="mb-4">
                  <div className="font-semibold mb-2 text-sm">Order Items:</div>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {selectedPendingOrder.items.map((item, idx) => (
                      <div key={`${item.id}-${idx}`} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                        <div className="flex-1">
                          <div className="font-medium text-sm">{item.name}</div>
                          <div className="text-xs text-gray-500">
                            {item.quantity} × ₹{item.price.toFixed(2)}
                          </div>
                        </div>
                        <div className="font-semibold text-sm">
                          ₹{(item.quantity * item.price).toFixed(2)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Bill Summary */}
                <div className="border-t pt-3 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Subtotal:</span>
                    <span>₹{selectedPendingOrder.subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>GST ({restaurantSettings?.taxRate || 0}%):</span>
                    <span>₹{selectedPendingOrder.tax.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-base pt-2 border-t">
                    <span>Total Amount:</span>
                    <span style={{ color: '#0C3B2E' }}>₹{selectedPendingOrder.total.toFixed(2)}</span>
                  </div>
                </div>
              </>
            )}
            <div className="text-xs text-gray-500 mt-4">
              Bill will be generated at: {formatDateTime(new Date())}
            </div>
          </div>
          <div className="flex gap-2 pt-4 border-t">
            <Button 
              onClick={() => { 
                printBill(); 
                completeBill(); 
              }} 
              className="flex-1 text-white font-medium transition-all"
              style={{ backgroundColor: '#6D9773' }}
              onMouseEnter={(e: any) => e.currentTarget.style.backgroundColor = '#5A7F61'}
              onMouseLeave={(e: any) => e.currentTarget.style.backgroundColor = '#6D9773'}
            > 
              <Printer className="mr-2" /> Print & Complete
            </Button>
            <Button 
              onClick={completeBill} 
              variant="outline" 
              className="flex-1"
              style={{ borderColor: '#6D9773', color: '#0C3B2E' }}
            >
              Complete Without Printing
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};