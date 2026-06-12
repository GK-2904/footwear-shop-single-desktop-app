package com.footwearshop.repository;

import com.footwearshop.entity.FootwearSizeStock;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface FootwearSizeStockRepository
        extends JpaRepository<FootwearSizeStock, Long> {

    // ✅ correct
    List<FootwearSizeStock> findByProductId(Long productId);

    // ✅ correct
    Optional<FootwearSizeStock> findByProductIdAndSize(Long productId, Integer size);

    List<FootwearSizeStock> findByStockStatus(String stockStatus);
}
