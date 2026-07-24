package com.accessories.shop.backend.mapper;

import com.accessories.shop.backend.dto.response.CollectionResponse;
import com.accessories.shop.backend.entity.Collection;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring", uses = {ProductMapper.class})
public interface CollectionMapper {
    CollectionResponse toResponse(Collection collection);
}
