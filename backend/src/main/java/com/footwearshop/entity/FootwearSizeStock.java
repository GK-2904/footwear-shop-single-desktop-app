package com.footwearshop.entity;

import com.fasterxml.jackson.annotation.JsonAlias;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

@Entity
@Table(name = "footwear_size_stock")
@Getter
@Setter
public class FootwearSizeStock {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "product_id", nullable = false)
    private FootwearProduct product;

    @Column(nullable = false)
    private Integer size;

    @Column(nullable = false)
    private Integer quantity;

    @Column(name = "cost_price", precision = 10, scale = 2)
    @JsonAlias("costPrice")
    private BigDecimal purchasePrice;

    @Column(precision = 10, scale = 2)
    private BigDecimal mrp;

    @Column(name = "selling_price", precision = 10, scale = 2)
    private BigDecimal sellingPrice;

    @Column(name = "stock_status", length = 20)
    private String stockStatus = "ACTIVE";

    private String section;
    private String rack;
    private String shelf;

    @PrePersist
    @PreUpdate
    void ensureStockStatus() {
        if (stockStatus == null || stockStatus.isBlank()) {
            stockStatus = "ACTIVE";
        }
    }
}
