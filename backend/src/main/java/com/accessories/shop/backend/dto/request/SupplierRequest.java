package com.accessories.shop.backend.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.Data;
import java.math.BigDecimal;

@Data
public class SupplierRequest {
    @NotBlank(message = "Tên nhà cung cấp không được để trống")
    private String name;

    @Pattern(regexp = "^(0[35789])+([0-9]{8})$", message = "Số điện thoại không hợp lệ")
    private String phone;

    @Email(message = "Định dạng email không hợp lệ")
    private String email;

    private String address;
    private String cccd;
    private String taxCode;
    private String legalRepresentative;
    private String directContactPerson;
    private BigDecimal debt;
}
