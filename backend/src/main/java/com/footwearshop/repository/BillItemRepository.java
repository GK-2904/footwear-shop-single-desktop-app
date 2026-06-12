package com.footwearshop.repository;

import com.footwearshop.entity.BillItem;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface BillItemRepository extends JpaRepository<BillItem,Long> {

    List<BillItem> findByBill_Id(Long billId);

    List<BillItem> findByProduct_Id(Long productId);

    boolean existsByProduct_IdAndSize(Long productId, Integer size);
}
