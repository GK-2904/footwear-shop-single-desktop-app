package com.footwearshop.service.Impl;

import com.footwearshop.dto.*;
import com.footwearshop.entity.*;
import com.footwearshop.repository.*;
import com.footwearshop.service.BillingService;
import com.footwearshop.service.FootwearSizeStockService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class BillingServiceImpl implements BillingService {

    private final BillRepository billRepository;
    private final BillItemRepository billItemRepository;
    private final FootwearProductRepository productRepository;
    private final FootwearSizeStockService stockService;

    public BillingServiceImpl(
            BillRepository billRepository,
            BillItemRepository billItemRepository,
            FootwearProductRepository productRepository,
            FootwearSizeStockService stockService
    ) {
        this.billRepository = billRepository;
        this.billItemRepository = billItemRepository;
        this.productRepository = productRepository;
        this.stockService = stockService;
    }

    /* ================= CREATE BILL ================= */

    @Override
    public BillResponseDto createBill(BillRequest request) {

        if (request == null || request.getItems() == null || request.getItems().isEmpty()) {
            throw new IllegalArgumentException("Bill items cannot be empty");
        }

        /* ---------- CALCULATE TOTALS ---------- */

        BigDecimal subTotal = BigDecimal.ZERO;
        for (BillItemRequest item : request.getItems()) {
            subTotal = subTotal.add(item.getTotal());
        }

        BigDecimal gstPercentage =
                request.getGstPercentage() != null
                        ? request.getGstPercentage()
                        : BigDecimal.ZERO;

        BigDecimal gstAmount = subTotal
                .multiply(gstPercentage)
                .divide(BigDecimal.valueOf(100));

        BigDecimal totalAmount = subTotal.add(gstAmount);

        /* ---------- SAVE BILL ---------- */

        Bill bill = new Bill();
        bill.setOwnerName(request.getOwnerName());
        bill.setBillDate(LocalDate.now());
        bill.setBillTime(LocalTime.now());
        bill.setGstPercentage(gstPercentage);
        bill.setSubTotal(subTotal);
        bill.setGstAmount(gstAmount);
        bill.setTotalAmount(totalAmount);

        Bill savedBill = billRepository.save(bill);

        /* ---------- SAVE ITEMS + REDUCE STOCK ---------- */

        List<BillItem> savedItems = new ArrayList<>();

        for (BillItemRequest req : request.getItems()) {

            FootwearProduct product = productRepository.findById(req.getProductId())
                    .orElseThrow(() ->
                            new IllegalArgumentException(
                                    "Product not found: " + req.getProductId()
                            )
                    );

            BillItem billItem = new BillItem();
            billItem.setBill(savedBill);
            billItem.setProduct(product);
            billItem.setSize(req.getSize());          // Integer
            billItem.setQuantity(req.getQuantity());  // Integer
            billItem.setPrice(req.getPrice());
            billItem.setTotal(req.getTotal());

            BillItem savedItem = billItemRepository.save(billItem);
            savedItems.add(savedItem);

            // Reduce stock
            stockService.reduceStock(
                    req.getProductId(),
                    req.getSize(),
                    req.getQuantity()
            );
        }

        // 🔥 THIS WAS MISSING
        savedBill.setItems(savedItems);

        return mapToResponseDto(savedBill);
    }

    /* ================= GET BILL BY ID ================= */

    @Override
    public BillResponseDto getBillById(Long id) {
        Bill bill = billRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Bill not found"));
        return mapToResponseDto(bill);
    }

    /* ================= GET ALL BILLS ================= */

    @Override
    public List<BillResponseDto> getAllBills() {
        return billRepository.findAll()
                .stream()
                .map(this::mapToResponseDto)
                .collect(Collectors.toList());
    }

    /* ================= DTO MAPPER ================= */

    private BillResponseDto mapToResponseDto(Bill bill) {

        List<BillItemResponseDto> items =
                bill.getItems().stream().map(item -> {
                    BillItemResponseDto dto = new BillItemResponseDto();
                    dto.setProductName(item.getProduct().getBrand().getName());
                    dto.setCategory(item.getProduct().getCategory());
                    dto.setType(item.getProduct().getType());
                    dto.setColor(item.getProduct().getColor());
                    dto.setSize(item.getSize());
                    dto.setQuantity(item.getQuantity());
                    dto.setPrice(item.getPrice());
                    dto.setTotal(item.getTotal());
                    return dto;
                }).collect(Collectors.toList());

        BillResponseDto dto = new BillResponseDto();
        dto.setId(bill.getId());
        dto.setOwnerName(bill.getOwnerName());
        dto.setBillDate(bill.getBillDate());
        dto.setBillTime(bill.getBillTime());
        dto.setSubTotal(bill.getSubTotal());
        dto.setGstPercentage(bill.getGstPercentage());
        dto.setGstAmount(bill.getGstAmount());
        dto.setTotalAmount(bill.getTotalAmount());
        dto.setItems(items);

        return dto;
    }
}
