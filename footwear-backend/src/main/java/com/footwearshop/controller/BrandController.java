package com.footwearshop.controller;


import com.footwearshop.dto.BrandRequest;
import com.footwearshop.entity.Brand;
import com.footwearshop.service.BrandService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/brands")
@CrossOrigin(origins = "http://localhost:5173")
public class BrandController {

    private final BrandService brandService;

    public BrandController(BrandService brandService) {
        this.brandService = brandService;
    }

    @PostMapping
    public Brand createBrand(@Valid @RequestBody BrandRequest request) {
        Brand brand = new Brand();
        brand.setName(request.getName());
        brand.setCreatedAt(LocalDateTime.now()); // ✅ backend sets this

        return brandService.saveBrand(brand);
    }

    @GetMapping
    public List<Brand> getAllBrands() {
        return brandService.getAllBrands();
    }

    @DeleteMapping("/{id}")
    public void deleteBrand(@PathVariable Long id) {
        brandService.deleteBrand(id);
    }

    @PutMapping("/{id}")
    public Brand updateBrand(
            @PathVariable Long id,
            @RequestBody BrandRequest request
    ) {
        return brandService.updateBrand(id, request.getName());
    }
}
