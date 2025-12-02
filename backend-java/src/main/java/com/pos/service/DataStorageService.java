package com.pos.service;

import com.pos.model.*;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicLong;
import java.util.stream.Collectors;

@Service
public class DataStorageService {
    
    // In-memory storage
    private final Map<String, Table> tables = new ConcurrentHashMap<>();
    private final Map<String, TableOrder> tableOrders = new ConcurrentHashMap<>();
    private final Map<String, Invoice> invoices = new ConcurrentHashMap<>();
    private final Map<String, MenuItem> menuItems = new ConcurrentHashMap<>();
    private final Map<String, Category> categories = new ConcurrentHashMap<>();
    private final Map<String, Department> departments = new ConcurrentHashMap<>();
    
    private RestaurantSettings restaurantSettings;
    private KOTConfig kotConfig;
    private BillConfig billConfig;
    private KOTCounter kotCounter;
    
    private final AtomicLong orderIdCounter = new AtomicLong(1);
    
    public DataStorageService() {
        // Initialize default configurations
        this.restaurantSettings = new RestaurantSettings();
        this.kotConfig = new KOTConfig();
        this.billConfig = new BillConfig();
        this.kotCounter = new KOTCounter();
        
        // Initialize with some sample data
        initializeSampleData();
    }
    
    private void initializeSampleData() {
        // Sample categories
        Category cat1 = new Category("cat1", "Appetizers");
        Category cat2 = new Category("cat2", "Mains");
        Category cat3 = new Category("cat3", "Desserts");
        Category cat4 = new Category("cat4", "Beverages");
        categories.put(cat1.getId(), cat1);
        categories.put(cat2.getId(), cat2);
        categories.put(cat3.getId(), cat3);
        categories.put(cat4.getId(), cat4);
        
        // Sample departments
        Department dept1 = new Department("dept1", "Kitchen");
        Department dept2 = new Department("dept2", "Bar");
        departments.put(dept1.getId(), dept1);
        departments.put(dept2.getId(), dept2);
        
        // Sample menu items
        MenuItem item1 = new MenuItem("item1", "Chicken Burger", "CB001", 299.0, "Mains", "Kitchen", "Grilled chicken with lettuce and mayo");
        MenuItem item2 = new MenuItem("item2", "French Fries", "FF001", 149.0, "Appetizers", "Kitchen", "Crispy golden fries");
        MenuItem item3 = new MenuItem("item3", "Coca Cola", "CC001", 99.0, "Beverages", "Bar", "Chilled soft drink");
        menuItems.put(item1.getId(), item1);
        menuItems.put(item2.getId(), item2);
        menuItems.put(item3.getId(), item3);
        
        // Sample tables
        Table table1 = new Table("table1", "Table 1", 4, "Indoor", "available");
        Table table2 = new Table("table2", "Table 2", 2, "Indoor", "available");
        Table table3 = new Table("table3", "Table 3", 6, "Outdoor", "available");
        tables.put(table1.getId(), table1);
        tables.put(table2.getId(), table2);
        tables.put(table3.getId(), table3);
    }
    
    // Table operations
    public List<Table> getAllTables() {
        return new ArrayList<>(tables.values());
    }
    
    public Table getTableById(String id) {
        return tables.get(id);
    }
    
    public Table createTable(Table table) {
        if (table.getId() == null || table.getId().isEmpty()) {
            table.setId(generateId());
        }
        tables.put(table.getId(), table);
        return table;
    }
    
    public Table updateTable(String id, Table table) {
        if (tables.containsKey(id)) {
            table.setId(id);
            tables.put(id, table);
            return table;
        }
        return null;
    }
    
    public boolean deleteTable(String id) {
        return tables.remove(id) != null;
    }
    
    // Table Order operations
    public List<TableOrder> getAllTableOrders() {
        return new ArrayList<>(tableOrders.values());
    }
    
    public TableOrder getTableOrderByTableId(String tableId) {
        return tableOrders.values().stream()
                .filter(order -> order.getTableId().equals(tableId))
                .findFirst()
                .orElse(null);
    }
    
    public TableOrder createOrUpdateTableOrder(String tableId, String tableName, List<OrderItem> items) {
        TableOrder existingOrder = getTableOrderByTableId(tableId);
        
        if (existingOrder == null) {
            // Create new order
            TableOrder newOrder = new TableOrder();
            newOrder.setId(orderIdCounter.getAndIncrement());
            newOrder.setTableId(tableId);
            newOrder.setTableName(tableName);
            newOrder.setItems(new ArrayList<>(items));
            newOrder.setStartTime(LocalDateTime.now());
            tableOrders.put(tableId, newOrder);
            
            // Update table status
            Table table = tables.get(tableId);
            if (table != null) {
                table.setStatus("occupied");
            }
            
            return newOrder;
        } else {
            // Update existing order - merge items
            List<OrderItem> existingItems = existingOrder.getItems();
            
            for (OrderItem newItem : items) {
                boolean found = false;
                for (OrderItem existingItem : existingItems) {
                    if (existingItem.getId().equals(newItem.getId()) && !existingItem.isSentToKitchen()) {
                        // Update quantity of pending item
                        existingItem.setQuantity(existingItem.getQuantity() + newItem.getQuantity());
                        found = true;
                        break;
                    }
                }
                if (!found) {
                    // Add new item
                    existingItems.add(newItem);
                }
            }
            
            return existingOrder;
        }
    }
    
