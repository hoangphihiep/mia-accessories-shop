package com.accessories.shop.backend.mapper;

import com.accessories.shop.backend.dto.response.PaymentResponse;
import com.accessories.shop.backend.entity.Payment;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface PaymentMapper {
    @Mapping(source = "order.id", target = "orderId")
    PaymentResponse toResponse(Payment payment);
}
