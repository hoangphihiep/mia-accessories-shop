package com.accessories.shop.backend.repository;

import com.accessories.shop.backend.entity.ProductVariant;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

@Repository
public interface ProductVariantRepository extends JpaRepository<ProductVariant, Long> {
    long countByStockQuantityLessThan(Double quantity);
    
    @Modifying
    @Query("UPDATE ProductVariant p SET p.stockQuantity = p.stockQuantity - :quantity WHERE p.id = :id AND p.stockQuantity >= :quantity")
    int decreaseStock(@Param("id") Long id, @Param("quantity") double quantity);

    @Modifying
    @Query("UPDATE ProductVariant p SET p.stockQuantity = p.stockQuantity + :quantity WHERE p.id = :id")
    int increaseStock(@Param("id") Long id, @Param("quantity") double quantity);

    @Query("SELECT MAX(p.price) FROM ProductVariant p")
    java.math.BigDecimal findMaxPrice();
}