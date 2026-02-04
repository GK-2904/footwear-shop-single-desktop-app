package com.footwearshop.service;


import com.footwearshop.dto.FootwearProductRequest;
import com.footwearshop.entity.FootwearProduct;

import java.util.List;

public interface FootwearProductService {

    FootwearProduct createProduct(FootwearProductRequest request);
    List<FootwearProduct> getAllProducts();
    List<FootwearProduct> getProductsByBrand(Long brandId);
    List<FootwearProduct> getProductsByCategory(String category);
    List<FootwearProduct> getProductsBySection(String section);
}



