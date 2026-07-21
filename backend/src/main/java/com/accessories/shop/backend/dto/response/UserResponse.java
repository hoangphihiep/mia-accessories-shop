package com.accessories.shop.backend.dto.response;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UserResponse {
    private Long id;
    private String email;
    private String fullName;
    private String phone;
    private String address;
    private Boolean isActive;
    private java.time.LocalDateTime createdAt;
    private RoleResponse role;
    
    // CRM Fields (Chỉ dành cho Khách hàng)
    private Long totalOrders;
    private java.math.BigDecimal totalSpent;
    private String customerTier;
}
