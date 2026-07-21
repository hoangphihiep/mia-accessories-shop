package com.accessories.shop.backend.mapper;

import com.accessories.shop.backend.dto.request.SupplierRequest;
import com.accessories.shop.backend.dto.response.SupplierResponse;
import com.accessories.shop.backend.entity.Supplier;
import org.springframework.stereotype.Component;

@Component
public class SupplierMapper {

    public Supplier toEntity(SupplierRequest request) {
        return Supplier.builder()
                .name(request.getName())
                .phone(request.getPhone())
                .email(request.getEmail())
                .address(request.getAddress())
                .build();
    }

    public SupplierResponse toResponse(Supplier entity) {
        if (entity == null) {
            return null;
        }
        return SupplierResponse.builder()
                .id(entity.getId())
                .name(entity.getName())
                .phone(entity.getPhone())
                .email(entity.getEmail())
                .address(entity.getAddress())
                .debt(entity.getDebt())
                .createdAt(entity.getCreatedAt())
                .build();
    }
}
