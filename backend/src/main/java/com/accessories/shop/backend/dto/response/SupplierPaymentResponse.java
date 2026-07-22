package com.accessories.shop.backend.dto.response;

import lombok.Builder;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
public class SupplierPaymentResponse {
    private Long id;
    private Long supplierId;
    private String createdBy;
    private BigDecimal amount;
    private String note;
    private LocalDateTime createdAt;
}
