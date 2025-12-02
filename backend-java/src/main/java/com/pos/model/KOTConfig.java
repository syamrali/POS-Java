package com.pos.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
public class KOTConfig {
    private boolean printByDepartment;
    private int numberOfCopies;
    private String selectedPrinter;
    private String paperSize;
    private String formatType;
    
    public KOTConfig() {
        this.printByDepartment = false;
        this.numberOfCopies = 1;
    }
}
