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
    private final com.footwearshop.repository.BillItemRepository billItemRepository;

    public FootwearSizeStockServiceImpl(
            FootwearSizeStockRepository stockRepository,
            FootwearProductRepository productRepository,
            com.footwearshop.repository.BillItemRepository billItemRepository
    ) {
        this.stockRepository = stockRepository;
        this.productRepository = productRepository;
        this.billItemRepository = billItemRepository;
    }

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
        if (stock.getPurchasePrice() == null || stock.getSellingPrice() == null) {
            throw new IllegalArgumentException("Purchase price and selling price are required");
        }

        Long productId = stock.getProduct().getId();
        FootwearProduct product = productRepository.findById(productId)
                .orElseThrow(() -> new IllegalArgumentException("Product not found with id: " + productId));

        if (stock.getStockStatus() == null || stock.getStockStatus().isBlank()) {
            stock.setStockStatus("ACTIVE");
        }

        return stockRepository
                .findByProductIdAndSize(productId, stock.getSize())
                .map(existing -> {
                    existing.setQuantity(existing.getQuantity() + stock.getQuantity());
                    existing.setPurchasePrice(stock.getPurchasePrice());
                    existing.setMrp(stock.getMrp());
                    existing.setSellingPrice(stock.getSellingPrice());
                    existing.setStockStatus(stock.getStockStatus());
                    existing.setSection(stock.getSection());
                    existing.setRack(stock.getRack());
                    existing.setShelf(stock.getShelf());
                    return stockRepository.save(existing);
                })
                .orElseGet(() -> {
                    stock.setProduct(product);
                    return stockRepository.save(stock);
                });
    }

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

    @Override
    public List<FootwearSizeStock> getStockByStatus(String status) {
        return stockRepository.findByStockStatus(status);
    }

    @Override
    public FootwearSizeStock updateQuantity(Long stockId, int quantity) {
        if (stockId == null) {
            throw new IllegalArgumentException("Stock ID is required");
        }
        if (quantity < 0) {
            throw new IllegalArgumentException("Quantity cannot be negative");
        }
        FootwearSizeStock stock = stockRepository.findById(stockId)
                .orElseThrow(() -> new IllegalArgumentException("Stock not found with id: " + stockId));
        stock.setQuantity(quantity);
        return stockRepository.save(stock);
    }

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
                .orElseThrow(() -> new IllegalArgumentException(
                        "Stock not found for productId=" + productId + " and size=" + size
                ));

        if (stock.getQuantity() < quantity) {
            throw new IllegalArgumentException(
                    "Insufficient stock. Available=" + stock.getQuantity() + ", Requested=" + quantity
            );
        }

        stock.setQuantity(stock.getQuantity() - quantity);
        stockRepository.save(stock);
    }

    @Override
    public void reduceStockById(Long stockId, int quantity) {
        if (stockId == null) {
            throw new IllegalArgumentException("Stock ID is required");
        }
        if (quantity <= 0) {
            throw new IllegalArgumentException("Quantity must be greater than zero");
        }

        FootwearSizeStock stock = stockRepository.findById(stockId)
                .orElseThrow(() -> new IllegalArgumentException("Stock not found with id: " + stockId));

        if (stock.getQuantity() < quantity) {
            throw new IllegalArgumentException(
                    "Insufficient stock. Available=" + stock.getQuantity() + ", Requested=" + quantity
            );
        }

        stock.setQuantity(stock.getQuantity() - quantity);
        stockRepository.save(stock);
    }

    @Override
    public void restoreStock(Long productId, Integer size, int quantity) {
        if (productId == null || size == null || quantity <= 0) {
            throw new IllegalArgumentException("Invalid restore stock request");
        }
        FootwearSizeStock stock = stockRepository
                .findByProductIdAndSize(productId, size)
                .orElseThrow(() -> new IllegalArgumentException(
                        "Stock not found for productId=" + productId + " and size=" + size
                ));
        stock.setQuantity(stock.getQuantity() + quantity);
        stockRepository.save(stock);
    }

    @Override
    public FootwearSizeStock updateStock(Long stockId, FootwearSizeStock data) {
        FootwearSizeStock stock = stockRepository.findById(stockId)
                .orElseThrow(() -> new IllegalArgumentException("Stock not found"));

        stock.setSize(data.getSize());
        stock.setQuantity(data.getQuantity());
        stock.setPurchasePrice(data.getPurchasePrice());
        stock.setMrp(data.getMrp());
        stock.setSellingPrice(data.getSellingPrice());
        stock.setStockStatus(data.getStockStatus() != null ? data.getStockStatus() : "ACTIVE");
        stock.setSection(data.getSection());
        stock.setRack(data.getRack());
        stock.setShelf(data.getShelf());

        return stockRepository.save(stock);
    }

    @Override
    public void deleteStock(Long stockId) {
        FootwearSizeStock stock = stockRepository.findById(stockId)
                .orElseThrow(() -> new IllegalArgumentException("Stock not found"));
        
        boolean inUse = billItemRepository.existsByProduct_IdAndSize(stock.getProduct().getId(), stock.getSize());
        if (inUse) {
            throw new IllegalArgumentException("Stock item is currently in use in sales and cannot be deleted.");
        }
        
        stockRepository.deleteById(stockId);
    }
}
