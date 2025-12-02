// API Base URL for Java Spring Boot backend
const API_BASE_URL = 'http://localhost:8080/api';
console.log('API_BASE_URL:', API_BASE_URL);

export interface Table {
  id: string;
  name: string;
  seats: number;
  category: string;
  status: "available" | "occupied";
}

export interface OrderItem {
  id: string;
  name: string;
  price: number;
  category: string;
  department: string;
  quantity: number;
  sentToKitchen?: boolean;
}

export interface TableOrder {
  tableId: string;
  tableName: string;
  items: OrderItem[];
  startTime: string;
}

export interface Invoice {
  id: string;
  billNumber: string;
  orderType: "dine-in" | "takeaway";
  tableName?: string;
  items: OrderItem[];
  subtotal: number;
  tax: number;
  total: number;
  timestamp: string;
}

export interface KOTConfig {
  printByDepartment: boolean;
  numberOfCopies: number;
  selectedPrinter?: string | null;
  paperSize?: string | null;
  formatType?: string | null;
}

export interface BillConfig {
  autoPrintDineIn: boolean;
  autoPrintTakeaway: boolean;
  selectedPrinter?: string | null;
  paperSize?: string | null;
  formatType?: string | null;
}

// Table API
export const getTables = async (): Promise<Table[]> => {
  try {
    console.log('getTables: Fetching from:', `${API_BASE_URL}/tables`);
    const response = await fetch(`${API_BASE_URL}/tables`);
    console.log('getTables: Response status:', response.status);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    console.log('getTables: Success, received', data.length, 'tables');
    return data;
  } catch (error) {
    console.error('getTables: Error:', error);
    throw error;
  }
};

export const createTable = async (table: Omit<Table, 'id'>): Promise<Table> => {
  const response = await fetch(`${API_BASE_URL}/tables`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      name: table.name,
      seats: table.seats,
      category: table.category,
      status: table.status,
    }),
  });
  return response.json();
};

export const updateTable = async (tableId: string, table: Partial<Table>): Promise<Table> => {
  const response = await fetch(`${API_BASE_URL}/tables/${tableId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(table),
  });
  return response.json();
};

export const deleteTable = async (tableId: string): Promise<void> => {
  await fetch(`${API_BASE_URL}/tables/${tableId}`, {
    method: 'DELETE',
  });
};

// Order API
export const getTableOrder = async (tableId: string): Promise<TableOrder | null> => {
  const response = await fetch(`${API_BASE_URL}/orders/table/${tableId}`);
  return response.json();
};

export const addItemsToTable = async (tableId: string, tableName: string, items: OrderItem[]): Promise<TableOrder> => {
  const response = await fetch(`${API_BASE_URL}/orders/table/${tableId}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      table_name: tableName,
      items,
    }),
  });
  return response.json();
};

export const markItemsAsSent = async (tableId: string): Promise<TableOrder> => {
  const response = await fetch(`${API_BASE_URL}/orders/table/${tableId}/sent`, {
    method: 'POST',
  });
  return response.json();
};

export const completeTableOrder = async (tableId: string): Promise<void> => {
  await fetch(`${API_BASE_URL}/orders/table/${tableId}/complete`, {
    method: 'POST',
  });
};

// Invoice API
export const getInvoices = async (): Promise<Invoice[]> => {
  const response = await fetch(`${API_BASE_URL}/invoices`);
  return response.json();
};

export const addInvoice = async (invoice: Omit<Invoice, 'id'>): Promise<Invoice> => {
  const response = await fetch(`${API_BASE_URL}/invoices`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      billNumber: invoice.billNumber,
      orderType: invoice.orderType,
      tableName: invoice.tableName,
      items: invoice.items,
      subtotal: invoice.subtotal,
      tax: invoice.tax,
      total: invoice.total,
      timestamp: invoice.timestamp,
    }),
  });
  return response.json();
};

// Config API
export const getKOTConfig = async (): Promise<KOTConfig> => {
  const response = await fetch(`${API_BASE_URL}/config/kot`);
  return response.json();
};

export const updateKOTConfig = async (config: KOTConfig): Promise<KOTConfig> => {
  const response = await fetch(`${API_BASE_URL}/config/kot`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      printByDepartment: config.printByDepartment,
      numberOfCopies: config.numberOfCopies,
      selectedPrinter: config.selectedPrinter,
      paperSize: config.paperSize,
      formatType: config.formatType,
    }),
  });
  return response.json();
};

