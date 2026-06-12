package com.footwearshop.controller;

import com.footwearshop.entity.FinancialYear;
import com.footwearshop.service.FinancialYearService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/financial-years")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:5174", "http://localhost:5175", "http://localhost:8080"})
public class FinancialYearController {

    private final FinancialYearService financialYearService;

    public FinancialYearController(FinancialYearService financialYearService) {
        this.financialYearService = financialYearService;
    }

    @GetMapping
    public ResponseEntity<List<FinancialYear>> getAllFinancialYears() {
        return ResponseEntity.ok(financialYearService.getAllFinancialYears());
    }

    @GetMapping("/active")
    public ResponseEntity<FinancialYear> getActiveFinancialYear() {
        return ResponseEntity.ok(financialYearService.getActiveFinancialYear());
    }

    @PostMapping
    public ResponseEntity<FinancialYear> createFinancialYear(@RequestBody FinancialYear financialYear) {
        try {
            FinancialYear created = financialYearService.createFinancialYear(financialYear);
            return ResponseEntity.status(HttpStatus.CREATED).body(created);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(null);
        }
    }

    @PutMapping("/{id}/activate")
    public ResponseEntity<FinancialYear> activateFinancialYear(@PathVariable Long id) {
        try {
            FinancialYear activated = financialYearService.setActiveFinancialYear(id);
            return ResponseEntity.ok(activated);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(null);
        }
    }
}
