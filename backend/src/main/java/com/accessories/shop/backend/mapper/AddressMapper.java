package com.accessories.shop.backend.mapper;

import com.accessories.shop.backend.dto.response.AddressResponse;
import com.accessories.shop.backend.entity.Address;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface AddressMapper {
    AddressResponse toResponse(Address address);
}
