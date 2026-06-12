package com.footwearshop.repository;

import com.footwearshop.entity.Bill;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface BillRepository extends JpaRepository<Bill, Long> {

    List<Bill> findByBillDate(LocalDate billDate);

    @Query("SELECT DISTINCT b FROM Bill b LEFT JOIN FETCH b.items i LEFT JOIN FETCH i.product p LEFT JOIN FETCH p.brand WHERE b.id = :id")
    Optional<Bill> findByIdWithItems(@Param("id") Long id);

    @Query("SELECT DISTINCT b FROM Bill b LEFT JOIN FETCH b.items i LEFT JOIN FETCH i.product p LEFT JOIN FETCH p.brand ORDER BY b.id DESC")
    List<Bill> findAllWithItems();

    @Query("SELECT DISTINCT b FROM Bill b LEFT JOIN FETCH b.items i LEFT JOIN FETCH i.product p LEFT JOIN FETCH p.brand WHERE b.billDate BETWEEN :from AND :to ORDER BY b.id DESC")
    List<Bill> findByBillDateBetweenWithItems(@Param("from") LocalDate from, @Param("to") LocalDate to);

    @Query("SELECT COALESCE(MAX(b.sequenceNo), 0) FROM Bill b WHERE b.financialYear.id = :fyId")
    Integer findMaxSequenceByFinancialYearId(@Param("fyId") Long fyId);

    @Query("SELECT DISTINCT b FROM Bill b LEFT JOIN FETCH b.items i LEFT JOIN FETCH i.product p LEFT JOIN FETCH p.brand WHERE b.financialYear.id = :fyId ORDER BY b.id DESC")
    List<Bill> findAllByFinancialYearIdWithItems(@Param("fyId") Long fyId);

    @Query("SELECT DISTINCT b FROM Bill b LEFT JOIN FETCH b.items i LEFT JOIN FETCH i.product p LEFT JOIN FETCH p.brand WHERE b.financialYear.id = :fyId AND b.billDate BETWEEN :from AND :to ORDER BY b.id DESC")
    List<Bill> findByBillDateBetweenAndFinancialYearIdWithItems(@Param("from") LocalDate from, @Param("to") LocalDate to, @Param("fyId") Long fyId);
}
