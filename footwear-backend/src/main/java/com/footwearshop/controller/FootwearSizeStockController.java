package com.footwearshop.controller;

import com.footwearshop.entity.FootwearSizeStock;
import com.footwearshop.service.FootwearSizeStockService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/stocks")
@CrossOrigin(origins = "*")
public class FootwearSizeStockController {

    private final FootwearSizeStockService stockService;

    public FootwearSizeStockController(FootwearSizeStockService stockService) {
        this.stockService = stockService;
    }

    // 1️⃣ Add stock
    @PostMapping
    public FootwearSizeStock addStock(@RequestBody FootwearSizeStock stock) {
        return stockService.addStock(stock);
    }

    // 4️⃣ Get ALL size stock (REQUIRED FOR BILLING PAGE)
    @GetMapping
    public List<FootwearSizeStock> getAllStock() {
        return stockService.getAllStock();
    }


    // 2️⃣ Get stock by product
    @GetMapping("/product/{productId}")
    public List<FootwearSizeStock> getStockByProduct(@PathVariable Long productId) {
        return stockService.getStockByProduct(productId);
    }

    // 3️⃣ Update quantity manually (optional)
    @PutMapping("/{stockId}/quantity")
    public FootwearSizeStock updateQuantity(
            @PathVariable Long stockId,
            @RequestParam int quantity
    ) {
        return stockService.updateQuantity(stockId, quantity);
    }


    @PutMapping("/{stockId}")
    public FootwearSizeStock updateStock(
            @PathVariable Long stockId,
            @RequestBody FootwearSizeStock data
    ) {
        return stockService.updateStock(stockId, data);
    }


    @DeleteMapping("/{stockId}")
    public void deleteStock(@PathVariable Long stockId) {
        stockService.deleteStock(stockId);
    }


}
