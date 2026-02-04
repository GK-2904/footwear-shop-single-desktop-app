package com.footwearshop.entity;

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

    // ✅ MUST be named "product"
    @ManyToOne
    @JoinColumn(name = "product_id", nullable = false)
    private FootwearProduct product;

    @Column(nullable = false)
    private Integer size;

    @Column(nullable = false)
    private Integer quantity;

    @Column(name = "cost_price", precision = 10, scale = 2)
    private BigDecimal costPrice;

    @Column(name = "selling_price", precision = 10, scale = 2)
    private BigDecimal sellingPrice;

    private String section;   // ✅ ADD
    private String rack;      // ✅ ADD
    private String shelf;
}
