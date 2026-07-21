package com.accessories.shop.backend.dto.request;

import lombok.Data;
import java.math.BigDecimal;

@Data
public class SupplierRequest {
    private String name;
    private String phone;
    private String email;
    private String address;
    private BigDecimal debt;
}
