package com.accessories.shop.backend.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "payments")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Payment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id", nullable = false, unique = true)
    private Order order;

    @Column(name = "payment_method", nullable = false, length = 50)
    private String paymentMethod; // e.g., VNPAY, COD

    @Column(name = "transaction_no", length = 100)
    private String transactionNo; // Transaction ID from VNPAY

    @Column(name = "bank_code", length = 50)
    private String bankCode;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal amount;

    // Status of the payment: PENDING, SUCCESS, FAILED
    @Column(nullable = false, length = 50)
    private String status;

    @CreationTimestamp
    @Column(name = "payment_date", updatable = false)
    private LocalDateTime paymentDate;
}
