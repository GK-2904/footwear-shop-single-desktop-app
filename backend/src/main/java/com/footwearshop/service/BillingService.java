package com.footwearshop.service;

import com.footwearshop.dto.BillRequest;
import com.footwearshop.dto.BillResponseDto;

import java.time.LocalDate;
import java.util.List;

public interface BillingService {
    BillResponseDto createBill(BillRequest request);
    BillResponseDto getBillById(Long id);
    List<BillResponseDto> getAllBills();
    List<BillResponseDto> getBillsByDateRange(LocalDate from, LocalDate to);
}
