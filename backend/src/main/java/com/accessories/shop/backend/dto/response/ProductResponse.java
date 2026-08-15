package com.accessories.shop.backend.dto.response;

import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import com.fasterxml.jackson.annotation.JsonProperty;

@Getter
@Setter
public class ProductResponse {
    private Long id;
    private String name;
    private String slug;
    private String description;
    private String technicalSpecifications;
    private Boolean isActive;
    @JsonProperty("isFeatured")
    private Boolean isFeatured;
    
    @JsonProperty("isNew")
    private Boolean isNew;
    private Double averageRating;
    private Integer totalReviews;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    
    private CategoryResponse category;
    private MaterialResponse material;
    
    private List<ProductVariantResponse> variants;
    private List<ProductImageResponse> images;
    
    private String productionType;
    private BigDecimal electricityCost;
    private BigDecimal machineCost;
}
