package com.accessories.shop.backend.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;

@Entity
@Table(name = "order_details")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrderDetail {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id", nullable = false)
    private Order order;

    // Khách mua chính xác cái Mẫu (Variant) nào
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_variant_id", nullable = false)
    private ProductVariant productVariant;

    @Column(nullable = false)
    private Integer quantity;

    // GIÁ CHỐT ĐƠN: Lưu lại giá bán của Mẫu đó tại thời điểm mua
    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal price;

    // GIÁ VỐN CHỐT ĐƠN: Lưu lại giá vốn (để không bị ảnh hưởng lợi nhuận nếu sau này nhập hàng giá khác)
    @Column(name = "unit_cost", precision = 10, scale = 2)
    private BigDecimal unitCost = BigDecimal.ZERO;
}