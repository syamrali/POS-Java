package com.pos.controller;

import com.pos.model.BillConfig;
import com.pos.model.KOTConfig;
import com.pos.model.RestaurantSettings;
import com.pos.service.DataStorageService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api")
public class SettingsController {
    
    @Autowired
    private DataStorageService dataStorage;
    
    // Restaurant Settings
    @GetMapping("/restaurant-settings")
    public ResponseEntity<RestaurantSettings> getRestaurantSettings() {
        return ResponseEntity.ok(dataStorage.getRestaurantSettings());
    }
    
    @PutMapping("/restaurant-settings")
    public ResponseEntity<RestaurantSettings> updateRestaurantSettings(@RequestBody RestaurantSettings settings) {
        dataStorage.updateRestaurantSettings(settings);
        return ResponseEntity.ok(dataStorage.getRestaurantSettings());
    }
    
    // KOT Config
    @GetMapping("/config/kot")
    public ResponseEntity<KOTConfig> getKOTConfig() {
        return ResponseEntity.ok(dataStorage.getKOTConfig());
    }
    
    @PutMapping("/config/kot")
    public ResponseEntity<KOTConfig> updateKOTConfig(@RequestBody KOTConfig config) {
        dataStorage.updateKOTConfig(config);
        return ResponseEntity.ok(dataStorage.getKOTConfig());
    }
    
    // Bill Config
    @GetMapping("/config/bill")
    public ResponseEntity<BillConfig> getBillConfig() {
        return ResponseEntity.ok(dataStorage.getBillConfig());
    }
    
    @PutMapping("/config/bill")
    public ResponseEntity<BillConfig> updateBillConfig(@RequestBody BillConfig config) {
        dataStorage.updateBillConfig(config);
        return ResponseEntity.ok(dataStorage.getBillConfig());
    }
    
    // KOT Counter
    @GetMapping("/kot/next-number")
    public ResponseEntity<Map<String, Integer>> getNextKOTNumber() {
        int kotNumber = dataStorage.getNextKOTNumber();
        return ResponseEntity.ok(Map.of("kotNumber", kotNumber));
    }
    
    // Login
    @PostMapping("/login")
    public ResponseEntity<Map<String, String>> login(@RequestBody Map<String, String> credentials) {
        // Simple login endpoint - no authentication in this version
        return ResponseEntity.ok(Map.of("message", "Login successful"));
    }
}
