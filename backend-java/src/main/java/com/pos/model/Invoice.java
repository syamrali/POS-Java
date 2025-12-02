package com.pos.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class Invoice {
    private String id;
    private String billNumber;
    private String orderType; // "dine-in" or "takeaway"
    private String tableName;
    private List<OrderItem> items;
    private double subtotal;
    private double tax;
    private double total;
    private LocalDateTime timestamp;
}
