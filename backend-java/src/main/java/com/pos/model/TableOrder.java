package com.pos.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TableOrder {
    private Long id;
    private String tableId;
    private String tableName;
    private List<OrderItem> items;
    private LocalDateTime startTime;
}
