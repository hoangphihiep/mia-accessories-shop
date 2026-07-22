package com.accessories.shop.backend.repository;

import com.accessories.shop.backend.entity.Review;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

@Repository
public interface ReviewRepository extends JpaRepository<Review, Long> {
    List<Review> findByProductIdAndIsActiveTrue(Long productId);
    List<Review> findByUserId(Long userId);
    boolean existsByUserIdAndProductId(Long userId, Long productId);

    Page<Review> findAll(Pageable pageable);

    @Query("SELECT AVG(r.rating) FROM Review r WHERE r.product.id = :productId AND r.isActive = true")
    Double getAverageRatingByProductId(@Param("productId") Long productId);

    @Query("SELECT COUNT(r) FROM Review r WHERE r.product.id = :productId AND r.isActive = true")
    Integer getTotalReviewsByProductId(@Param("productId") Long productId);

    @Query("SELECT r FROM Review r WHERE r.product.id = :productId AND r.isActive = true " +
           "AND (:stars IS NULL OR r.rating = :stars) " +
           "AND (:hasImage IS NULL OR (:hasImage = true AND size(r.images) > 0) OR (:hasImage = false AND size(r.images) = 0))")
    Page<Review> findProductReviewsWithFilters(@Param("productId") Long productId, @Param("stars") Integer stars, @Param("hasImage") Boolean hasImage, Pageable pageable);
}
