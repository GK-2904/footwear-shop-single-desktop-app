package com.footwearshop.service.Impl;

import com.footwearshop.entity.Bill;
import com.footwearshop.entity.FinancialYear;
import com.footwearshop.repository.BillRepository;
import com.footwearshop.repository.FinancialYearRepository;
import com.footwearshop.service.FinancialYearService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.Comparator;
import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class FinancialYearServiceImpl implements FinancialYearService {

    private final FinancialYearRepository financialYearRepository;
    private final BillRepository billRepository;

    public FinancialYearServiceImpl(
            FinancialYearRepository financialYearRepository,
            BillRepository billRepository
    ) {
        this.financialYearRepository = financialYearRepository;
        this.billRepository = billRepository;
    }

    @Override
    public List<FinancialYear> getAllFinancialYears() {
        return financialYearRepository.findAll();
    }

    @Override
    public FinancialYear getActiveFinancialYear() {
        // First look for active year
        Optional<FinancialYear> active = financialYearRepository.findByIsActiveTrue();
        if (active.isPresent()) {
            // Check if today falls past the active end date, if so we might want to auto-create the next year
            FinancialYear fy = active.get();
            if (LocalDate.now().isAfter(fy.getEndDate())) {
                // Auto create and activate next financial year
                return autoCreateAndActivateNextYear(fy);
            }
            return fy;
        }

        // If none active, find or create one for today's date
        FinancialYear todayFy = getOrCreateFinancialYearForDate(LocalDate.now());
        todayFy.setActive(true);
        return financialYearRepository.save(todayFy);
    }

    private FinancialYear autoCreateAndActivateNextYear(FinancialYear currentFy) {
        // Deactivate current
        currentFy.setActive(false);
        financialYearRepository.save(currentFy);

        // Create next year
        LocalDate nextStart = currentFy.getEndDate().plusDays(1);
        FinancialYear nextFy = getOrCreateFinancialYearForDate(nextStart);
        nextFy.setActive(true);
        return financialYearRepository.save(nextFy);
    }

    @Override
    public FinancialYear createFinancialYear(FinancialYear financialYear) {
        if (financialYear.getName() == null || financialYear.getName().trim().isEmpty()) {
            throw new IllegalArgumentException("Financial year name is required");
        }
        if (financialYear.getStartDate() == null || financialYear.getEndDate() == null) {
            throw new IllegalArgumentException("Start date and end date are required");
        }
        if (financialYear.getStartDate().isAfter(financialYear.getEndDate())) {
            throw new IllegalArgumentException("Start date must be before end date");
        }

        Optional<FinancialYear> existing = financialYearRepository.findByName(financialYear.getName());
        if (existing.isPresent()) {
            throw new IllegalArgumentException("Financial year with this name already exists");
        }

        return financialYearRepository.save(financialYear);
    }

    @Override
    public FinancialYear setActiveFinancialYear(Long id) {
        FinancialYear target = financialYearRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Financial year not found"));

        // Deactivate all others
        List<FinancialYear> all = financialYearRepository.findAll();
        for (FinancialYear fy : all) {
            fy.setActive(fy.getId().equals(id));
            financialYearRepository.save(fy);
        }

        return target;
    }

    @Override
    public FinancialYear getOrCreateFinancialYearForDate(LocalDate date) {
        int year = date.getYear();
        int month = date.getMonthValue();

        LocalDate start;
        LocalDate end;
        String name;

        if (month >= 4) { // April to Dec
            start = LocalDate.of(year, 4, 1);
            end = LocalDate.of(year + 1, 3, 31);
            name = "FY " + year + "-" + String.valueOf(year + 1).substring(2);
        } else { // Jan to March
            start = LocalDate.of(year - 1, 4, 1);
            end = LocalDate.of(year, 3, 31);
            name = "FY " + (year - 1) + "-" + String.valueOf(year).substring(2);
        }

        Optional<FinancialYear> existing = financialYearRepository.findByName(name);
        if (existing.isPresent()) {
            return existing.get();
        }

        FinancialYear newFy = new FinancialYear();
        newFy.setName(name);
        newFy.setStartDate(start);
        newFy.setEndDate(end);
        newFy.setActive(false);
        newFy.setLocked(false);
        return financialYearRepository.save(newFy);
    }

    @Override
    public void initFinancialYears() {
        List<Bill> allBills = billRepository.findAll();
        boolean hasUnassigned = allBills.stream().anyMatch(b -> b.getFinancialYear() == null);
        if (!hasUnassigned) {
            return;
        }

        // Assign financial years to bills
        for (Bill bill : allBills) {
            if (bill.getFinancialYear() == null) {
                LocalDate date = bill.getBillDate() != null ? bill.getBillDate() : LocalDate.now();
                FinancialYear fy = getOrCreateFinancialYearForDate(date);
                bill.setFinancialYear(fy);
                billRepository.save(bill);
            }
        }

        // Now compute sequence numbers and formatted bill numbers for all bills to ensure consistency
        List<FinancialYear> allFys = financialYearRepository.findAll();
        for (FinancialYear fy : allFys) {
            List<Bill> billsInFy = billRepository.findAll().stream()
                    .filter(b -> b.getFinancialYear().getId().equals(fy.getId()))
                    .sorted(Comparator.comparing(Bill::getId)) // Maintain chronological order of ID
                    .toList();

            int seq = 1;
            for (Bill bill : billsInFy) {
                if (bill.getSequenceNo() == null || bill.getBillNo() == null) {
                    bill.setSequenceNo(seq);
                    // Format e.g., SF/2026-27/0001
                    // Extract name digits, e.g., "FY 2026-27" -> "2026-27"
                    String fySegment = fy.getName().replace("FY ", "");
                    bill.setBillNo(String.format("SF/%s/%04d", fySegment, seq));
                    billRepository.save(bill);
                }
                seq++;
            }
        }
    }
}
