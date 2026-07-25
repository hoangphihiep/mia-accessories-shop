package com.accessories.shop.backend.controller;

import com.accessories.shop.backend.dto.response.AuthResponse;
import com.accessories.shop.backend.dto.response.MessageResponse;
import com.accessories.shop.backend.dto.request.LoginRequest;
import com.accessories.shop.backend.dto.request.RegisterRequest;
import com.accessories.shop.backend.dto.request.ForgotPasswordRequest;
import com.accessories.shop.backend.dto.request.ResetPasswordRequest;
import com.accessories.shop.backend.dto.request.RefreshTokenRequest;
import com.accessories.shop.backend.dto.request.OAuth2Request;
import com.accessories.shop.backend.exception.BadRequestException;
import com.accessories.shop.backend.exception.ResourceNotFoundException;
import com.accessories.shop.backend.service.AuthService;
import com.accessories.shop.backend.entity.PasswordResetToken;
import com.accessories.shop.backend.repository.PasswordResetTokenRepository;
import com.accessories.shop.backend.service.EmailService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.crypto.password.PasswordEncoder;
import jakarta.validation.Valid;
import jakarta.servlet.http.HttpServletRequest;
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
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest request) {
        return ResponseEntity.ok(authService.register(request));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }

    @GetMapping("/verify")
    public ResponseEntity<MessageResponse> verifyEmail(@RequestParam("token") String token) {
        authService.verifyEmail(token);
        return ResponseEntity.ok(new MessageResponse("Xác thực email thành công! Bạn có thể đăng nhập ngay bây giờ."));
    }

    @PostMapping("/oauth2/google")
    public ResponseEntity<AuthResponse> oauth2Google(@Valid @RequestBody OAuth2Request request) {
        return ResponseEntity.ok(authService.oauth2Google(request.getToken()));
    }

    @PostMapping("/oauth2/facebook")
    public ResponseEntity<AuthResponse> oauth2Facebook(@Valid @RequestBody OAuth2Request request) {
        return ResponseEntity.ok(authService.oauth2Facebook(request.getToken()));
    }

    @PostMapping("/refresh")
    public ResponseEntity<AuthResponse> refreshToken(@Valid @RequestBody RefreshTokenRequest request) {
        return ResponseEntity.ok(authService.refreshToken(request.getToken()));
    }

    @PostMapping("/logout")
    public ResponseEntity<MessageResponse> logout(HttpServletRequest request) {
        String authHeader = request.getHeader("Authorization");
        authService.logout(authHeader);
        return ResponseEntity.ok(new MessageResponse("Đăng xuất thành công."));
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<MessageResponse> forgotPassword(@Valid @RequestBody ForgotPasswordRequest request) {
        String email = request.getEmail();
        var userOptional = authService.findByEmail(email);
        if (userOptional.isPresent()) {
            var user = userOptional.get();
            
            // Xóa token cũ nếu tồn tại để tránh lỗi Duplicate entry for OneToOne
            tokenRepository.findByUser(user).ifPresent(tokenRepository::delete);

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
        return ResponseEntity.ok(new MessageResponse("Nếu email tồn tại, link khôi phục đã được gửi."));
    }

    @PostMapping("/reset-password")
    public ResponseEntity<MessageResponse> resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
        String token = request.getToken();
        String newPassword = request.getNewPassword();

        PasswordResetToken resetToken = tokenRepository.findByToken(token)
                .orElseThrow(() -> new ResourceNotFoundException("Token không hợp lệ hoặc không tồn tại."));

        if (resetToken.getExpiryDate().isBefore(LocalDateTime.now())) {
            throw new BadRequestException("Token đã hết hạn.");
        }

        var user = resetToken.getUser();
        user.setPassword(passwordEncoder.encode(newPassword));
        authService.saveUser(user);
        tokenRepository.delete(resetToken);

        return ResponseEntity.ok(new MessageResponse("Cập nhật mật khẩu thành công."));
    }
}