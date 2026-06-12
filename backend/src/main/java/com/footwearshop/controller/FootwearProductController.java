package com.footwearshop.controller;


import com.footwearshop.dto.FootwearProductRequest;
import com.footwearshop.entity.FootwearProduct;
import com.footwearshop.service.FootwearProductService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/products")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:8080"})
public class FootwearProductController {

    private final FootwearProductService productService;

    public FootwearProductController(FootwearProductService productService) {
        this.productService = productService;
    }

    @PostMapping
    public FootwearProduct createProduct(
            @RequestBody FootwearProductRequest request) {
        return productService.createProduct(request);
    }


    // ✅ GET ALL
    @GetMapping
    public List<FootwearProduct> getAllProducts() {
        return productService.getAllProducts();
    }
}
