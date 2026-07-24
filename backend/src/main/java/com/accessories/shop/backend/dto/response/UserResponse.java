package com.accessories.shop.backend.dto.response;

import lombok.Getter;
import lombok.Setter;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
public class UserResponse {
    private Long id;
    private String email;
    private String fullName;
    private String phone;
    private String address;
    private String gender;
    private java.time.LocalDate dob;
    private String avatar;
    private Boolean isActive;
    private LocalDateTime createdAt;
    private RoleResponse role;
    
    // CRM Fields (Chỉ dành cho Khách hàng)
    private Long totalOrders;
    private BigDecimal totalSpent;
    private String customerTier;
}
