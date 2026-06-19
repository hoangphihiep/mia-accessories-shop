package com.accessories.shop.backend.controller;

import com.accessories.shop.backend.entity.Review;
import com.accessories.shop.backend.service.ReviewService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/v1/reviews")
@RequiredArgsConstructor
public class ReviewController {

    private final ReviewService reviewService;

    @GetMapping("/product/{productId}")
    public ResponseEntity<List<Review>> getProductReviews(@PathVariable Long productId) {
        return ResponseEntity.ok(reviewService.getProductReviews(productId));
    }

    @PostMapping("/product/{productId}")
    public ResponseEntity<Review> addReview(
            Authentication authentication,
            @PathVariable Long productId,
            @RequestParam Integer rating,
            @RequestParam String comment) {
        String email = authentication.getName();
        return ResponseEntity.ok(reviewService.addReview(email, productId, rating, comment));
    }
}
