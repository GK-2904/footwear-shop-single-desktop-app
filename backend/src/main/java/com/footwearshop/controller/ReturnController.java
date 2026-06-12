package com.footwearshop.controller;

import com.footwearshop.dto.BillResponseDto;
import com.footwearshop.dto.BillReturnRequest;
import com.footwearshop.service.ReturnService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/bills")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:8080"})
public class ReturnController {

    private final ReturnService returnService;

    public ReturnController(ReturnService returnService) {
        this.returnService = returnService;
    }

    @PostMapping("/{billId}/return")
    public ResponseEntity<BillResponseDto> processReturn(
            @PathVariable Long billId,
            @RequestBody BillReturnRequest request
    ) {
        return ResponseEntity.ok(returnService.processReturn(billId, request));
    }
}
