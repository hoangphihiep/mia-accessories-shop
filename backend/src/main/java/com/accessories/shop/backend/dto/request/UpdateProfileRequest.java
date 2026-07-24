package com.accessories.shop.backend.dto.request;

import lombok.Getter;
import lombok.Setter;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

@Getter
@Setter
public class UpdateProfileRequest {
    @NotBlank(message = "Họ tên không được để trống")
    private String fullName;

    @Pattern(regexp = "^\\d{10,11}$", message = "Số điện thoại không hợp lệ (10-11 số)")
    private String phone;

    private String address;

    private String gender;
    
    private java.time.LocalDate dob;

    private String avatar;
}
