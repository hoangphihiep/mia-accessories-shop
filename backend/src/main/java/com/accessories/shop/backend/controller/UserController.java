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

import jakarta.validation.Valid;

import org.springframework.security.crypto.password.PasswordEncoder;
import com.accessories.shop.backend.dto.request.ChangePasswordRequest;
import com.accessories.shop.backend.dto.response.MessageResponse;
import com.accessories.shop.backend.exception.BadRequestException;

@RestController
@RequestMapping("/api/v1/users")
@RequiredArgsConstructor
public class UserController {

    private final UserRepository userRepository;
    private final UserMapper userMapper;
    private final PasswordEncoder passwordEncoder;

    @GetMapping("/me")
    public ResponseEntity<UserResponse> getMyProfile(Authentication authentication) {
        String email = authentication.getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy người dùng với email: " + email));
        return ResponseEntity.ok(userMapper.toResponse(user));
    }

    @PutMapping("/me")
    public ResponseEntity<UserResponse> updateMyProfile(Authentication authentication, @Valid @RequestBody UpdateProfileRequest updateRequest) {
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
        if (updateRequest.getGender() != null) {
            user.setGender(updateRequest.getGender());
        }
        if (updateRequest.getDob() != null) {
            user.setDob(updateRequest.getDob());
        }
        if (updateRequest.getAvatar() != null) {
            user.setAvatar(updateRequest.getAvatar());
        }
        
        User savedUser = userRepository.save(user);
        return ResponseEntity.ok(userMapper.toResponse(savedUser));
    }

    @PutMapping("/me/password")
    public ResponseEntity<MessageResponse> changePassword(Authentication authentication, @Valid @RequestBody ChangePasswordRequest request) {
        String email = authentication.getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy người dùng"));

        if (!passwordEncoder.matches(request.getOldPassword(), user.getPassword())) {
            throw new BadRequestException("Mật khẩu cũ không chính xác");
        }

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);

        return ResponseEntity.ok(new MessageResponse("Đổi mật khẩu thành công"));
    }
}
