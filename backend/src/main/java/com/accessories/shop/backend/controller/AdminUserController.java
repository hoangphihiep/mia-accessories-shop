package com.accessories.shop.backend.controller;

import com.accessories.shop.backend.dto.response.UserResponse;
import com.accessories.shop.backend.entity.Role;
import com.accessories.shop.backend.entity.User;
import com.accessories.shop.backend.exception.ResourceNotFoundException;
import com.accessories.shop.backend.mapper.UserMapper;
import com.accessories.shop.backend.repository.RoleRepository;
import com.accessories.shop.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/admin/users")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminUserController {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final UserMapper userMapper;
    private final org.springframework.security.crypto.password.PasswordEncoder passwordEncoder;

    @GetMapping
    public ResponseEntity<org.springframework.data.domain.Page<UserResponse>> getAllUsers(
            @RequestParam(required = false, defaultValue = "") String keyword,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        org.springframework.data.domain.Pageable pageable = org.springframework.data.domain.PageRequest.of(page, size, org.springframework.data.domain.Sort.by("id").descending());
        org.springframework.data.domain.Page<UserResponse> responses = userRepository.searchUsers(keyword, pageable)
                .map(userMapper::toResponse);
        return ResponseEntity.ok(responses);
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<UserResponse> toggleUserStatus(@PathVariable Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy người dùng"));
        
        // Không cho phép tự khóa chính mình hoặc quản trị viên khác
        if (user.getRole().getName().equals("ROLE_ADMIN")) {
            throw new com.accessories.shop.backend.exception.BadRequestException("Không thể khóa tài khoản của Quản trị viên tối cao (ADMIN)");
        }

        user.setIsActive(!user.getIsActive());
        User savedUser = userRepository.save(user);
        return ResponseEntity.ok(userMapper.toResponse(savedUser));
    }

    @PostMapping("/staff")
    public ResponseEntity<UserResponse> createStaff(@jakarta.validation.Valid @RequestBody com.accessories.shop.backend.dto.request.RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new com.accessories.shop.backend.exception.BadRequestException("Email đã được sử dụng. Vui lòng chọn email khác.");
        }

        Role staffRole = roleRepository.findByName("ROLE_STAFF")
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy quyền STAFF"));

        User user = User.builder()
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .fullName(request.getFullName())
                .phone(request.getPhone())
                .address(request.getAddress()) // Có thể null
                .role(staffRole)
                .isActive(true)
                .build();

        User savedUser = userRepository.save(user);
        return ResponseEntity.ok(userMapper.toResponse(savedUser));
    }
}
