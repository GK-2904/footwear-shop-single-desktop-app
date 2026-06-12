package com.footwearshop.service.Impl;

import com.footwearshop.dto.BillResponseDto;
import com.footwearshop.dto.BillReturnRequest;
import com.footwearshop.entity.Bill;
import com.footwearshop.entity.BillItem;
import com.footwearshop.entity.BillReturn;
import com.footwearshop.repository.BillItemRepository;
import com.footwearshop.repository.BillRepository;
import com.footwearshop.repository.BillReturnRepository;
import com.footwearshop.service.BillingService;
import com.footwearshop.service.FootwearSizeStockService;
import com.footwearshop.service.ReturnService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;

@Service
@Transactional
public class ReturnServiceImpl implements ReturnService {

    private final BillRepository billRepository;
    private final BillItemRepository billItemRepository;
    private final BillReturnRepository billReturnRepository;
    private final FootwearSizeStockService stockService;
    private final BillingService billingService;

    public ReturnServiceImpl(
            BillRepository billRepository,
            BillItemRepository billItemRepository,
            BillReturnRepository billReturnRepository,
            FootwearSizeStockService stockService,
            BillingService billingService
    ) {
        this.billRepository = billRepository;
        this.billItemRepository = billItemRepository;
        this.billReturnRepository = billReturnRepository;
        this.stockService = stockService;
        this.billingService = billingService;
    }

    @Override
    public BillResponseDto processReturn(Long billId, BillReturnRequest request) {
        if (request.getBillItemId() == null || request.getReturnQty() == null || request.getReturnQty() <= 0) {
            throw new IllegalArgumentException("Invalid return request");
        }

        Bill bill = billRepository.findById(billId)
                .orElseThrow(() -> new IllegalArgumentException("Bill not found"));

        BillItem item = billItemRepository.findById(request.getBillItemId())
                .orElseThrow(() -> new IllegalArgumentException("Bill item not found"));

        if (!item.getBill().getId().equals(billId)) {
            throw new IllegalArgumentException("Bill item does not belong to this bill");
        }

        int alreadyReturned = item.getReturnedQty() != null ? item.getReturnedQty() : 0;
        int returnable = item.getQuantity() - alreadyReturned;
        if (request.getReturnQty() > returnable) {
            throw new IllegalArgumentException("Return quantity exceeds returnable amount. Max: " + returnable);
        }

        BigDecimal refundAmount = item.getActualUnitPrice()
                .multiply(BigDecimal.valueOf(request.getReturnQty()));

        BillReturn billReturn = new BillReturn();
        billReturn.setBill(bill);
        billReturn.setBillItem(item);
        billReturn.setReturnQty(request.getReturnQty());
        billReturn.setRefundAmount(refundAmount);
        billReturnRepository.save(billReturn);

        item.setReturnedQty(alreadyReturned + request.getReturnQty());
        item.setReturnedAmount(
                (item.getReturnedAmount() != null ? item.getReturnedAmount() : BigDecimal.ZERO).add(refundAmount)
        );
        billItemRepository.save(item);

        BigDecimal billReturned = bill.getTotalReturned() != null ? bill.getTotalReturned() : BigDecimal.ZERO;
        bill.setTotalReturned(billReturned.add(refundAmount));
        billRepository.save(bill);

        stockService.restoreStock(
                item.getProduct().getId(),
                item.getSize(),
                request.getReturnQty()
        );

        return billingService.getBillById(billId);
    }
}
