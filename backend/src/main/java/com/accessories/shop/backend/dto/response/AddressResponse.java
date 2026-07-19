package com.accessories.shop.backend.dto.response;

import lombok.Getter;
import lombok.Setter;
import java.time.LocalDateTime;

@Getter
@Setter
public class AddressResponse {
    private Long id;
    private String receiverName;
    private String phone;
    private String streetAddress;
    private String city;
    private String district;
    private String ward;
    private Boolean isDefault;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
