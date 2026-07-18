package com.accessories.shop.backend.dto;

import lombok.Data;

import java.math.BigDecimal;
import java.util.List;

@Data
public class InventoryReceiptRequest {
    private String supplier;
    private List<ReceiptDetailReq> details;

    @Data
    public static class ReceiptDetailReq {
        private Long variantId;
        private Integer quantity;
        private BigDecimal unitPrice;
    }
}
