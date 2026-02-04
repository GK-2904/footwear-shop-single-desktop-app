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
    private Long id;   // Auto numeric bill id

    @Column(name = "owner_name", nullable = false)
    private String ownerName;

    @Column(name = "gst_percentage", precision = 5, scale = 2)
    private BigDecimal gstPercentage;

    @Column(name = "sub_total", nullable = false, precision = 10, scale = 2)
    private BigDecimal subTotal;

    @Column(name = "gst_amount", precision = 10, scale = 2)
    private BigDecimal gstAmount;

    @Column(name = "total_amount", nullable = false, precision = 10, scale = 2)
    private BigDecimal totalAmount;

    @Column(name = "bill_date")
    private LocalDate billDate;

    @Column(name = "bill_time")
    private LocalTime billTime;

    /* ================= RELATION WITH BILL ITEMS ================= */

    @OneToMany(
            mappedBy = "bill",
            cascade = CascadeType.ALL,
            fetch = FetchType.LAZY
    )
    private List<BillItem> items;

    /* ================= AUTO DATE & TIME ================= */

    @PrePersist
    protected void onCreate() {
        this.billDate = LocalDate.now();
        this.billTime = LocalTime.now();
    }
}
