package com.footwearshop.service;

import com.footwearshop.dto.BillResponseDto;
import com.footwearshop.dto.BillReturnRequest;

public interface ReturnService {
    BillResponseDto processReturn(Long billId, BillReturnRequest request);
}
