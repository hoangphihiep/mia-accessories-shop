package com.accessories.shop.backend.dto.response;

import lombok.Getter;
import lombok.Setter;
import java.math.BigDecimal;

@Getter
@Setter
public class InventoryReceiptDetailResponse {
    private Long id;
    private ProductVariantResponse productVariant;
    private Double quantity;
    private BigDecimal unitPrice;
}
