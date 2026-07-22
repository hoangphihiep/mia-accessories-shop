package com.accessories.shop.backend.dto.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;
import java.util.List;

@Data
public class InventoryReceiptRequest {

    @NotNull(message = "Vui lòng chọn nhà cung cấp")
    private Long supplierId;

    @NotEmpty(message = "Phiếu nhập phải có ít nhất 1 sản phẩm")
    @Valid
    private List<ReceiptDetailReq> details;

    @Data
    public static class ReceiptDetailReq {
        @NotNull(message = "Vui lòng chọn sản phẩm")
        private Long variantId;

        @NotNull(message = "Số lượng không được để trống")
        @Min(value = 1, message = "Số lượng nhập phải lớn hơn 0")
        private Integer quantity;

        @NotNull(message = "Đơn giá không được để trống")
        @Min(value = 0, message = "Đơn giá không được nhỏ hơn 0")
        private BigDecimal unitPrice;
    }
}
