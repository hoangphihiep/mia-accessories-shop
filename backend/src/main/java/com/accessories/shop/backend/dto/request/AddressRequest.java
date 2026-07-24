package com.accessories.shop.backend.dto.request;

import lombok.Getter;
import lombok.Setter;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

@Getter
@Setter
public class AddressRequest {
    @NotBlank(message = "Tên người nhận không được để trống")
    private String receiverName;

    @Pattern(regexp = "^\\d{10,11}$", message = "Số điện thoại không hợp lệ (10-11 số)")
    private String phone;

    @NotBlank(message = "Số nhà/Đường không được để trống")
    private String streetAddress;

    @NotBlank(message = "Tỉnh/Thành phố không được để trống")
    private String city;

    @NotBlank(message = "Quận/Huyện không được để trống")
    private String district;

    @NotBlank(message = "Phường/Xã không được để trống")
    private String ward;

    private Boolean isDefault;
}
