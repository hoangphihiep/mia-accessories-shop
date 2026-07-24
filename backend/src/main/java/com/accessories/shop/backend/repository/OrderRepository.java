package com.accessories.shop.backend.repository;

import com.accessories.shop.backend.entity.Order;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {
    List<Order> findByUserId(Long userId);
    List<Order> findByCustomerPhone(String customerPhone);
    List<Order> findByStatusAndCreatedAtBefore(String status, LocalDateTime time);
    
    @Query("SELECT COUNT(o) > 0 FROM Order o JOIN o.orderDetails od WHERE o.user.id = :userId AND od.productVariant.product.id = :productId AND o.status = 'COMPLETED'")
    boolean hasUserPurchasedProduct(@Param("userId") Long userId, @Param("productId") Long productId);

    @Query("SELECT SUM(o.totalAmount) FROM Order o WHERE o.status = 'COMPLETED' AND o.createdAt >= :startDate AND o.createdAt <= :endDate")
    BigDecimal sumTotalRevenueForCompletedOrdersBetween(@Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate);

    long countByCreatedAtBetween(LocalDateTime startDate, LocalDateTime endDate);

    long countByStatus(String status);

    List<Order> findByStatusAndCreatedAtBetween(String status, LocalDateTime startDate, LocalDateTime endDate);

    @Query("SELECT SUM(o.totalAmount) FROM Order o WHERE o.createdAt >= :startDate AND o.createdAt <= :endDate")
    BigDecimal sumTotalRevenueBetween(LocalDateTime startDate, LocalDateTime endDate);

    // Dành cho Danh sách Đơn hàng mới
    Page<Order> findAllByOrderByCreatedAtDesc(Pageable pageable);

    @Query("SELECT COUNT(o) FROM Order o WHERE o.user.id = :userId AND o.status = :status")
    long countByUserIdAndStatus(@Param("userId") Long userId, @Param("status") String status);

    @Query("SELECT SUM(o.totalAmount) FROM Order o WHERE o.user.id = :userId AND o.status = :status")
    BigDecimal sumTotalSpentByUserId(@Param("userId") Long userId, @Param("status") String status);
}