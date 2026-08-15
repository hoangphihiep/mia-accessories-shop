package com.accessories.shop.backend.dto.request;

import lombok.Getter;
import lombok.Setter;
import java.util.List;
import java.math.BigDecimal;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import com.fasterxml.jackson.annotation.JsonProperty;

@Getter
@Setter
public class ProductRequest {
    @NotBlank(message = "Tên sản phẩm không được để trống")
    private String name;
    
    private String slug;
    private String description;
    private String technicalSpecifications;
    
    @NotNull(message = "Trạng thái bắt buộc chọn")
    private Boolean isActive;
    
    @JsonProperty("isFeatured")
    private Boolean isFeatured;
    
    @JsonProperty("isNew")
    private Boolean isNew;
    
    @NotNull(message = "Danh mục bắt buộc chọn")
    private Long categoryId;
    
    @NotNull(message = "Chất liệu bắt buộc chọn")
    private Long materialId;

    @Valid
    private List<ProductVariantRequest> variants;
    
    private List<String> images;

    private String productionType;
    private BigDecimal electricityCost;
    private BigDecimal machineCost;
}
