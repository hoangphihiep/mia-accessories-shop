package com.accessories.shop.backend.mapper;

import com.accessories.shop.backend.dto.response.ReviewResponse;
import com.accessories.shop.backend.entity.Review;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring", uses = {UserMapper.class, ProductMapper.class})
public interface ReviewMapper {
    ReviewResponse toResponse(Review review);
}
