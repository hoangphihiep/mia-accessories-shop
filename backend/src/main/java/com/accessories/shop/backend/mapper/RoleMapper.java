package com.accessories.shop.backend.mapper;

import com.accessories.shop.backend.dto.response.RoleResponse;
import com.accessories.shop.backend.entity.Role;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface RoleMapper {
    RoleResponse toResponse(Role role);
}
