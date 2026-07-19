package com.accessories.shop.backend.controller;

import com.accessories.shop.backend.dto.request.UpdateProfileRequest;
import com.accessories.shop.backend.dto.response.UserResponse;
import com.accessories.shop.backend.entity.User;
import com.accessories.shop.backend.exception.ResourceNotFoundException;
import com.accessories.shop.backend.mapper.UserMapper;
import com.accessories.shop.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/users")
@RequiredArgsConstructor
public class UserController {

    private final UserRepository userRepository;
    private final UserMapper userMapper;

    @GetMapping("/me")
    public ResponseEntity<UserResponse> getMyProfile(Authentication authentication) {
        String email = authentication.getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy người dùng với email: " + email));
        return ResponseEntity.ok(userMapper.toResponse(user));
    }

    @PutMapping("/me")
    public ResponseEntity<UserResponse> updateMyProfile(Authentication authentication, @RequestBody UpdateProfileRequest updateRequest) {
        String email = authentication.getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy người dùng với email: " + email));
        
        if (updateRequest.getFullName() != null) {
            user.setFullName(updateRequest.getFullName());
        }
        if (updateRequest.getPhone() != null) {
            user.setPhone(updateRequest.getPhone());
        }
        if (updateRequest.getAddress() != null) {
            user.setAddress(updateRequest.getAddress());
        }
        
        User savedUser = userRepository.save(user);
        return ResponseEntity.ok(userMapper.toResponse(savedUser));
    }
}
