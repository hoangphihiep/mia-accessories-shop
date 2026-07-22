package com.accessories.shop.backend.controller;

import com.accessories.shop.backend.dto.response.UserResponse;
import com.accessories.shop.backend.entity.User;
import com.accessories.shop.backend.exception.ResourceNotFoundException;
import com.accessories.shop.backend.mapper.UserMapper;
import com.accessories.shop.backend.repository.OrderRepository;
import com.accessories.shop.backend.repository.UserRepository;
import com.accessories.shop.backend.exception.BadRequestException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import java.math.BigDecimal;
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
    private final OrderRepository orderRepository;

    @GetMapping
    public ResponseEntity<Page<UserResponse>> getAllCustomers(
            @RequestParam(required = false, defaultValue = "") String keyword,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("id").descending());
        Page<UserResponse> responses = userRepository.searchCustomers(keyword, pageable)
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
                    if (totalSpent.compareTo(new BigDecimal("20000000")) >= 0) {
                        tier = "DIAMOND";
                    } else if (totalSpent.compareTo(new BigDecimal("5000000")) >= 0) {
                        tier = "GOLD";
                    } else if (totalSpent.compareTo(new BigDecimal("1000000")) >= 0) {
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
            throw new BadRequestException("Đây không phải là tài khoản khách hàng");
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
