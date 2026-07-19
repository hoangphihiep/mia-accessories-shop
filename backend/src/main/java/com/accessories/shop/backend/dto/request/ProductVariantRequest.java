package com.accessories.shop.backend.dto.request;

import lombok.Getter;
import lombok.Setter;
import java.math.BigDecimal;

@Getter
@Setter
public class ProductVariantRequest {
    private String name;
    private BigDecimal price;
    private Integer stockQuantity;
    private String sku;
    private Long productId;
}
