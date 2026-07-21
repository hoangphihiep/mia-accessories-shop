package com.accessories.shop.backend.dto.response;

import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
public class InventoryReceiptResponse {
    private Long id;
    private UserResponse createdBy;
    private String supplier;
    private SupplierResponse supplierEntity;
    private BigDecimal totalCost;
    private LocalDateTime createdAt;
    private List<InventoryReceiptDetailResponse> details;
}
