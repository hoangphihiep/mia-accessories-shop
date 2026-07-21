package com.accessories.shop.backend.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "inventory_receipts")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InventoryReceipt {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User createdBy;

    // Giữ lại trường cũ tránh crash DB
    private String supplier;

    // Bổ sung liên kết thật với bảng suppliers
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "supplier_id")
    private Supplier supplierEntity;

    private BigDecimal totalCost;

    @CreationTimestamp
    private LocalDateTime createdAt;

    @OneToMany(mappedBy = "inventoryReceipt", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<InventoryReceiptDetail> details;
}
