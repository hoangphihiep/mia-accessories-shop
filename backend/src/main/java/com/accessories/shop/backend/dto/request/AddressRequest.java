package com.accessories.shop.backend.dto.request;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class AddressRequest {
    private String receiverName;
    private String phone;
    private String streetAddress;
    private String city;
    private String district;
    private String ward;
    private Boolean isDefault;
}
