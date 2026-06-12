package com.footwearshop.repository;

import com.footwearshop.entity.FinancialYear;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.Optional;

public interface FinancialYearRepository extends JpaRepository<FinancialYear, Long> {

    Optional<FinancialYear> findByIsActiveTrue();

    Optional<FinancialYear> findByName(String name);

    @Query("SELECT f FROM FinancialYear f WHERE :date BETWEEN f.startDate AND f.endDate")
    Optional<FinancialYear> findByDate(@Param("date") LocalDate date);
}
