package com.pos.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
public class BillConfig {
    private boolean autoPrintDineIn;
    private boolean autoPrintTakeaway;
    private String selectedPrinter;
    private String paperSize;
    private String formatType;
    
    public BillConfig() {
        this.autoPrintDineIn = false;
        this.autoPrintTakeaway = false;
    }
}
