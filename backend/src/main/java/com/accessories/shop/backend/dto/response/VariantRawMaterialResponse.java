package com.accessories.shop.backend.dto.response;

import lombok.Getter;
import lombok.Setter;
import java.math.BigDecimal;

@Getter
@Setter
public class VariantRawMaterialResponse {
    private Long id;
    private ProductVariantResponse materialVariant;
    private BigDecimal quantity;
}
