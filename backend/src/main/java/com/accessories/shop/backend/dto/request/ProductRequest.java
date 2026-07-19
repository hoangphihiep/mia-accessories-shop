package com.accessories.shop.backend.dto.request;

import lombok.Getter;
import lombok.Setter;
import java.util.List;

@Getter
@Setter
public class ProductRequest {
    private String name;
    private String slug;
    private String description;
    private Boolean isActive;
    private Long categoryId;
    private Long materialId;
    // In a full implementation, you would also have requests for variants and images
    // private List<ProductVariantRequest> variants;
    // private List<ProductImageRequest> images;
}
