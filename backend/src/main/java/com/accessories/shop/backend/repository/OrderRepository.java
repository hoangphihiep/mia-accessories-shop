package com.accessories.shop.backend.repository;

import com.accessories.shop.backend.entity.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {
    List<Order> findByUserId(Long userId);
    List<Order> findByCustomerPhone(String customerPhone);
    
    @org.springframework.data.jpa.repository.Query("SELECT COUNT(o) > 0 FROM Order o JOIN o.orderDetails od WHERE o.user.id = :userId AND od.productVariant.product.id = :productId AND o.status = 'COMPLETED'")
    boolean hasUserPurchasedProduct(@org.springframework.data.repository.query.Param("userId") Long userId, @org.springframework.data.repository.query.Param("productId") Long productId);

    @org.springframework.data.jpa.repository.Query("SELECT SUM(o.totalAmount) FROM Order o WHERE o.status = 'COMPLETED' AND o.createdAt >= :startDate AND o.createdAt <= :endDate")
    java.math.BigDecimal sumTotalRevenueForCompletedOrdersBetween(@org.springframework.data.repository.query.Param("startDate") java.time.LocalDateTime startDate, @org.springframework.data.repository.query.Param("endDate") java.time.LocalDateTime endDate);

    long countByCreatedAtBetween(java.time.LocalDateTime startDate, java.time.LocalDateTime endDate);

    long countByStatus(String status);

    java.util.List<Order> findByStatusAndCreatedAtBetween(String status, java.time.LocalDateTime startDate, java.time.LocalDateTime endDate);

    org.springframework.data.domain.Page<Order> findAllByOrderByCreatedAtDesc(org.springframework.data.domain.Pageable pageable);

    @org.springframework.data.jpa.repository.Query("SELECT COUNT(o) FROM Order o WHERE o.user.id = :userId AND o.status = :status")
    long countByUserIdAndStatus(@org.springframework.data.repository.query.Param("userId") Long userId, @org.springframework.data.repository.query.Param("status") String status);

    @org.springframework.data.jpa.repository.Query("SELECT SUM(o.totalAmount) FROM Order o WHERE o.user.id = :userId AND o.status = :status")
    java.math.BigDecimal sumTotalSpentByUserId(@org.springframework.data.repository.query.Param("userId") Long userId, @org.springframework.data.repository.query.Param("status") String status);
}