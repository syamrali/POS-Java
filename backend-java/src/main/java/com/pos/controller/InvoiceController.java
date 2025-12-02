package com.pos.controller;

import com.pos.model.Invoice;
import com.pos.service.DataStorageService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/invoices")
public class InvoiceController {
    
    @Autowired
    private DataStorageService dataStorage;
    
    @GetMapping
    public ResponseEntity<List<Invoice>> getInvoices() {
        return ResponseEntity.ok(dataStorage.getAllInvoices());
    }
    
    @PostMapping
    public ResponseEntity<Invoice> addInvoice(@RequestBody Invoice invoice) {
        Invoice created = dataStorage.createInvoice(invoice);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }
}
