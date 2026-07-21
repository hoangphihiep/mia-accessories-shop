package com.accessories.shop.backend.repository;

import com.accessories.shop.backend.entity.OrderDetail;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface OrderDetailRepository extends JpaRepository<OrderDetail, Long> {
    @org.springframework.data.jpa.repository.Query("SELECT new map(od.productVariant.product.name as productName, od.productVariant.name as variantName, SUM(od.quantity) as totalSold, SUM(od.price * od.quantity) as totalRevenue) " +
           "FROM OrderDetail od WHERE od.order.status = 'COMPLETED' AND od.order.createdAt >= :startDate AND od.order.createdAt <= :endDate " +
           "GROUP BY od.productVariant.id, od.productVariant.product.name, od.productVariant.name " +
           "ORDER BY SUM(od.quantity) DESC")
    java.util.List<java.util.Map<String, Object>> findTopSellingProducts(
            @org.springframework.data.repository.query.Param("startDate") java.time.LocalDateTime startDate, 
            @org.springframework.data.repository.query.Param("endDate") java.time.LocalDateTime endDate, 
            org.springframework.data.domain.Pageable pageable);
}