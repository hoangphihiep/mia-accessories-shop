package com.accessories.shop.backend.mapper;

import com.accessories.shop.backend.dto.response.OrderDetailResponse;
import com.accessories.shop.backend.dto.response.OrderResponse;
import com.accessories.shop.backend.entity.Order;
import com.accessories.shop.backend.entity.OrderDetail;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring", uses = {UserMapper.class, ProductMapper.class})
public interface OrderMapper {
    OrderResponse toResponse(Order order);
    OrderDetailResponse toDetailResponse(OrderDetail orderDetail);
}
