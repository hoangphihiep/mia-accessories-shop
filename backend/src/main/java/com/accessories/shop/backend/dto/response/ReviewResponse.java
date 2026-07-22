package com.accessories.shop.backend.dto.response;

import lombok.Getter;
import lombok.Setter;
import java.time.LocalDateTime;

@Getter
@Setter
public class ReviewResponse {
    private Long id;
    private UserResponse user;
    private Integer rating;
    private String comment;
    private String adminReply;
    private String variantName;
    private java.util.List<String> images;
    private Boolean isActive;
    private ProductResponse product;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
