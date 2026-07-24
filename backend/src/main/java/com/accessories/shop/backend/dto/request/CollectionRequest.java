package com.accessories.shop.backend.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class CollectionRequest {
    
    @NotBlank(message = "Tên bộ sưu tập không được để trống")
    private String name;
    
    private String slug;
    private String description;
    private String coverImage;
    private String bannerImage;
    private Boolean isActive = true;
    
    // Danh sách ID các sản phẩm thuộc bộ sưu tập này
    private List<Long> productIds;
}
