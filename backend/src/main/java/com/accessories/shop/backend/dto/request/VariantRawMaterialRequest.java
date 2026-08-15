package com.accessories.shop.backend.dto.request;

import lombok.Getter;
import lombok.Setter;
import java.math.BigDecimal;
import jakarta.validation.constraints.NotNull;

@Getter
@Setter
public class VariantRawMaterialRequest {
    @NotNull(message = "Mẫu mã thành phần bắt buộc chọn")
    private Long materialVariantId;

    @NotNull(message = "Số lượng bắt buộc nhập")
    private BigDecimal quantity;
}
