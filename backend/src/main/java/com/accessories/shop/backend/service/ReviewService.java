package com.accessories.shop.backend.service;

import com.accessories.shop.backend.entity.Product;
import com.accessories.shop.backend.entity.Review;
import com.accessories.shop.backend.entity.User;
import com.accessories.shop.backend.repository.ProductRepository;
import com.accessories.shop.backend.repository.ReviewRepository;
import com.accessories.shop.backend.repository.UserRepository;
import com.accessories.shop.backend.repository.OrderRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ReviewService {
    private final ReviewRepository reviewRepository;
    private final UserRepository userRepository;
    private final ProductRepository productRepository;
    private final OrderRepository orderRepository;

    public Review addReview(String email, Long productId, Integer rating, String comment) {
        User user = userRepository.findByEmail(email).orElseThrow(() -> new com.accessories.shop.backend.exception.ResourceNotFoundException("Người dùng không tồn tại"));
        Product product = productRepository.findById(productId).orElseThrow(() -> new com.accessories.shop.backend.exception.ResourceNotFoundException("Sản phẩm không tồn tại"));
        
        if (reviewRepository.existsByUserIdAndProductId(user.getId(), product.getId())) {
            throw new IllegalArgumentException("Bạn đã đánh giá sản phẩm này rồi.");
        }
        
        if (!orderRepository.hasUserPurchasedProduct(user.getId(), product.getId())) {
            throw new IllegalArgumentException("Bạn cần mua và nhận được hàng trước khi đánh giá.");
        }
        
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
                .orElseThrow(() -> new com.accessories.shop.backend.exception.ResourceNotFoundException("Đánh giá không tồn tại"));
        review.setIsActive(isActive);
        return reviewRepository.save(review);
    }
}
