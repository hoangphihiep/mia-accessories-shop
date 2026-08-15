package com.accessories.shop.backend.dto.response;

import lombok.Getter;
import lombok.Setter;
import java.math.BigDecimal;
import java.util.List;

@Getter
@Setter
public class ProductVariantResponse {
    private Long id;
    private String name;
    private String sku;
    private BigDecimal price;
    private BigDecimal compareAtPrice;
    private BigDecimal costPrice;
    private Double stockQuantity;
    private Double displayQuantity;
    private String imageUrl;
    private Boolean isActive;
    private String productName;
    private Double machineHours;
    private BigDecimal depreciationCost;
    private BigDecimal productionCost;
    private List<VariantRawMaterialResponse> rawMaterials;
}