// KOT Counter API
export const getNextKOTNumber = async (): Promise<{ kotNumber: number }> => {
  const response = await fetch(`${API_BASE_URL}/kot/next-number`);
  return response.json();
};

export const getBillConfig = async (): Promise<BillConfig> => {
  const response = await fetch(`${API_BASE_URL}/config/bill`);
  return response.json();
};

export const updateBillConfig = async (config: BillConfig): Promise<BillConfig> => {
  const response = await fetch(`${API_BASE_URL}/config/bill`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      autoPrintDineIn: config.autoPrintDineIn,
      autoPrintTakeaway: config.autoPrintTakeaway,
      selectedPrinter: config.selectedPrinter,
      paperSize: config.paperSize,
      formatType: config.formatType,
    }),
  });
  return response.json();
};

// Auth API
export const login = async (email: string, password: string): Promise<boolean> => {
  try {
    const response = await fetch(`${API_BASE_URL}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });
    
    // For now, we'll consider any successful response as a successful login
    // In a real application, you would check the response content
    return response.ok;
  } catch (error) {
    console.error("Login error:", error);
    return false;
  }
};

// Menu Item API
export interface MenuItem {
  id: string;
  name: string;
  productCode: string;
  price: number;
  category: string;
  department: string;
  description: string;
}

export const getMenuItems = async (): Promise<MenuItem[]> => {
  const response = await fetch(`${API_BASE_URL}/menu-items`);
  return response.json();
};

export const createMenuItem = async (item: Omit<MenuItem, 'id'>): Promise<MenuItem> => {
  const response = await fetch(`${API_BASE_URL}/menu-items`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(item),
  });
  return response.json();
};

export const updateMenuItem = async (itemId: string, item: Partial<MenuItem>): Promise<MenuItem> => {
  const response = await fetch(`${API_BASE_URL}/menu-items/${itemId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(item),
  });
  return response.json();
};

export const deleteMenuItem = async (itemId: string): Promise<void> => {
  await fetch(`${API_BASE_URL}/menu-items/${itemId}`, {
    method: 'DELETE',
  });
};

// Category API
export interface Category {
  id: string;
  name: string;
}

export const getCategories = async (): Promise<Category[]> => {
  const response = await fetch(`${API_BASE_URL}/categories`);
  return response.json();
};

export const createCategory = async (category: Omit<Category, 'id'>): Promise<Category> => {
  const response = await fetch(`${API_BASE_URL}/categories`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(category),
  });
  return response.json();
};

export const deleteCategory = async (categoryId: string): Promise<void> => {
  await fetch(`${API_BASE_URL}/categories/${categoryId}`, {
    method: 'DELETE',
  });
};

// Department API
export interface Department {
  id: string;
  name: string;
}

export const getDepartments = async (): Promise<Department[]> => {
  const response = await fetch(`${API_BASE_URL}/departments`);
  return response.json();
};

export const createDepartment = async (department: Omit<Department, 'id'>): Promise<Department> => {
  const response = await fetch(`${API_BASE_URL}/departments`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(department),
  });
  return response.json();
};

export const deleteDepartment = async (departmentId: string): Promise<void> => {
  await fetch(`${API_BASE_URL}/departments/${departmentId}`, {
    method: 'DELETE',
  });
};

// Restaurant Settings API
export interface RestaurantSettings {
  id: number;
  restaurantName: string;
  address?: string;
  phone?: string;
  email?: string;
  currency: string;
  taxRate: number;
}

export const getRestaurantSettings = async (): Promise<RestaurantSettings> => {
  const response = await fetch(`${API_BASE_URL}/restaurant-settings`);
  return response.json();
};

export const updateRestaurantSettings = async (settings: Partial<RestaurantSettings>): Promise<RestaurantSettings> => {
  const response = await fetch(`${API_BASE_URL}/restaurant-settings`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(settings),
  });
  return response.json();
};

// Excel Import/Export API
export const downloadMenuTemplate = async (): Promise<Blob> => {
  const response = await fetch(`${API_BASE_URL}/menu/export-template`);
  return response.blob();
};

export const exportMenuData = async (): Promise<Blob> => {
  const response = await fetch(`${API_BASE_URL}/menu/export`);
  return response.blob();
};

export const importMenuData = async (file: File): Promise<{ success: boolean; message: string; stats: any }> => {
  const formData = new FormData();
  formData.append('file', file);
  
  const response = await fetch(`${API_BASE_URL}/menu/import`, {
    method: 'POST',
    body: formData,
  });
  return response.json();
};