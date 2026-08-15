package com.accessories.shop.backend.dto.request;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrderItemRequest {
    private Long variantId; // Mua mẫu nào
    private Double quantity; // Số lượng bao nhiêu
}
