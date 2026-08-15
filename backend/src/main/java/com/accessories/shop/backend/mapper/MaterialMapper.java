package com.accessories.shop.backend.mapper;

import com.accessories.shop.backend.dto.request.MaterialRequest;
import com.accessories.shop.backend.dto.response.MaterialResponse;
import com.accessories.shop.backend.entity.Material;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface MaterialMapper {
    MaterialResponse toResponse(Material material);
    Material toEntity(MaterialRequest request);
}
