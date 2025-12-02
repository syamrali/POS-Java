package com.pos.service;

import com.pos.model.Category;
import com.pos.model.Department;
import com.pos.model.MenuItem;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.*;

@Service
public class ExcelService {
    
    @Autowired
    private DataStorageService dataStorage;
    
    public byte[] generateTemplate() throws IOException {
        try (Workbook workbook = new XSSFWorkbook(); ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            
            // Create Categories sheet
            Sheet categoriesSheet = workbook.createSheet("Categories");
            createHeader(categoriesSheet, new String[]{"Category Name"});
            Row catRow = categoriesSheet.createRow(1);
            catRow.createCell(0).setCellValue("Example: Appetizers");
            categoriesSheet.setColumnWidth(0, 8000);
            
            // Create Departments sheet
            Sheet departmentsSheet = workbook.createSheet("Departments");
            createHeader(departmentsSheet, new String[]{"Department Name"});
            Row deptRow = departmentsSheet.createRow(1);
            deptRow.createCell(0).setCellValue("Example: Kitchen");
            departmentsSheet.setColumnWidth(0, 8000);
            
            // Create Menu Items sheet
            Sheet itemsSheet = workbook.createSheet("Menu Items");
            createHeader(itemsSheet, new String[]{"Product Code", "Item Name", "Price", "Category", "Department", "Description"});
            Row itemRow = itemsSheet.createRow(1);
            itemRow.createCell(0).setCellValue("CB001");
            itemRow.createCell(1).setCellValue("Example: Chicken Burger");
            itemRow.createCell(2).setCellValue(299);
            itemRow.createCell(3).setCellValue("Mains");
            itemRow.createCell(4).setCellValue("Kitchen");
            itemRow.createCell(5).setCellValue("Grilled chicken with lettuce and mayo");
            
            for (int i = 0; i < 6; i++) {
                itemsSheet.autoSizeColumn(i);
            }
            
            workbook.write(out);
            return out.toByteArray();
        }
    }
    
    public byte[] exportMenuData() throws IOException {
        try (Workbook workbook = new XSSFWorkbook(); ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            
            // Export Categories
            Sheet categoriesSheet = workbook.createSheet("Categories");
            createHeader(categoriesSheet, new String[]{"Category Name"});
            List<Category> categories = dataStorage.getAllCategories();
            for (int i = 0; i < categories.size(); i++) {
                Row row = categoriesSheet.createRow(i + 1);
                row.createCell(0).setCellValue(categories.get(i).getName());
            }
            categoriesSheet.setColumnWidth(0, 8000);
            
            // Export Departments
            Sheet departmentsSheet = workbook.createSheet("Departments");
            createHeader(departmentsSheet, new String[]{"Department Name"});
            List<Department> departments = dataStorage.getAllDepartments();
            for (int i = 0; i < departments.size(); i++) {
                Row row = departmentsSheet.createRow(i + 1);
                row.createCell(0).setCellValue(departments.get(i).getName());
            }
            departmentsSheet.setColumnWidth(0, 8000);
            
            // Export Menu Items
            Sheet itemsSheet = workbook.createSheet("Menu Items");
            createHeader(itemsSheet, new String[]{"Product Code", "Item Name", "Price", "Category", "Department", "Description"});
            List<MenuItem> items = dataStorage.getAllMenuItems();
            for (int i = 0; i < items.size(); i++) {
                Row row = itemsSheet.createRow(i + 1);
                MenuItem item = items.get(i);
                row.createCell(0).setCellValue(item.getProductCode());
                row.createCell(1).setCellValue(item.getName());
                row.createCell(2).setCellValue(item.getPrice());
                row.createCell(3).setCellValue(item.getCategory());
                row.createCell(4).setCellValue(item.getDepartment());
                row.createCell(5).setCellValue(item.getDescription());
            }
            
            for (int i = 0; i < 6; i++) {
                itemsSheet.autoSizeColumn(i);
            }
            
            workbook.write(out);
            return out.toByteArray();
        }
    }
    
