package com.accessories.shop.backend.dto.response;

import lombok.Getter;
import lombok.Setter;
import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
public class ProductResponse {
    private Long id;
    private String name;
    private String slug;
    private String description;
    private Boolean isActive;
    private Boolean isFeatured;
    private Boolean isNew;
    private Double averageRating;
    private Integer totalReviews;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    
    private CategoryResponse category;
    private MaterialResponse material;
    
    private List<ProductVariantResponse> variants;
    private List<ProductImageResponse> images;
}
