package com.footwearshop.repository;

import com.footwearshop.entity.BillReturn;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface BillReturnRepository extends JpaRepository<BillReturn, Long> {
    List<BillReturn> findByBillId(Long billId);
}
