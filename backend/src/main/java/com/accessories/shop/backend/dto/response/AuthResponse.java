package com.accessories.shop.backend.dto.response;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AuthResponse {
    private String token;      // Mã chuỗi JWT
    private UserResponse user; // Thông tin user đầy đủ
}