    public TableOrder markItemsAsSent(String tableId) {
        TableOrder order = getTableOrderByTableId(tableId);
        if (order != null) {
            for (OrderItem item : order.getItems()) {
                item.setSentToKitchen(true);
            }
        }
        return order;
    }
    
    public boolean completeTableOrder(String tableId) {
        TableOrder removed = tableOrders.remove(tableId);
        if (removed != null) {
            // Update table status
            Table table = tables.get(tableId);
            if (table != null) {
                table.setStatus("available");
            }
            return true;
        }
        return false;
    }
    
    // Invoice operations
    public List<Invoice> getAllInvoices() {
        return new ArrayList<>(invoices.values());
    }
    
    public Invoice createInvoice(Invoice invoice) {
        if (invoice.getId() == null || invoice.getId().isEmpty()) {
            invoice.setId(generateId());
        }
        invoices.put(invoice.getId(), invoice);
        return invoice;
    }
    
    // Menu Item operations
    public List<MenuItem> getAllMenuItems() {
        return new ArrayList<>(menuItems.values());
    }
    
    public MenuItem getMenuItemById(String id) {
        return menuItems.get(id);
    }
    
    public MenuItem createMenuItem(MenuItem item) {
        if (item.getId() == null || item.getId().isEmpty()) {
            item.setId(generateId());
        }
        // Check for duplicate product code
        boolean duplicate = menuItems.values().stream()
                .anyMatch(existing -> existing.getProductCode().equals(item.getProductCode()));
        if (duplicate) {
            return null;
        }
        menuItems.put(item.getId(), item);
        return item;
    }
    
    public MenuItem updateMenuItem(String id, MenuItem item) {
        if (menuItems.containsKey(id)) {
            // Check for duplicate product code (excluding current item)
            boolean duplicate = menuItems.values().stream()
                    .filter(existing -> !existing.getId().equals(id))
                    .anyMatch(existing -> existing.getProductCode().equals(item.getProductCode()));
            if (duplicate) {
                return null;
            }
            item.setId(id);
            menuItems.put(id, item);
            return item;
        }
        return null;
    }
    
    public boolean deleteMenuItem(String id) {
        return menuItems.remove(id) != null;
    }
    
    // Category operations
    public List<Category> getAllCategories() {
        return new ArrayList<>(categories.values());
    }
    
    public Category createCategory(Category category) {
        if (category.getId() == null || category.getId().isEmpty()) {
            category.setId(generateId());
        }
        categories.put(category.getId(), category);
        return category;
    }
    
    public boolean deleteCategory(String id) {
        return categories.remove(id) != null;
    }
    
    // Department operations
    public List<Department> getAllDepartments() {
        return new ArrayList<>(departments.values());
    }
    
    public Department createDepartment(Department department) {
        if (department.getId() == null || department.getId().isEmpty()) {
            department.setId(generateId());
        }
        departments.put(department.getId(), department);
        return department;
    }
    
    public boolean deleteDepartment(String id) {
        return departments.remove(id) != null;
    }
    
    // Settings operations
    public RestaurantSettings getRestaurantSettings() {
        return restaurantSettings;
    }
    
    public void updateRestaurantSettings(RestaurantSettings settings) {
        if (settings.getRestaurantName() != null) {
            this.restaurantSettings.setRestaurantName(settings.getRestaurantName());
        }
        if (settings.getAddress() != null) {
            this.restaurantSettings.setAddress(settings.getAddress());
        }
        if (settings.getPhone() != null) {
            this.restaurantSettings.setPhone(settings.getPhone());
        }
        if (settings.getEmail() != null) {
            this.restaurantSettings.setEmail(settings.getEmail());
        }
        if (settings.getCurrency() != null) {
            this.restaurantSettings.setCurrency(settings.getCurrency());
        }
        this.restaurantSettings.setTaxRate(settings.getTaxRate());
    }
    
    // Config operations
    public KOTConfig getKOTConfig() {
        return kotConfig;
    }
    
    public void updateKOTConfig(KOTConfig config) {
        this.kotConfig = config;
    }
    
    public BillConfig getBillConfig() {
        return billConfig;
    }
    
    public void updateBillConfig(BillConfig config) {
        this.billConfig = config;
    }
    
    // KOT Counter operations
    public int getNextKOTNumber() {
        LocalDate today = LocalDate.now();
        
        if (kotCounter.getLastResetDate().isBefore(today)) {
            // Reset counter for new day
            kotCounter.setCurrentNumber(1);
            kotCounter.setLastResetDate(today);
        } else {
            kotCounter.setCurrentNumber(kotCounter.getCurrentNumber() + 1);
        }
        
        return kotCounter.getCurrentNumber();
    }
    
    // Utility method to generate unique IDs
    private String generateId() {
        return String.valueOf(System.currentTimeMillis());
    }
}
