package com.accessories.shop.backend.mapper;

import com.accessories.shop.backend.dto.response.UserResponse;
import com.accessories.shop.backend.entity.User;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring", uses = {RoleMapper.class})
public interface UserMapper {
    UserResponse toResponse(User user);
}
