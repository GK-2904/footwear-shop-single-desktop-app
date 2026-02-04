package com.footwearshop.service.Impl;

import com.footwearshop.entity.FootwearProduct;
import com.footwearshop.entity.FootwearSizeStock;
import com.footwearshop.repository.FootwearProductRepository;
import com.footwearshop.repository.FootwearSizeStockRepository;
import com.footwearshop.service.FootwearSizeStockService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
public class FootwearSizeStockServiceImpl implements FootwearSizeStockService {

    private final FootwearSizeStockRepository stockRepository;
    private final FootwearProductRepository productRepository;

    public FootwearSizeStockServiceImpl(
            FootwearSizeStockRepository stockRepository,
            FootwearProductRepository productRepository
    ) {
        this.stockRepository = stockRepository;
        this.productRepository = productRepository;
    }

    /* ================= ADD / UPDATE STOCK ================= */

    @Override
    public FootwearSizeStock addStock(FootwearSizeStock stock) {

        if (stock == null) {
            throw new IllegalArgumentException("Stock data cannot be null");
        }

        if (stock.getProduct() == null || stock.getProduct().getId() == null) {
            throw new IllegalArgumentException("Product ID is required to add stock");
        }

        if (stock.getSize() == null) {
            throw new IllegalArgumentException("Size is required");
        }

        if (stock.getQuantity() <= 0) {
            throw new IllegalArgumentException("Stock quantity must be greater than zero");
        }

        if (stock.getCostPrice() == null || stock.getSellingPrice() == null) {
            throw new IllegalArgumentException("Cost price and selling price are required");
        }

        Long productId = stock.getProduct().getId();

        FootwearProduct product = productRepository.findById(productId)
                .orElseThrow(() ->
                        new IllegalArgumentException("Product not found with id: " + productId)
                );

        return stockRepository
                .findByProductIdAndSize(productId, stock.getSize())
                .map(existing -> {
                    existing.setQuantity(existing.getQuantity() + stock.getQuantity());
                    existing.setCostPrice(stock.getCostPrice());
                    existing.setSellingPrice(stock.getSellingPrice());
                    return stockRepository.save(existing);
                })
                .orElseGet(() -> {
                    stock.setProduct(product);
                    return stockRepository.save(stock);
                });
    }

    /* ================= GET STOCK ================= */

    @Override
    public List<FootwearSizeStock> getStockByProduct(Long productId) {

        if (productId == null) {
            throw new IllegalArgumentException("Product ID must not be null");
        }

        return stockRepository.findByProductId(productId);
    }

    @Override
    public List<FootwearSizeStock> getAllStock() {
        return stockRepository.findAll();
    }

    /* ================= UPDATE QUANTITY ================= */

    @Override
    public FootwearSizeStock updateQuantity(Long stockId, int quantity) {

        if (stockId == null) {
            throw new IllegalArgumentException("Stock ID is required");
        }

        if (quantity < 0) {
            throw new IllegalArgumentException("Quantity cannot be negative");
        }

        FootwearSizeStock stock = stockRepository.findById(stockId)
                .orElseThrow(() ->
                        new IllegalArgumentException("Stock not found with id: " + stockId)
                );

        stock.setQuantity(quantity);
        return stockRepository.save(stock);
    }

    /* ================= REDUCE STOCK (BILLING) ================= */

    @Override
    public void reduceStock(Long productId, Integer size, int quantity) {

        if (productId == null) {
            throw new IllegalArgumentException("Product ID is required");
        }

        if (size == null) {
            throw new IllegalArgumentException("Size is required to reduce stock");
        }

        if (quantity <= 0) {
            throw new IllegalArgumentException("Quantity must be greater than zero");
        }

        FootwearSizeStock stock = stockRepository
                .findByProductIdAndSize(productId, size)
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "Stock not found for productId=" + productId +
                                        " and size=" + size
                        )
                );

        if (stock.getQuantity() < quantity) {
            throw new IllegalArgumentException(
                    "Insufficient stock. Available=" + stock.getQuantity() +
                            ", Requested=" + quantity
            );
        }

        stock.setQuantity(stock.getQuantity() - quantity);
        stockRepository.save(stock);
    }

    public FootwearSizeStock updateStock(Long stockId, FootwearSizeStock data) {
        FootwearSizeStock stock = stockRepository.findById(stockId)
                .orElseThrow(() -> new IllegalArgumentException("Stock not found"));

        stock.setSize(data.getSize());
        stock.setQuantity(data.getQuantity());
        stock.setCostPrice(data.getCostPrice());
        stock.setSellingPrice(data.getSellingPrice());
        stock.setSection(data.getSection());
        stock.setRack(data.getRack());
        stock.setShelf(data.getShelf());

        return stockRepository.save(stock);
    }

    public void deleteStock(Long stockId) {
        stockRepository.deleteById(stockId);
    }


}
