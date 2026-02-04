package com.footwearshop.repository;

import com.footwearshop.entity.FootwearProduct;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface FootwearProductRepository extends JpaRepository<FootwearProduct, Long> {

    List<FootwearProduct> findByBrand_Id(Long brandId);

    List<FootwearProduct> findByCategory(String category);

    List<FootwearProduct> findBySection(String section);

    boolean existsByBrand_Id(Long brandId);
}
