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
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import java.util.List;
import java.util.ArrayList;
import com.accessories.shop.backend.exception.ResourceNotFoundException;

import java.util.Arrays;

@Service
@RequiredArgsConstructor
public class ReviewService {
    private final ReviewRepository reviewRepository;
    private final UserRepository userRepository;
    private final ProductRepository productRepository;
    private final OrderRepository orderRepository;

    private static final List<String> BAD_WORDS = Arrays.asList(
        "lừa đảo", "chửi", "đụ", "má", "cặc", "lồn", "buồi", "cứt", "đkm", "vkl", "đcm", "chó"
    );

    private boolean containsBadWord(String text) {
        if (text == null) return false;
        String lower = text.toLowerCase();
        for (String word : BAD_WORDS) {
            if (lower.contains(word)) return true;
        }
        return false;
    }

    public Review addReview(String email, Long productId, Integer rating, String comment, List<String> images, String variantName) {
        User user = userRepository.findByEmail(email).orElseThrow(() -> new ResourceNotFoundException("Người dùng không tồn tại"));
        Product product = productRepository.findById(productId).orElseThrow(() -> new ResourceNotFoundException("Sản phẩm không tồn tại"));
        
        if (reviewRepository.existsByUserIdAndProductId(user.getId(), product.getId())) {
            throw new IllegalArgumentException("Bạn đã đánh giá sản phẩm này rồi.");
        }
        
        if (!orderRepository.hasUserPurchasedProduct(user.getId(), product.getId())) {
            throw new IllegalArgumentException("Bạn cần mua và nhận được hàng trước khi đánh giá.");
        }
        
        boolean isClean = !containsBadWord(comment);

        Review review = Review.builder()
                .user(user)
                .product(product)
                .rating(rating)
                .comment(comment)
                .images(images != null ? images : new ArrayList<>())
                .variantName(variantName)
                .isActive(isClean) // Auto-hide if contains bad words
                .build();
        Review saved = reviewRepository.save(review);
        updateProductRatingMetrics(product.getId());
        return saved;
    }

    public Page<Review> getFilteredProductReviews(Long productId, Integer stars, Boolean hasImage, Pageable pageable) {
        return reviewRepository.findProductReviewsWithFilters(productId, stars, hasImage, pageable);
    }

    public Page<Review> getAllReviews(Pageable pageable) {
        return reviewRepository.findAll(pageable);
    }

    public Review toggleReviewStatus(Long reviewId, Boolean isActive) {
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new ResourceNotFoundException("Đánh giá không tồn tại"));
        review.setIsActive(isActive);
        Review saved = reviewRepository.save(review);
        updateProductRatingMetrics(review.getProduct().getId());
        return saved;
    }

    public Review replyToReview(Long reviewId, String reply) {
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new ResourceNotFoundException("Đánh giá không tồn tại"));
        review.setAdminReply(reply);
        return reviewRepository.save(review);
    }

    private void updateProductRatingMetrics(Long productId) {
        Double avgRating = reviewRepository.getAverageRatingByProductId(productId);
        Integer totalReviews = reviewRepository.getTotalReviewsByProductId(productId);
        
        Product product = productRepository.findById(productId).orElse(null);
        if (product != null) {
            product.setAverageRating(avgRating != null ? avgRating : 0.0);
            product.setTotalReviews(totalReviews != null ? totalReviews : 0);
            productRepository.save(product);
        }
    }
}
