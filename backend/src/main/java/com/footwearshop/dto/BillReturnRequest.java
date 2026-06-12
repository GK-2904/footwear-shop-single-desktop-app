package com.footwearshop.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class BillReturnRequest {
    private Long billItemId;
    private Integer returnQty;
}
