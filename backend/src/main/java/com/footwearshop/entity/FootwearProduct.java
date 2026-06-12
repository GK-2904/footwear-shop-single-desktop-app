package com.footwearshop.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Getter
@Setter
@Entity
@Table(name = "footwear_product")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class FootwearProduct {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String subBrand;
    private String article;
    private String category;
    private String kidsSubCategory;
    private String type;
    private String color;

    private String rack;
    private String shelf;
    private String section;

    @ManyToOne
    @JoinColumn(name = "brand_id")
    private Brand brand;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;
}
