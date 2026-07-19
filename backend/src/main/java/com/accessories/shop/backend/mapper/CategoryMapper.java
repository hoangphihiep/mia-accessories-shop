package com.accessories.shop.backend.mapper;

import com.accessories.shop.backend.dto.request.CategoryRequest;
import com.accessories.shop.backend.dto.response.CategoryResponse;
import com.accessories.shop.backend.entity.Category;
import org.mapstruct.Mapper;
import org.mapstruct.MappingTarget;

@Mapper(componentModel = "spring")
public interface CategoryMapper {
    CategoryResponse toResponse(Category category);
    Category toEntity(CategoryRequest request);
    void updateEntityFromRequest(CategoryRequest request, @MappingTarget Category category);
}
