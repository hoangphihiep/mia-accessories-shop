package com.accessories.shop.backend.dto.response;

import lombok.Getter;
import lombok.Setter;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
public class PaymentResponse {
    private Long id;
    private Long orderId; // Just the order ID is usually enough for a payment response
    private String paymentMethod;
    private String transactionNo;
    private String bankCode;
    private BigDecimal amount;
    private String status;
    private LocalDateTime paymentDate;
}
