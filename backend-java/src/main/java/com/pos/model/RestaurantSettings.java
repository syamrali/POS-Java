package com.pos.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
public class RestaurantSettings {
    private Integer id;
    private String restaurantName;
    private String address;
    private String phone;
    private String email;
    private String currency;
    private double taxRate;
    
    public RestaurantSettings() {
        this.id = 1;
        this.restaurantName = "My Restaurant";
        this.currency = "INR";
        this.taxRate = 0.0;
    }
}
