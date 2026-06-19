package com.accessories.shop.backend.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;

@Entity
@Table(name = "product_variants")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductVariant {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Mẫu này thuộc về Sản phẩm nào
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false)
    @com.fasterxml.jackson.annotation.JsonIgnoreProperties({"variants", "hibernateLazyInitializer", "handler"})
    private Product product;

    // Tên của mẫu (Ví dụ: Mẫu A, Mẫu B, Mẫu Đứng, Mẫu Ngồi...)
    @Column(nullable = false, length = 100)
    private String name;

    @Column(unique = true, length = 50)
    private String sku; // Mã lưu kho (Tùy chọn)

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal price; // Giá tiền của mẫu này

    @Column(name = "stock_quantity", nullable = false)
    private Integer stockQuantity; // Số lượng tồn kho

    @Column(name = "is_active", nullable = false)
    private Boolean isActive;
}