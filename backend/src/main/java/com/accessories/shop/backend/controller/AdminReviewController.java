package com.accessories.shop.backend.controller;

import com.accessories.shop.backend.dto.response.ReviewResponse;
import com.accessories.shop.backend.entity.Review;
import com.accessories.shop.backend.mapper.ReviewMapper;
import com.accessories.shop.backend.service.ReviewService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/admin/reviews")
@RequiredArgsConstructor
public class AdminReviewController {

    private final ReviewService reviewService;
    private final ReviewMapper reviewMapper;

    @GetMapping
    public ResponseEntity<List<ReviewResponse>> getAllReviews() {
        List<ReviewResponse> responses = reviewService.getAllReviews().stream()
                .map(reviewMapper::toResponse)
                .collect(Collectors.toList());
        return ResponseEntity.ok(responses);
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<ReviewResponse> toggleReviewStatus(@PathVariable Long id, @RequestBody Map<String, Boolean> payload) {
        Boolean isActive = payload.get("isActive");
        Review review = reviewService.toggleReviewStatus(id, isActive);
        return ResponseEntity.ok(reviewMapper.toResponse(review));
    }
}
