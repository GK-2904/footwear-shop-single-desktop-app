package com.footwearshop.service;

import com.footwearshop.entity.FootwearSizeStock;

import java.util.List;

public interface FootwearSizeStockService {

    FootwearSizeStock addStock(FootwearSizeStock stock);

    List<FootwearSizeStock> getStockByProduct(Long productId);

    FootwearSizeStock updateQuantity(Long stockId, int quantity);

    void reduceStock(Long productId, Integer size, int quantity);

    void reduceStockById(Long stockId, int quantity);

    void restoreStock(Long productId, Integer size, int quantity);

    List<FootwearSizeStock> getAllStock();

    List<FootwearSizeStock> getStockByStatus(String status);

    FootwearSizeStock updateStock(Long stockId, FootwearSizeStock data);

    void deleteStock(Long stockId);
}
