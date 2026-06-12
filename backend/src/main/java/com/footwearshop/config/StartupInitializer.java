package com.footwearshop.config;

import com.footwearshop.service.FinancialYearService;
import org.springframework.boot.CommandLineRunner;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

@Component
public class StartupInitializer implements CommandLineRunner {

    private final FinancialYearService financialYearService;
    private final JdbcTemplate jdbcTemplate;

    public StartupInitializer(FinancialYearService financialYearService, JdbcTemplate jdbcTemplate) {
        this.financialYearService = financialYearService;
        this.jdbcTemplate = jdbcTemplate;
    }

    @Override
    public void run(String... args) throws Exception {
        // Self-healing: Resolve H2 database schema mismatch for obsolete columns/constraints
        try {
            jdbcTemplate.execute("ALTER TABLE bills ALTER COLUMN owner_name DROP NOT NULL");
        } catch (Exception ignored) {
        }
        try {
            jdbcTemplate.execute("ALTER TABLE bills DROP COLUMN IF EXISTS owner_name");
        } catch (Exception ignored) {
        }

        // Run database migration/initialization for Financial Years
        financialYearService.initFinancialYears();

        // Ensure there is always an active financial year initialized
        try {
            financialYearService.getActiveFinancialYear();
        } catch (Exception e) {
            System.err.println("Failed to auto-initialize active financial year: " + e.getMessage());
        }
    }
}
