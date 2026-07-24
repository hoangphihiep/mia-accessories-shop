package com.accessories.shop.backend.dto.response;

import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
public class OrderResponse {
    private Long id;
    private UserResponse user;
    private UserResponse createdBy;
    private String customerName;
    private String customerPhone;
    private String shippingAddress;
    private String status;
    private BigDecimal totalAmount;
    private BigDecimal shippingFee;
    private String paymentMethod;
    private Boolean isPaid;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private List<OrderDetailResponse> orderDetails;
}
