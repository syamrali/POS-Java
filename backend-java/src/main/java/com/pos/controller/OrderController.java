package com.pos.controller;

import com.pos.model.OrderItem;
import com.pos.model.TableOrder;
import com.pos.service.DataStorageService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/orders")
public class OrderController {
    
    @Autowired
    private DataStorageService dataStorage;
    
    @GetMapping
    public ResponseEntity<List<TableOrder>> getOrders() {
        return ResponseEntity.ok(dataStorage.getAllTableOrders());
    }
    
    @GetMapping("/table/{tableId}")
    public ResponseEntity<TableOrder> getTableOrder(@PathVariable String tableId) {
        TableOrder order = dataStorage.getTableOrderByTableId(tableId);
        return ResponseEntity.ok(order);
    }
    
    @PostMapping("/table/{tableId}")
    public ResponseEntity<TableOrder> addItemsToTable(
            @PathVariable String tableId,
            @RequestBody Map<String, Object> request) {
        
        String tableName = (String) request.get("table_name");
        @SuppressWarnings("unchecked")
        List<Map<String, Object>> itemsData = (List<Map<String, Object>>) request.get("items");
        
        List<OrderItem> items = itemsData.stream()
                .map(this::mapToOrderItem)
                .toList();
        
        TableOrder order = dataStorage.createOrUpdateTableOrder(tableId, tableName, items);
        return ResponseEntity.ok(order);
    }
    
    @PostMapping("/table/{tableId}/sent")
    public ResponseEntity<TableOrder> markItemsAsSent(@PathVariable String tableId) {
        TableOrder order = dataStorage.markItemsAsSent(tableId);
        if (order == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(order);
    }
    
    @PostMapping("/table/{tableId}/complete")
    public ResponseEntity<Map<String, String>> completeTableOrder(@PathVariable String tableId) {
        boolean completed = dataStorage.completeTableOrder(tableId);
        if (!completed) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(Map.of("message", "Order completed successfully"));
    }
    
    private OrderItem mapToOrderItem(Map<String, Object> data) {
        OrderItem item = new OrderItem();
        item.setId((String) data.get("id"));
        item.setName((String) data.get("name"));
        item.setPrice(((Number) data.get("price")).doubleValue());
        item.setCategory((String) data.get("category"));
        item.setDepartment((String) data.get("department"));
        item.setQuantity(((Number) data.get("quantity")).intValue());
        item.setSentToKitchen(data.get("sentToKitchen") != null && (Boolean) data.get("sentToKitchen"));
        return item;
    }
}
