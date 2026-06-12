package com.footwearshop.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
public class BillItemRequest {

    private Long stockId;

    @NotNull(message = "Product ID is required")
    private Long productId;

    @NotNull(message = "Size is required")
    @Min(value = 1, message = "Size must be greater than 0")
    private Integer size;

    @NotNull(message = "Quantity is required")
    @Min(value = 1, message = "Quantity must be at least 1")
    private Integer quantity;

    private BigDecimal mrp;
    private BigDecimal purchasePrice;
    private BigDecimal defaultSellingPrice;

    @NotNull(message = "Actual unit price is required")
    private BigDecimal actualUnitPrice;

    @NotNull(message = "Total amount is required")
    private BigDecimal total;

    private BigDecimal lineMargin;
}
