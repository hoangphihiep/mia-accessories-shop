package com.accessories.shop.backend.dto.response;

import lombok.Builder;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
public class SupplierResponse {
    private Long id;
    private String name;
    private String phone;
    private String email;
    private String address;
    private String cccd;
    private String taxCode;
    private String legalRepresentative;
    private String directContactPerson;
    private BigDecimal debt;
    private LocalDateTime createdAt;
}
