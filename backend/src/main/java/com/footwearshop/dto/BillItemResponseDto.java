package com.footwearshop.dto;

import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
public class BillItemResponseDto {
    private Long id;
    private String productName;
    private String subBrand;
    private String article;
    private String category;
    private String type;
    private String color;
    private Integer size;
    private Integer quantity;
    private BigDecimal mrp;
    private BigDecimal purchasePrice;
    private BigDecimal defaultSellingPrice;
    private BigDecimal actualUnitPrice;
    private BigDecimal lineMargin;
    private BigDecimal total;
    private Integer returnedQty;
    private BigDecimal returnedAmount;
    private Integer returnableQty;
}
