package com.footwearshop.service;

import com.footwearshop.entity.FootwearSizeStock;

import java.util.List;

public interface FootwearSizeStockService {

    // ➕ Add new stock OR update existing size stock
    FootwearSizeStock addStock(FootwearSizeStock stock);

    // 📦 Get all size-wise stock for a product
    List<FootwearSizeStock> getStockByProduct(Long productId);

    // ✏️ Update quantity directly (admin/manual update)
    FootwearSizeStock updateQuantity(Long stockId, int quantity);

    // ➖ Reduce stock during billing
    void reduceStock(Long productId, Integer size, int quantity);
    List<FootwearSizeStock> getAllStock();

    public FootwearSizeStock updateStock(Long stockId, FootwearSizeStock data);
    public void deleteStock(Long stockId);

}
