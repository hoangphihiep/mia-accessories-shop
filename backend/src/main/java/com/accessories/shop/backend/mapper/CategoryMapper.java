package com.accessories.shop.backend.mapper;

import com.accessories.shop.backend.dto.request.CategoryRequest;
import com.accessories.shop.backend.dto.response.CategoryResponse;
import com.accessories.shop.backend.entity.Category;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

@Mapper(componentModel = "spring")
public interface CategoryMapper {
    @Mapping(target = "parentId", source = "parentCategory.id")
    CategoryResponse toResponse(Category category);
    Category toEntity(CategoryRequest request);
    void updateEntityFromRequest(CategoryRequest request, @MappingTarget Category category);
}
