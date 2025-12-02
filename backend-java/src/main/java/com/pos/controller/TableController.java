package com.pos.controller;

import com.pos.model.Table;
import com.pos.service.DataStorageService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/tables")
public class TableController {
    
    @Autowired
    private DataStorageService dataStorage;
    
    @GetMapping
    public ResponseEntity<List<Table>> getTables() {
        return ResponseEntity.ok(dataStorage.getAllTables());
    }
    
    @PostMapping
    public ResponseEntity<Table> createTable(@RequestBody Table table) {
        Table created = dataStorage.createTable(table);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }
    
    @PutMapping("/{tableId}")
    public ResponseEntity<Table> updateTable(@PathVariable String tableId, @RequestBody Table table) {
        Table updated = dataStorage.updateTable(tableId, table);
        if (updated == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(updated);
    }
    
    @DeleteMapping("/{tableId}")
    public ResponseEntity<Map<String, String>> deleteTable(@PathVariable String tableId) {
        boolean deleted = dataStorage.deleteTable(tableId);
        if (!deleted) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(Map.of("message", "Table deleted successfully"));
    }
}
