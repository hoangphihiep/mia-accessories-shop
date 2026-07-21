package com.accessories.shop.backend.controller;

import com.accessories.shop.backend.dto.response.UserResponse;
import com.accessories.shop.backend.entity.User;
import com.accessories.shop.backend.exception.ResourceNotFoundException;
import com.accessories.shop.backend.mapper.UserMapper;
import com.accessories.shop.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/admin/customers")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
public class AdminCustomerController {

    private final UserRepository userRepository;
    private final UserMapper userMapper;
    private final com.accessories.shop.backend.repository.OrderRepository orderRepository;

    @GetMapping
    public ResponseEntity<org.springframework.data.domain.Page<UserResponse>> getAllCustomers(
            @RequestParam(required = false, defaultValue = "") String keyword,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        org.springframework.data.domain.Pageable pageable = org.springframework.data.domain.PageRequest.of(page, size, org.springframework.data.domain.Sort.by("id").descending());
        org.springframework.data.domain.Page<UserResponse> responses = userRepository.searchCustomers(keyword, pageable)
                .map(user -> {
                    UserResponse response = userMapper.toResponse(user);
                    long totalOrders = orderRepository.countByUserIdAndStatus(user.getId(), "COMPLETED");
                    java.math.BigDecimal totalSpent = orderRepository.sumTotalSpentByUserId(user.getId(), "COMPLETED");
                    
                    if (totalSpent == null) {
                        totalSpent = java.math.BigDecimal.ZERO;
                    }
                    
                    response.setTotalOrders(totalOrders);
                    response.setTotalSpent(totalSpent);
                    
                    String tier = "MEMBER";
                    if (totalSpent.compareTo(new java.math.BigDecimal("20000000")) >= 0) {
                        tier = "DIAMOND";
                    } else if (totalSpent.compareTo(new java.math.BigDecimal("5000000")) >= 0) {
                        tier = "GOLD";
                    } else if (totalSpent.compareTo(new java.math.BigDecimal("1000000")) >= 0) {
                        tier = "SILVER";
                    }
                    response.setCustomerTier(tier);
                    
                    return response;
                });
        return ResponseEntity.ok(responses);
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<UserResponse> toggleCustomerStatus(@PathVariable Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy khách hàng"));
        
        if (!user.getRole().getName().equals("ROLE_CUSTOMER")) {
            throw new com.accessories.shop.backend.exception.BadRequestException("Đây không phải là tài khoản khách hàng");
        }

        user.setIsActive(!user.getIsActive());
        User savedUser = userRepository.save(user);
        return ResponseEntity.ok(userMapper.toResponse(savedUser));
    }
    @GetMapping("/phone/{phone}")
    public ResponseEntity<UserResponse> getCustomerByPhone(@PathVariable String phone) {
        User user = userRepository.findByPhone(phone)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy khách hàng với SĐT: " + phone));
        return ResponseEntity.ok(userMapper.toResponse(user));
    }
}
