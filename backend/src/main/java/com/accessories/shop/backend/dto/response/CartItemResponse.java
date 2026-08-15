package com.accessories.shop.backend.dto.response;

import lombok.*;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CartItemResponse {
    private Long id;
    private Long variantId;
    private Long productId;
    private String name;
    private String variantName;
    private BigDecimal price;
    private String image;
    private Double quantity;
    private Double stockQuantity;
}
