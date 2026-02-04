package com.footwearshop.controller;

import com.footwearshop.dto.BillRequest;
import com.footwearshop.dto.BillResponseDto;
import com.footwearshop.service.BillingService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/bills")
@CrossOrigin(origins = "http://localhost:5173")
public class BillController {

    private final BillingService billingService;

    public BillController(BillingService billingService) {
        this.billingService = billingService;
    }

    /* ================= CREATE BILL ================= */

    @PostMapping
    public ResponseEntity<BillResponseDto> createBill(
            @RequestBody BillRequest request
    ) {
        BillResponseDto response = billingService.createBill(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    /* ================= GET BILL BY ID ================= */

    @GetMapping("/{id}")
    public ResponseEntity<BillResponseDto> getBillById(@PathVariable Long id) {
        return ResponseEntity.ok(billingService.getBillById(id));
    }

    /* ================= GET ALL BILLS ================= */

    @GetMapping
    public ResponseEntity<List<BillResponseDto>> getAllBills() {
        return ResponseEntity.ok(billingService.getAllBills());
    }
}
