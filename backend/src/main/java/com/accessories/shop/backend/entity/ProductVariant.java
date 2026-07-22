package com.accessories.shop.backend.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;

import org.hibernate.annotations.SQLDelete;
import org.springframework.data.annotation.CreatedBy;
import org.springframework.data.annotation.LastModifiedBy;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import java.time.LocalDateTime;

@Entity
@Table(name = "product_variants")
@SQLDelete(sql = "UPDATE product_variants SET is_active = false WHERE id=?")
@org.hibernate.annotations.SQLRestriction("is_active = true")
@EntityListeners(AuditingEntityListener.class)
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
    private Product product;

    // Tên của mẫu (Ví dụ: Mẫu A, Mẫu B, Mẫu Đứng, Mẫu Ngồi...)
    @Column(nullable = false, length = 100)
    private String name;

    @Column(unique = true, length = 50)
    private String sku; // Mã lưu kho (Tùy chọn)

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal price; // Giá bán lẻ của mẫu này

    @Column(name = "cost_price", precision = 10, scale = 2)
    private BigDecimal costPrice = BigDecimal.ZERO; // Giá vốn bình quân (MAC)

    @Column(name = "compare_at_price", precision = 10, scale = 2)
    private BigDecimal compareAtPrice; // Giá niêm yết (Gạch ngang)

    @Column(name = "stock_quantity", nullable = false)
    private Integer stockQuantity; // Số lượng tồn kho

    @Column(name = "image_url", columnDefinition = "TEXT")
    private String imageUrl; // Ảnh đại diện riêng cho mẫu này (nếu có)

    @Column(name = "is_active", nullable = false)
    private Boolean isActive;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false, columnDefinition = "DATETIME(6) DEFAULT CURRENT_TIMESTAMP(6)")
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", columnDefinition = "DATETIME(6) DEFAULT CURRENT_TIMESTAMP(6)")
    private LocalDateTime updatedAt;

    @CreatedBy
    @Column(name = "created_by", updatable = false)
    private String createdBy;

    @LastModifiedBy
    @Column(name = "updated_by")
    private String updatedBy;
}