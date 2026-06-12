package com.footwearshop.service.Impl;

import com.footwearshop.entity.Brand;
import com.footwearshop.repository.BrandRepository;
import com.footwearshop.repository.FootwearProductRepository;
import com.footwearshop.service.BrandService;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class BrandServiceImpl implements BrandService {

    private final BrandRepository brandRepository;
    private final FootwearProductRepository footwearProductRepository;

    public BrandServiceImpl(
            BrandRepository brandRepository,
            FootwearProductRepository footwearProductRepository) {
        this.brandRepository = brandRepository;
        this.footwearProductRepository = footwearProductRepository;
    }

    // ✅ ADD BRAND
    @Override
    public Brand saveBrand(Brand brand) {
        brand.setCreatedAt(LocalDateTime.now()); // backend responsibility
        return brandRepository.save(brand);
    }

    // ✅ GET ALL BRANDS
    @Override
    public List<Brand> getAllBrands() {
        return brandRepository.findAll();
    }

    // ✅ DELETE BRAND (FIXED)
    @Override
    public void deleteBrand(Long id) {

        // ✅ CORRECT METHOD NAME
        if (footwearProductRepository.existsByBrand_Id(id)) {
            throw new RuntimeException("Brand is used by products");
        }

        brandRepository.deleteById(id);
    }

    // ✅ UPDATE BRAND
    @Override
    public Brand updateBrand(Long id, String name) {

        Brand brand = brandRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Brand not found"));

        brand.setName(name);     // update only name
        // ❌ do NOT change createdAt

        return brandRepository.save(brand);
    }
}
