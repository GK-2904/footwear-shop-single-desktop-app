package com.footwearshop.dto;

import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.util.List;

@Getter
@Setter
public class BillRequest {

    private String ownerName;
    private BigDecimal gstPercentage;
    private List<BillItemRequest> items;
}
