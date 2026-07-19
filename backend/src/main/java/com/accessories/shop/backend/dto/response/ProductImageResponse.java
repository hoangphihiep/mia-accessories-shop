package com.accessories.shop.backend.dto.response;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ProductImageResponse {
    private Long id;
    private String imageUrl;
    private Boolean isPrimary;
}
