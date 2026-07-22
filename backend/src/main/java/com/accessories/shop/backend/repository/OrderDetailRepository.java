package com.accessories.shop.backend.repository;

import com.accessories.shop.backend.entity.OrderDetail;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Map;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.domain.Pageable;
import org.springframework.data.repository.query.Param;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Repository
public interface OrderDetailRepository extends JpaRepository<OrderDetail, Long> {
    @Query("SELECT new map(od.productVariant.product.name as productName, od.productVariant.name as variantName, SUM(od.quantity) as totalSold, SUM(od.price * od.quantity) as totalRevenue) " +
           "FROM OrderDetail od WHERE od.order.status = 'COMPLETED' AND od.order.createdAt >= :startDate AND od.order.createdAt <= :endDate " +
           "GROUP BY od.productVariant.id, od.productVariant.product.name, od.productVariant.name " +
           "ORDER BY SUM(od.quantity) DESC")
    List<Map<String, Object>> findTopSellingProducts(
            @Param("startDate") LocalDateTime startDate, 
            @Param("endDate") LocalDateTime endDate, 
            Pageable pageable);
}