package com.pos.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@AllArgsConstructor
public class KOTCounter {
    private Integer id;
    private int currentNumber;
    private LocalDate lastResetDate;
    
    public KOTCounter() {
        this.id = 1;
        this.currentNumber = 0;
        this.lastResetDate = LocalDate.now();
    }
}
