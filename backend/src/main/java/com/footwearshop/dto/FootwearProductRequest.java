package com.footwearshop.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class FootwearProductRequest {
    private Long brandId;
    private String subBrand;
    private String article;
    private String category;
    private String kidsSubCategory;
    private String type;
    private String color;
    private String section;
    private String rack;
    private String shelf;
}
