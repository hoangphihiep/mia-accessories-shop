package com.accessories.shop.backend.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "suppliers")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Supplier {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    private String phone;

    private String email;

    @Column(columnDefinition = "TEXT")
    private String address;

    private String cccd; // Căn cước công dân
    private String taxCode; // Mã số thuế
    private String legalRepresentative; // Người đại diện pháp lý
    private String directContactPerson; // Người làm việc trực tiếp

    // Tổng số nợ cần trả cho nhà cung cấp (được cộng lên khi nhập kho chưa thanh toán)
    @Column(precision = 15, scale = 2)
    @Builder.Default
    private BigDecimal debt = BigDecimal.ZERO;

    @CreationTimestamp
    private LocalDateTime createdAt;
}
