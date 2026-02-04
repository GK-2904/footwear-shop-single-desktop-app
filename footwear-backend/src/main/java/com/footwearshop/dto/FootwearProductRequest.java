package com.footwearshop.dto;


import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class FootwearProductRequest {
    private Long brandId;
    private String category;
    private String type;

    private String color;

    private String section;
    private String rack;
    private String shelf;

    private Integer size;
    private Double costPrice;
    private Double sellingPrice;
    private Integer quantity;
}
