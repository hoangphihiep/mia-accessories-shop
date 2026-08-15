package com.accessories.shop.backend.dto.request;

import lombok.Getter;
import lombok.Setter;
import java.math.BigDecimal;
import java.util.List;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

@Getter
@Setter
public class ProductVariantRequest {
    private Long id;

    @NotBlank(message = "Tên mẫu mã không được để trống")
    private String name;

    @NotNull(message = "Giá bán bắt buộc nhập")
    @Min(value = 0, message = "Giá bán không được âm")
    private BigDecimal price;

    private BigDecimal compareAtPrice;

    private String sku;
    private String imageUrl;
    private Long productId;
    
    private Double stockQuantity;
    private Double displayQuantity;

    private Double machineHours;
    private List<VariantRawMaterialRequest> rawMaterials;
}
