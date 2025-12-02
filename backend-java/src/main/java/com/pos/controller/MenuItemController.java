package com.pos.controller;

import com.pos.model.MenuItem;
import com.pos.service.DataStorageService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/menu-items")
public class MenuItemController {
    
    @Autowired
    private DataStorageService dataStorage;
    
    @GetMapping
    public ResponseEntity<List<MenuItem>> getMenuItems() {
        return ResponseEntity.ok(dataStorage.getAllMenuItems());
    }
    
    @PostMapping
    public ResponseEntity<?> createMenuItem(@RequestBody MenuItem item) {
        MenuItem created = dataStorage.createMenuItem(item);
        if (created == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "Product code already exists"));
        }
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }
    
    @PutMapping("/{itemId}")
    public ResponseEntity<?> updateMenuItem(@PathVariable String itemId, @RequestBody MenuItem item) {
        MenuItem updated = dataStorage.updateMenuItem(itemId, item);
        if (updated == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "Product code already exists or item not found"));
        }
        return ResponseEntity.ok(updated);
    }
    
    @DeleteMapping("/{itemId}")
    public ResponseEntity<Map<String, String>> deleteMenuItem(@PathVariable String itemId) {
        boolean deleted = dataStorage.deleteMenuItem(itemId);
        if (!deleted) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(Map.of("message", "Menu item deleted successfully"));
    }
}
