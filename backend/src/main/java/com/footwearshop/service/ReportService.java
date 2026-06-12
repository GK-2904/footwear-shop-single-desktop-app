package com.footwearshop.service;

import com.footwearshop.dto.BillResponseDto;

import java.time.LocalDate;
import java.util.List;

public interface ReportService {
    List<BillResponseDto> getSalesReport(LocalDate from, LocalDate to, String paymentMode);
    byte[] generateSalesPdf(LocalDate from, LocalDate to, String paymentMode);
    byte[] generateSalesExcel(LocalDate from, LocalDate to, String paymentMode);
}
