package com.accessories.shop.backend.controller;

import com.accessories.shop.backend.dto.response.ReviewResponse;
import com.accessories.shop.backend.entity.Review;
import com.accessories.shop.backend.mapper.ReviewMapper;
import com.accessories.shop.backend.service.ReviewService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.data.domain.Sort;

@RestController
@RequestMapping("/api/v1/admin/reviews")
@RequiredArgsConstructor
public class AdminReviewController {

    private final ReviewService reviewService;
    private final ReviewMapper reviewMapper;

    @GetMapping
    public ResponseEntity<Page<ReviewResponse>> getAllReviews(@PageableDefault(sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        Page<ReviewResponse> page = reviewService.getAllReviews(pageable).map(reviewMapper::toResponse);
        return ResponseEntity.ok(page);
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<ReviewResponse> toggleReviewStatus(@PathVariable Long id, @RequestBody Map<String, Boolean> payload) {
        Boolean isActive = payload.get("isActive");
        Review review = reviewService.toggleReviewStatus(id, isActive);
        return ResponseEntity.ok(reviewMapper.toResponse(review));
    }

    @PutMapping("/{id}/reply")
    public ResponseEntity<ReviewResponse> replyToReview(@PathVariable Long id, @RequestBody Map<String, String> payload) {
        String reply = payload.get("reply");
        Review review = reviewService.replyToReview(id, reply);
        return ResponseEntity.ok(reviewMapper.toResponse(review));
    }
}
