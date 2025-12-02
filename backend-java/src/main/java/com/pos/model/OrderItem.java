package com.pos.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class OrderItem {
    private String id;
    private String name;
    private double price;
    private String category;
    private String department;
    private int quantity;
    private boolean sentToKitchen;
}