    public Map<String, Object> importMenuData(MultipartFile file) throws IOException {
        Map<String, Object> result = new HashMap<>();
        List<String> errors = new ArrayList<>();
        int categoriesAdded = 0;
        int departmentsAdded = 0;
        int itemsAdded = 0;
        
        try (Workbook workbook = WorkbookFactory.create(file.getInputStream())) {
            
            // Import Categories
            Sheet categoriesSheet = workbook.getSheet("Categories");
            if (categoriesSheet != null) {
                for (int i = 1; i <= categoriesSheet.getLastRowNum(); i++) {
                    Row row = categoriesSheet.getRow(i);
                    if (row != null && row.getCell(0) != null) {
                        String name = row.getCell(0).getStringCellValue();
                        if (!name.startsWith("Example:") && !name.trim().isEmpty()) {
                            Category category = new Category(null, name.trim());
                            if (dataStorage.createCategory(category) != null) {
                                categoriesAdded++;
                            }
                        }
                    }
                }
            }
            
            // Import Departments
            Sheet departmentsSheet = workbook.getSheet("Departments");
            if (departmentsSheet != null) {
                for (int i = 1; i <= departmentsSheet.getLastRowNum(); i++) {
                    Row row = departmentsSheet.getRow(i);
                    if (row != null && row.getCell(0) != null) {
                        String name = row.getCell(0).getStringCellValue();
                        if (!name.startsWith("Example:") && !name.trim().isEmpty()) {
                            Department department = new Department(null, name.trim());
                            if (dataStorage.createDepartment(department) != null) {
                                departmentsAdded++;
                            }
                        }
                    }
                }
            }
            
            // Import Menu Items
            Sheet itemsSheet = workbook.getSheet("Menu Items");
            if (itemsSheet != null) {
                for (int i = 1; i <= itemsSheet.getLastRowNum(); i++) {
                    Row row = itemsSheet.getRow(i);
                    if (row != null) {
                        try {
                            String productCode = getCellValue(row.getCell(0));
                            String name = getCellValue(row.getCell(1));
                            
                            if (name.startsWith("Example:") || name.trim().isEmpty()) continue;
                            
                            double price = getNumericCellValue(row.getCell(2));
                            String category = getCellValue(row.getCell(3));
                            String department = getCellValue(row.getCell(4));
                            String description = getCellValue(row.getCell(5));
                            
                            MenuItem item = new MenuItem(null, name, productCode, price, category, department, description);
                            if (dataStorage.createMenuItem(item) != null) {
                                itemsAdded++;
                            } else {
                                errors.add("Row " + (i + 1) + ": Product code '" + productCode + "' already exists");
                            }
                        } catch (Exception e) {
                            errors.add("Row " + (i + 1) + ": " + e.getMessage());
                        }
                    }
                }
            }
        }
        
        Map<String, Object> stats = new HashMap<>();
        stats.put("categories_added", categoriesAdded);
        stats.put("departments_added", departmentsAdded);
        stats.put("items_added", itemsAdded);
        stats.put("errors", errors);
        
        result.put("success", true);
        result.put("message", "Import completed successfully");
        result.put("stats", stats);
        
        return result;
    }
    
    private void createHeader(Sheet sheet, String[] headers) {
        Row headerRow = sheet.createRow(0);
        CellStyle headerStyle = sheet.getWorkbook().createCellStyle();
        Font headerFont = sheet.getWorkbook().createFont();
        headerFont.setBold(true);
        headerStyle.setFont(headerFont);
        
        for (int i = 0; i < headers.length; i++) {
            Cell cell = headerRow.createCell(i);
            cell.setCellValue(headers[i]);
            cell.setCellStyle(headerStyle);
        }
    }
    
    private String getCellValue(Cell cell) {
        if (cell == null) return "";
        return switch (cell.getCellType()) {
            case STRING -> cell.getStringCellValue();
            case NUMERIC -> String.valueOf((long) cell.getNumericCellValue());
            default -> "";
        };
    }
    
    private double getNumericCellValue(Cell cell) {
        if (cell == null) return 0.0;
        return cell.getCellType() == CellType.NUMERIC ? cell.getNumericCellValue() : 0.0;
    }
}
