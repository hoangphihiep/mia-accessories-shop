package com.accessories.shop.backend.controller;

import com.accessories.shop.backend.dto.response.AuthResponse;
import com.accessories.shop.backend.dto.request.LoginRequest;
import com.accessories.shop.backend.dto.request.RegisterRequest;
import com.accessories.shop.backend.service.AuthService;
import com.accessories.shop.backend.entity.PasswordResetToken;
import com.accessories.shop.backend.repository.PasswordResetTokenRepository;
import com.accessories.shop.backend.service.EmailService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.crypto.password.PasswordEncoder;
import java.time.LocalDateTime;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;
    private final PasswordResetTokenRepository tokenRepository;
    private final EmailService emailService;
    private final PasswordEncoder passwordEncoder;

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@RequestBody RegisterRequest request) {
        return ResponseEntity.ok(authService.register(request));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@RequestBody LoginRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@RequestBody Map<String, String> payload) {
        String email = payload.get("email");
        var userOptional = authService.findByEmail(email);
        if (userOptional.isPresent()) {
            var user = userOptional.get();
            String token = UUID.randomUUID().toString();
            PasswordResetToken resetToken = PasswordResetToken.builder()
                    .token(token)
                    .user(user)
                    .expiryDate(LocalDateTime.now().plusHours(1))
                    .build();
            tokenRepository.save(resetToken);
            String resetUrl = "http://localhost:5173/reset-password?token=" + token;
            emailService.sendPasswordResetEmail(user.getEmail(), resetUrl);
        }
        return ResponseEntity.ok("Nếu email tồn tại, link khôi phục đã được gửi.");
    }

    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@RequestBody Map<String, String> payload) {
        String token = payload.get("token");
        String newPassword = payload.get("newPassword");

        PasswordResetToken resetToken = tokenRepository.findByToken(token)
                .orElseThrow(() -> new com.accessories.shop.backend.exception.ResourceNotFoundException("Token không hợp lệ hoặc không tồn tại."));

        if (resetToken.getExpiryDate().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("Token đã hết hạn.");
        }

        var user = resetToken.getUser();
        user.setPassword(passwordEncoder.encode(newPassword));
        authService.saveUser(user);
        tokenRepository.delete(resetToken);

        return ResponseEntity.ok("Cập nhật mật khẩu thành công.");
    }
}