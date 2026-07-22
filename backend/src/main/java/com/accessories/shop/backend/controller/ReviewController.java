package com.accessories.shop.backend.controller;

import com.accessories.shop.backend.dto.request.ReviewRequest;
import com.accessories.shop.backend.dto.response.ReviewResponse;
import com.accessories.shop.backend.entity.Review;
import com.accessories.shop.backend.mapper.ReviewMapper;
import com.accessories.shop.backend.service.ReviewService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import java.util.List;
import java.util.stream.Collectors;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/v1/reviews")
@RequiredArgsConstructor
public class ReviewController {

    private final ReviewService reviewService;
    private final ReviewMapper reviewMapper;

    @GetMapping("/product/{productId}")
    public ResponseEntity<Page<ReviewResponse>> getProductReviews(
            @PathVariable Long productId,
            @RequestParam(required = false) Integer stars,
            @RequestParam(required = false) Boolean hasImage,
            @PageableDefault(size = 10, sort = "createdAt", direction = org.springframework.data.domain.Sort.Direction.DESC) Pageable pageable) {
        Page<ReviewResponse> responses = reviewService.getFilteredProductReviews(productId, stars, hasImage, pageable)
                .map(reviewMapper::toResponse);
        return ResponseEntity.ok(responses);
    }

    @PostMapping("/product/{productId}")
    public ResponseEntity<?> addReview(
            Authentication authentication,
            @PathVariable Long productId,
            @Valid @RequestBody ReviewRequest request) {
        try {
            String email = authentication.getName();
            Review review = reviewService.addReview(email, productId, request.getRating(), request.getComment(), request.getImages(), request.getVariantName());
            return ResponseEntity.ok(reviewMapper.toResponse(review));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Có lỗi xảy ra khi xử lý đánh giá.");
        }
    }
}
