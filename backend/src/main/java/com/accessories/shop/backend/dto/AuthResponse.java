package com.accessories.shop.backend.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AuthResponse {
    private String token;      // Mã chuỗi JWT xịn xò để Frontend lưu vào LocalStorage
    private String email;
    private String role;       // Trả về Role để Frontend biết đường chuyển hướng sang trang Admin hay User
}