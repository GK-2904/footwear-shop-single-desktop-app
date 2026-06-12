package com.footwearshop.config;

import com.footwearshop.entity.Brand;
import com.footwearshop.entity.FootwearProduct;
import com.footwearshop.entity.FootwearSizeStock;
import com.footwearshop.repository.BrandRepository;
import com.footwearshop.repository.FootwearProductRepository;
import com.footwearshop.repository.FootwearSizeStockRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;

import java.math.BigDecimal;

@Configuration
public class DataSeeder {

    @Bean
    @Profile("seed")
    CommandLineRunner seedData(
            BrandRepository brandRepository,
            FootwearProductRepository productRepository,
            FootwearSizeStockRepository stockRepository
    ) {
        return args -> {
            if (brandRepository.count() > 0) return;

            Brand bata = new Brand();
            bata.setName("Bata");
            bata = brandRepository.save(bata);

            Brand relaxo = new Brand();
            relaxo.setName("Relaxo");
            relaxo = brandRepository.save(relaxo);

            FootwearProduct menSports = new FootwearProduct();
            menSports.setBrand(bata);
            menSports.setCategory("Men");
            menSports.setType("Sports");
            menSports.setColor("Black");
            menSports.setSection("A");
            menSports.setRack("1");
            menSports.setShelf("1");
            productRepository.save(menSports);

            for (int size : new int[]{7, 8, 9, 10}) {
                FootwearSizeStock stock = new FootwearSizeStock();
                stock.setProduct(menSports);
                stock.setSize(size);
                stock.setQuantity(10);
                stock.setPurchasePrice(new BigDecimal("800"));
                stock.setMrp(new BigDecimal("1499"));
                stock.setSellingPrice(new BigDecimal("1299"));
                stock.setSection("A");
                stock.setRack("1");
                stock.setShelf("1");
                stockRepository.save(stock);
            }

            FootwearProduct womenCasual = new FootwearProduct();
            womenCasual.setBrand(relaxo);
            womenCasual.setCategory("Women");
            womenCasual.setType("Casual");
            womenCasual.setColor("Brown");
            womenCasual.setSection("B");
            womenCasual.setRack("2");
            womenCasual.setShelf("1");
            productRepository.save(womenCasual);

            for (int size : new int[]{5, 6, 7}) {
                FootwearSizeStock stock = new FootwearSizeStock();
                stock.setProduct(womenCasual);
                stock.setSize(size);
                stock.setQuantity(8);
                stock.setPurchasePrice(new BigDecimal("600"));
                stock.setMrp(new BigDecimal("1199"));
                stock.setSellingPrice(new BigDecimal("999"));
                stock.setSection("B");
                stock.setRack("2");
                stock.setShelf("1");
                stockRepository.save(stock);
            }
        };
    }
}
