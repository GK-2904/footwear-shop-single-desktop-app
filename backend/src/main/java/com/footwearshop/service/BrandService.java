package com.footwearshop.service;

import com.footwearshop.entity.Brand;

import java.util.List;

public interface BrandService {

    Brand saveBrand(Brand brand);   // ✅ ADD THIS

    List<Brand> getAllBrands();

    void deleteBrand(Long id);

    Brand updateBrand(Long id, String name);
}
