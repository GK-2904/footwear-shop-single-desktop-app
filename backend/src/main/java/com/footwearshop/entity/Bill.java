package com.footwearshop.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@Entity
@Table(name = "bills")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Bill {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "bill_no", unique = true, length = 50)
    private String billNo;

    @Column(name = "sequence_no")
    private Integer sequenceNo;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "financial_year_id")
    private FinancialYear financialYear;

    @Column(name = "payment_mode", length = 10)
    private String paymentMode;

    @Column(name = "sub_total", nullable = false, precision = 10, scale = 2)
    private BigDecimal subTotal;

    @Column(name = "manual_adjustment", precision = 10, scale = 2)
    private BigDecimal manualAdjustment;

    @Column(name = "total_amount", nullable = false, precision = 10, scale = 2)
    private BigDecimal totalAmount;

    @Column(name = "total_margin", precision = 10, scale = 2)
    private BigDecimal totalMargin;

    @Column(name = "total_returned", precision = 10, scale = 2)
    private BigDecimal totalReturned = BigDecimal.ZERO;

    @Column(name = "bill_date")
    private LocalDate billDate;

    @Column(name = "bill_time")
    private LocalTime billTime;

    @OneToMany(mappedBy = "bill", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<BillItem> items;

    @PrePersist
    protected void onCreate() {
        this.billDate = LocalDate.now();
        this.billTime = LocalTime.now();
        if (totalReturned == null) {
            totalReturned = BigDecimal.ZERO;
        }
    }
}
