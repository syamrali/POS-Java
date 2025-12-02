package com.pos.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class Table {
    private String id;
    private String name;
    private int seats;
    private String category;
    private String status; // "available" or "occupied"
}
