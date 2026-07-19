package com.accessories.shop.backend.dto.request;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class ReviewRequest {
    
    @NotNull(message = "Số sao không được để trống")
    @Min(value = 1, message = "Số sao tối thiểu là 1")
    @Max(value = 5, message = "Số sao tối đa là 5")
    private Integer rating;
    
    @NotBlank(message = "Nội dung đánh giá không được để trống")
    @Size(max = 500, message = "Nội dung đánh giá không được vượt quá 500 ký tự")
    private String comment;
}
