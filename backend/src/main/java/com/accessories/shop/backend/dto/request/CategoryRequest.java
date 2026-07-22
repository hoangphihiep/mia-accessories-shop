package com.accessories.shop.backend.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CategoryRequest {
    @NotBlank(message = "Tên danh mục không được để trống")
    private String name;
    
    private String slug;
    private Long parentId;
    private Boolean status;
}
