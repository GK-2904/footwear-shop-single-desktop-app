package com.footwearshop.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;

@Entity
@Table(name = "bill_items")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class BillItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "bill_id", nullable = false)
    private Bill bill;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false)
    private FootwearProduct product;

    @Column(nullable = false)
    private Integer size;

    @Column(nullable = false)
    private Integer quantity;

    @Column(precision = 10, scale = 2)
    private BigDecimal mrp;

    @Column(name = "purchase_price", precision = 10, scale = 2)
    private BigDecimal purchasePrice;

    @Column(name = "default_selling_price", precision = 10, scale = 2)
    private BigDecimal defaultSellingPrice;

    @Column(name = "actual_unit_price", precision = 10, scale = 2)
    private BigDecimal actualUnitPrice;

    @Column(name = "line_margin", precision = 10, scale = 2)
    private BigDecimal lineMargin;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal total;

    @Column(name = "returned_qty")
    private Integer returnedQty = 0;

    @Column(name = "returned_amount", precision = 10, scale = 2)
    private BigDecimal returnedAmount = BigDecimal.ZERO;
}
