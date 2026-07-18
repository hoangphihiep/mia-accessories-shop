package com.accessories.shop.backend.service;

import com.accessories.shop.backend.entity.Product;
import com.accessories.shop.backend.entity.Review;
import com.accessories.shop.backend.entity.User;
import com.accessories.shop.backend.repository.ProductRepository;
import com.accessories.shop.backend.repository.ReviewRepository;
import com.accessories.shop.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ReviewService {
    private final ReviewRepository reviewRepository;
    private final UserRepository userRepository;
    private final ProductRepository productRepository;

    public Review addReview(String email, Long productId, Integer rating, String comment) {
        User user = userRepository.findByEmail(email).orElseThrow(() -> new RuntimeException("User not found"));
        Product product = productRepository.findById(productId).orElseThrow(() -> new RuntimeException("Product not found"));
        
        Review review = Review.builder()
                .user(user)
                .product(product)
                .rating(rating)
                .comment(comment)
                .isActive(true)
                .build();
        return reviewRepository.save(review);
    }
    
    public List<Review> getProductReviews(Long productId) {
        return reviewRepository.findByProductIdAndIsActiveTrue(productId);
    }

    public List<Review> getAllReviews() {
        return reviewRepository.findAll();
    }

    public Review toggleReviewStatus(Long reviewId, Boolean isActive) {
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new RuntimeException("Review not found"));
        review.setIsActive(isActive);
        return reviewRepository.save(review);
    }
}
