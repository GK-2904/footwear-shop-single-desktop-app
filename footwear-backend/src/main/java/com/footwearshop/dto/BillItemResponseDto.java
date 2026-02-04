package com.footwearshop.dto;

import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
public class BillItemResponseDto {

    private String productName;
    private String category;
    private String type;
    private String color;

    private Integer size;       // ✅ Integer (NOT int, NOT BigDecimal)
    private Integer quantity;   // ✅ Integer

    private BigDecimal price;   // ✅ BigDecimal
    private BigDecimal total;   // ✅ BigDecimal
}
