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
    private final com.footwearshop.service.FinancialYearService financialYearService;

    public BillingServiceImpl(
            BillRepository billRepository,
            BillItemRepository billItemRepository,
            FootwearProductRepository productRepository,
            FootwearSizeStockService stockService,
            com.footwearshop.service.FinancialYearService financialYearService
    ) {
        this.billRepository = billRepository;
        this.billItemRepository = billItemRepository;
        this.productRepository = productRepository;
        this.stockService = stockService;
        this.financialYearService = financialYearService;
    }

    @Override
    public BillResponseDto createBill(BillRequest request) {
        if (request == null || request.getItems() == null || request.getItems().isEmpty()) {
            throw new IllegalArgumentException("Bill items cannot be empty");
        }

        BigDecimal subTotal = BigDecimal.ZERO;
        BigDecimal totalMargin = BigDecimal.ZERO;

        for (BillItemRequest item : request.getItems()) {
            subTotal = subTotal.add(item.getTotal());
            if (item.getLineMargin() != null) {
                totalMargin = totalMargin.add(item.getLineMargin());
            } else if (item.getPurchasePrice() != null) {
                BigDecimal margin = item.getActualUnitPrice()
                        .subtract(item.getPurchasePrice())
                        .multiply(BigDecimal.valueOf(item.getQuantity()));
                totalMargin = totalMargin.add(margin);
            }
        }

        BigDecimal manualAdj = request.getManualAdjustment() != null
                ? request.getManualAdjustment() : BigDecimal.ZERO;
        BigDecimal totalAmount = subTotal.add(manualAdj);

        FinancialYear activeFy = financialYearService.getActiveFinancialYear();
        Integer maxSeq = billRepository.findMaxSequenceByFinancialYearId(activeFy.getId());
        int nextSeq = (maxSeq != null ? maxSeq : 0) + 1;
        String fySegment = activeFy.getName().replace("FY ", "");
        String generatedBillNo = String.format("SF/%s/%04d", fySegment, nextSeq);

        Bill bill = new Bill();
        bill.setPaymentMode(request.getPaymentMode() != null ? request.getPaymentMode() : "CASH");
        bill.setBillDate(LocalDate.now());
        bill.setSubTotal(subTotal);
        bill.setManualAdjustment(manualAdj);
        bill.setTotalAmount(totalAmount);
        bill.setTotalMargin(totalMargin);
        bill.setTotalReturned(BigDecimal.ZERO);
        bill.setFinancialYear(activeFy);
        bill.setSequenceNo(nextSeq);
        bill.setBillNo(generatedBillNo);

        Bill savedBill = billRepository.save(bill);

        List<BillItem> savedItems = new ArrayList<>();
        for (BillItemRequest req : request.getItems()) {
            FootwearProduct product = productRepository.findById(req.getProductId())
                    .orElseThrow(() -> new IllegalArgumentException("Product not found: " + req.getProductId()));

            BillItem billItem = new BillItem();
            billItem.setBill(savedBill);
            billItem.setProduct(product);
            billItem.setSize(req.getSize());
            billItem.setQuantity(req.getQuantity());
            billItem.setMrp(req.getMrp());
            billItem.setPurchasePrice(req.getPurchasePrice());
            billItem.setDefaultSellingPrice(req.getDefaultSellingPrice());
            billItem.setActualUnitPrice(req.getActualUnitPrice());
            billItem.setLineMargin(req.getLineMargin() != null ? req.getLineMargin() :
                    req.getActualUnitPrice().subtract(
                            req.getPurchasePrice() != null ? req.getPurchasePrice() : BigDecimal.ZERO
                    ).multiply(BigDecimal.valueOf(req.getQuantity())));
            billItem.setTotal(req.getTotal());
            billItem.setReturnedQty(0);
            billItem.setReturnedAmount(BigDecimal.ZERO);

            savedItems.add(billItemRepository.save(billItem));
            if (req.getStockId() != null) {
                stockService.reduceStockById(req.getStockId(), req.getQuantity());
            } else {
                stockService.reduceStock(req.getProductId(), req.getSize(), req.getQuantity());
            }
        }

        savedBill.setItems(savedItems);
        return getBillById(savedBill.getId());
    }

    @Override
    public BillResponseDto getBillById(Long id) {
        Bill bill = billRepository.findByIdWithItems(id)
                .orElseThrow(() -> new IllegalArgumentException("Bill not found"));
        return mapToResponseDto(bill);
    }

    @Override
    public List<BillResponseDto> getAllBills() {
        FinancialYear activeFy = financialYearService.getActiveFinancialYear();
        return billRepository.findAllByFinancialYearIdWithItems(activeFy.getId()).stream()
                .map(this::mapToResponseDto)
                .collect(Collectors.toList());
    }

    @Override
    public List<BillResponseDto> getBillsByDateRange(LocalDate from, LocalDate to) {
        FinancialYear activeFy = financialYearService.getActiveFinancialYear();
        return billRepository.findByBillDateBetweenAndFinancialYearIdWithItems(from, to, activeFy.getId()).stream()
                .map(this::mapToResponseDto)
                .collect(Collectors.toList());
    }

    private BillResponseDto mapToResponseDto(Bill bill) {
        List<BillItemResponseDto> items = bill.getItems().stream().map(item -> {
            BillItemResponseDto dto = new BillItemResponseDto();
            dto.setId(item.getId());
            dto.setProductName(item.getProduct().getBrand().getName());
            dto.setSubBrand(item.getProduct().getSubBrand());
            dto.setArticle(item.getProduct().getArticle());
            dto.setCategory(item.getProduct().getCategory());
            dto.setType(item.getProduct().getType());
            dto.setColor(item.getProduct().getColor());
            dto.setSize(item.getSize());
            dto.setQuantity(item.getQuantity());
            dto.setMrp(item.getMrp());
            dto.setPurchasePrice(item.getPurchasePrice());
            dto.setDefaultSellingPrice(item.getDefaultSellingPrice());
            dto.setActualUnitPrice(item.getActualUnitPrice());
            dto.setLineMargin(item.getLineMargin());
            dto.setTotal(item.getTotal());
            dto.setReturnedQty(item.getReturnedQty() != null ? item.getReturnedQty() : 0);
            dto.setReturnedAmount(item.getReturnedAmount() != null ? item.getReturnedAmount() : BigDecimal.ZERO);
            int returned = dto.getReturnedQty();
            dto.setReturnableQty(item.getQuantity() - returned);
            return dto;
        }).collect(Collectors.toList());

        BigDecimal totalReturned = bill.getTotalReturned() != null ? bill.getTotalReturned() : BigDecimal.ZERO;
        BigDecimal totalMargin = bill.getTotalMargin() != null ? bill.getTotalMargin() : BigDecimal.ZERO;

        BillResponseDto dto = new BillResponseDto();
        dto.setId(bill.getId());
        dto.setBillNo(bill.getBillNo());
        dto.setFinancialYearName(bill.getFinancialYear() != null ? bill.getFinancialYear().getName() : "");
        dto.setPaymentMode(bill.getPaymentMode());
        dto.setBillDate(bill.getBillDate());
        dto.setBillTime(bill.getBillTime());
        dto.setSubTotal(bill.getSubTotal());
        dto.setManualAdjustment(bill.getManualAdjustment());
        dto.setTotalAmount(bill.getTotalAmount());
        dto.setTotalMargin(totalMargin);
        dto.setTotalReturned(totalReturned);
        dto.setNetTotal(bill.getTotalAmount().subtract(totalReturned));
        BigDecimal returnedMargin = items.stream()
                .map(i -> {
                    if (i.getReturnedQty() == null || i.getReturnedQty() == 0) return BigDecimal.ZERO;
                    BigDecimal unitMargin = i.getActualUnitPrice().subtract(
                            i.getPurchasePrice() != null ? i.getPurchasePrice() : BigDecimal.ZERO
                    );
                    return unitMargin.multiply(BigDecimal.valueOf(i.getReturnedQty()));
                })
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        dto.setNetMargin(totalMargin.subtract(returnedMargin));
        dto.setItems(items);
        return dto;
    }
}
