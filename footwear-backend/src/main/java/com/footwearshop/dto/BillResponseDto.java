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
    private String billNumber;
    private String ownerName;
    private BigDecimal gstPercentage;

    private BigDecimal subTotal;
    private BigDecimal gstAmount;
    private BigDecimal totalAmount;

    private LocalDate billDate;
    private LocalTime billTime;


    private List<BillItemResponseDto> items; // 🔥 REQUIRED
}
