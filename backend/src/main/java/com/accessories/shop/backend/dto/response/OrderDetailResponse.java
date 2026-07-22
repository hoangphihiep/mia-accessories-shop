package com.accessories.shop.backend.dto.response;

import lombok.Getter;
import lombok.Setter;
import java.math.BigDecimal;

@Getter
@Setter
public class OrderDetailResponse {
    private Long id;
    private ProductVariantResponse productVariant;
    private Integer quantity;
    private BigDecimal price;
    private BigDecimal unitCost;
}
