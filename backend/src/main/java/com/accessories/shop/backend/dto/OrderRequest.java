package com.accessories.shop.backend.dto;

import lombok.*;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrderRequest {
    private String customerName;
    private String customerPhone;
    private String shippingAddress;
    private String paymentMethod; // VD: "COD" hoặc "VNPAY"
    private List<OrderItemRequest> items; // Danh sách các món hàng
}