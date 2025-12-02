package com.pos;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class PosApplication {
    
    public static void main(String[] args) {
        SpringApplication.run(PosApplication.class, args);
        System.out.println("\n==============================================");
        System.out.println("POS Backend is running on http://localhost:8080");
        System.out.println("API Base URL: http://localhost:8080/api");
        System.out.println("==============================================\n");
    }
}
