package com.footwearshop.service.Impl;

import com.footwearshop.dto.FootwearProductRequest;
import com.footwearshop.entity.Brand;
import com.footwearshop.entity.FootwearProduct;
import com.footwearshop.repository.BrandRepository;
import com.footwearshop.repository.FootwearProductRepository;
import com.footwearshop.service.FootwearProductService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
public class FootwearProductServiceImpl implements FootwearProductService {

    private final FootwearProductRepository productRepository;
    private final BrandRepository brandRepository;

    public FootwearProductServiceImpl(
            FootwearProductRepository productRepository,
            BrandRepository brandRepository
    ) {
        this.productRepository = productRepository;
        this.brandRepository = brandRepository;
    }

    /* ================= CREATE PRODUCT ================= */
    // ✅ Used ONLY for stock/product creation
    // ❌ NEVER used during billing

    @Override
    public FootwearProduct createProduct(FootwearProductRequest request) {

        if (request == null) {
            throw new IllegalArgumentException("Product request must not be null");
        }

        if (request.getBrandId() == null) {
            throw new IllegalArgumentException("Brand ID is required");
        }

        Brand brand = brandRepository.findById(request.getBrandId())
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "Brand not found with id: " + request.getBrandId()
                        )
                );

        FootwearProduct product = new FootwearProduct();
        product.setBrand(brand);
        product.setCategory(request.getCategory());
        product.setType(request.getType());
        product.setColor(request.getColor());
        product.setSection(request.getSection());
        product.setRack(request.getRack());
        product.setShelf(request.getShelf());

        // ❗ Quantity & size handled in FootwearSizeStock
        return productRepository.save(product);
    }

    /* ================= GET ALL PRODUCTS ================= */

    @Override
    public List<FootwearProduct> getAllProducts() {
        return productRepository.findAll();
    }

    /* ================= GET PRODUCTS BY BRAND ================= */

    @Override
    public List<FootwearProduct> getProductsByBrand(Long brandId) {

        if (brandId == null) {
            throw new IllegalArgumentException("Brand ID must not be null");
        }

        return productRepository.findByBrand_Id(brandId);
    }

    /* ================= GET PRODUCTS BY CATEGORY ================= */

    @Override
    public List<FootwearProduct> getProductsByCategory(String category) {

        if (category == null || category.trim().isEmpty()) {
            throw new IllegalArgumentException("Category must not be empty");
        }

        return productRepository.findByCategory(category);
    }

    /* ================= GET PRODUCTS BY SECTION ================= */

    @Override
    public List<FootwearProduct> getProductsBySection(String section) {

        if (section == null || section.trim().isEmpty()) {
            throw new IllegalArgumentException("Section must not be empty");
        }

        return productRepository.findBySection(section);
    }
}
