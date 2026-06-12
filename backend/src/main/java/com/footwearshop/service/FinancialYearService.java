package com.footwearshop.service;

import com.footwearshop.entity.FinancialYear;

import java.util.List;

public interface FinancialYearService {

    List<FinancialYear> getAllFinancialYears();

    FinancialYear getActiveFinancialYear();

    FinancialYear createFinancialYear(FinancialYear financialYear);

    FinancialYear setActiveFinancialYear(Long id);

    void initFinancialYears();

    FinancialYear getOrCreateFinancialYearForDate(java.time.LocalDate date);
}
