package com.footwearshop.dto;

import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@Getter
@Setter
public class BillResponseDto {
    private Long id;
    private String billNo;
    private String financialYearName;
    private String paymentMode;
    private BigDecimal subTotal;
    private BigDecimal manualAdjustment;
    private BigDecimal totalAmount;
    private BigDecimal totalMargin;
    private BigDecimal totalReturned;
    private BigDecimal netTotal;
    private BigDecimal netMargin;
    private LocalDate billDate;
    private LocalTime billTime;
    private List<BillItemResponseDto> items;
}
