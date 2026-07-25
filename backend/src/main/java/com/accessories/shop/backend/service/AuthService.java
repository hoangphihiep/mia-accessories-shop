package com.accessories.shop.backend.service;

import com.accessories.shop.backend.dto.response.AuthResponse;
import com.accessories.shop.backend.dto.response.RoleResponse;
import com.accessories.shop.backend.dto.response.UserResponse;
import com.accessories.shop.backend.dto.request.LoginRequest;
import com.accessories.shop.backend.dto.request.RegisterRequest;
import com.accessories.shop.backend.entity.*;
import com.accessories.shop.backend.exception.BadRequestException;
import com.accessories.shop.backend.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;
import java.util.Map;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpStatus;
import org.apache.commons.lang3.RandomStringUtils;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;
    private final EmailService emailService;
    private final RefreshTokenRepository refreshTokenRepository;
    private final VerificationTokenRepository verificationTokenRepository;
    private final InvalidatedTokenRepository invalidatedTokenRepository;

    public AuthResponse register(RegisterRequest request) {
        // Kiểm tra xem Email đã tồn tại chưa
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new BadRequestException("Email đã được sử dụng!");
        }

        // Lấy Role mặc định là ROLE_CUSTOMER
        Role customerRole = roleRepository.findByName("ROLE_CUSTOMER")
                .orElseThrow(() -> new RuntimeException("Lỗi hệ thống: Không tìm thấy quyền ROLE_CUSTOMER"));

        // Tạo User mới, băm mật khẩu
        User user = User.builder()
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .fullName(request.getFullName())
                .phone(request.getPhone())
                .address(request.getAddress())
                .role(customerRole)
                .isActive(true)
                .isEmailVerified(false) // Yêu cầu xác minh email
                .build();

        userRepository.save(user);

        // Tạo Verification Token
        String token = UUID.randomUUID().toString();
        VerificationToken verificationToken = VerificationToken.builder()
                .token(token)
                .user(user)
                .expiryDate(LocalDateTime.now().plusHours(24))
                .build();
        verificationTokenRepository.save(verificationToken);

        // Gửi email xác minh
        String verifyUrl = "http://localhost:5173/verify?token=" + token;
        // Tạm thời dùng chung hàm gửi email của reset password (nếu chưa có template riêng)
        emailService.sendPasswordResetEmail(user.getEmail(), verifyUrl);

        // Trả về response rỗng vì chưa cho phép đăng nhập ngay
        return AuthResponse.builder().build();
    }

    public void verifyEmail(String token) {
        VerificationToken verificationToken = verificationTokenRepository.findByToken(token)
                .orElseThrow(() -> new BadRequestException("Token không hợp lệ hoặc không tồn tại."));

        if (verificationToken.getExpiryDate().isBefore(LocalDateTime.now())) {
            throw new BadRequestException("Token đã hết hạn. Vui lòng đăng ký lại.");
        }

        User user = verificationToken.getUser();
        user.setIsEmailVerified(true);
        userRepository.save(user);

        verificationTokenRepository.delete(verificationToken);
    }

    public AuthResponse login(LoginRequest request) {
        try {
            // Hàm này của Spring Security sẽ tự động tra DB và so sánh Password đã băm, đồng thời kiểm tra isEnabled() (bao gồm isEmailVerified)
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
            );
        } catch (org.springframework.security.authentication.BadCredentialsException ex) {
            handleFailedLogin(request.getEmail());
            throw ex;
        }

        // Đã pass qua được hàm trên nghĩa là tài khoản đúng
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow();
                
        // Reset số lần đăng nhập sai nếu đăng nhập thành công
        if (user.getFailedLoginAttempts() != null && user.getFailedLoginAttempts() > 0) {
            user.setFailedLoginAttempts(0);
        }
        // Xóa trạng thái khóa (nếu có) và cập nhật Last Login
        user.setLockoutTime(null);
        user.setLastLoginAt(LocalDateTime.now());
        userRepository.save(user);

        // Sinh Access Token
        String jwtToken = jwtService.generateToken(user.getEmail(), user.getRole().getName());

        // Xóa refresh token cũ nếu có (chỉ cho phép 1 thiết bị đăng nhập hoặc làm mới token liên tục)
        // Nếu muốn cho phép đa thiết bị, có thể bỏ dòng này
        refreshTokenRepository.deleteByUser(user);

        // Sinh Refresh Token
        String refreshTokenString = UUID.randomUUID().toString();
        RefreshToken refreshToken = RefreshToken.builder()
                .token(refreshTokenString)
                .user(user)
                .expiryDate(LocalDateTime.now().plusDays(7))
                .build();
        refreshTokenRepository.save(refreshToken);

        return AuthResponse.builder()
                .token(jwtToken)
                .refreshToken(refreshTokenString)
                .user(mapToUserResponse(user))
                .build();
    }

    public AuthResponse oauth2Google(String token) {
        RestTemplate restTemplate = new RestTemplate();
        String url = "https://www.googleapis.com/oauth2/v3/userinfo?access_token=" + token;
        
        try {
            ResponseEntity<Map> response = restTemplate.getForEntity(url, Map.class);
            if (response.getStatusCode() == HttpStatus.OK && response.getBody() != null) {
                Map<String, Object> body = response.getBody();
                String email = (String) body.get("email");
                String name = (String) body.get("name");
                String sub = (String) body.get("sub");
                String picture = (String) body.get("picture");
                
                return processOAuth2User(email, name, "GOOGLE", sub, picture);
            } else {
                throw new BadRequestException("Google token không hợp lệ.");
            }
        } catch (Exception e) {
            throw new BadRequestException("Lỗi xác thực Google: " + e.getMessage());
        }
    }

    public AuthResponse oauth2Facebook(String token) {
        RestTemplate restTemplate = new RestTemplate();
        String url = "https://graph.facebook.com/me?fields=id,name,email,picture&access_token=" + token;
        
        try {
            ResponseEntity<Map> response = restTemplate.getForEntity(url, Map.class);
            if (response.getStatusCode() == HttpStatus.OK && response.getBody() != null) {
                Map<String, Object> body = response.getBody();
                String email = (String) body.get("email");
                String name = (String) body.get("name");
                String id = (String) body.get("id");
                
                // Trích xuất hình ảnh Facebook nếu có
                String pictureUrl = null;
                if (body.containsKey("picture")) {
                    Map<String, Object> pictureObj = (Map<String, Object>) body.get("picture");
                    if (pictureObj.containsKey("data")) {
                        Map<String, Object> dataObj = (Map<String, Object>) pictureObj.get("data");
                        pictureUrl = (String) dataObj.get("url");
                    }
                }
                
                if (email == null) {
                    throw new BadRequestException("Không thể lấy email từ tài khoản Facebook của bạn. Vui lòng cập nhật quyền truy cập email.");
                }
                
                return processOAuth2User(email, name, "FACEBOOK", id, pictureUrl);
            } else {
                throw new BadRequestException("Facebook token không hợp lệ.");
            }
        } catch (Exception e) {
            throw new BadRequestException("Lỗi xác thực Facebook: " + e.getMessage());
        }
    }

    private AuthResponse processOAuth2User(String email, String name, String provider, String providerId, String avatar) {
        Optional<User> userOptional = userRepository.findByEmail(email);
        User user;
        
        if (userOptional.isPresent()) {
            user = userOptional.get();
            
            // Kiểm tra tài khoản có bị vô hiệu hóa không
            if (user.getIsActive() != null && !user.getIsActive()) {
                throw new BadRequestException("Tài khoản của bạn đã bị vô hiệu hóa.");
            }
            
            // Kiểm tra tài khoản có đang bị tạm khóa không
            if (!user.isAccountNonLocked()) {
                throw new BadRequestException("Tài khoản của bạn đang bị tạm khóa. Vui lòng thử lại sau.");
            }

            // Cập nhật provider nếu chưa có hoặc đang là LOCAL
            if ("LOCAL".equals(user.getProvider()) || user.getProvider() == null) {
                user.setProvider(provider);
                user.setProviderId(providerId);
            }
            if (user.getAvatar() == null && avatar != null) {
                user.setAvatar(avatar);
            }
            
            // Ngăn chặn chiếm đoạt tài khoản (Account Takeover)
            // Nếu tài khoản trước đó chưa verify email, random mật khẩu để hủy bỏ pass cũ và verify email
            if (user.getIsEmailVerified() != null && !user.getIsEmailVerified()) {
                user.setPassword(passwordEncoder.encode(UUID.randomUUID().toString()));
                user.setIsEmailVerified(true);
            }
        } else {
            // Đăng ký người dùng mới
            Role customerRole = roleRepository.findByName("ROLE_CUSTOMER")
                    .orElseThrow(() -> new RuntimeException("Lỗi hệ thống: Không tìm thấy quyền ROLE_CUSTOMER"));
            
            // Generate a random password since oauth users won't use it, but DB requires it
            String randomPassword = UUID.randomUUID().toString();
            
            user = User.builder()
                    .email(email)
                    .password(passwordEncoder.encode(randomPassword))
                    .fullName(name != null ? name : "Người dùng " + provider)
                    .provider(provider)
                    .providerId(providerId)
                    .avatar(avatar)
                    .role(customerRole)
                    .isActive(true)
                    .isEmailVerified(true) // OAuth đã xác thực email
                    .build();
        }
        
        user.setLastLoginAt(LocalDateTime.now());
        userRepository.save(user);
        
        // Sinh JWT token
        String jwtToken = jwtService.generateToken(user.getEmail(), user.getRole().getName());
        
        refreshTokenRepository.deleteByUser(user);
        String refreshTokenString = UUID.randomUUID().toString();
        RefreshToken refreshToken = RefreshToken.builder()
                .token(refreshTokenString)
                .user(user)
                .expiryDate(LocalDateTime.now().plusDays(7))
                .build();
        refreshTokenRepository.save(refreshToken);
        
        return AuthResponse.builder()
                .token(jwtToken)
                .refreshToken(refreshTokenString)
                .user(mapToUserResponse(user))
                .build();
    }

    public AuthResponse refreshToken(String token) {
        RefreshToken refreshToken = refreshTokenRepository.findByToken(token)
                .orElseThrow(() -> new BadRequestException("Refresh token không hợp lệ!"));

        if (refreshToken.getExpiryDate().isBefore(LocalDateTime.now())) {
            refreshTokenRepository.delete(refreshToken);
            throw new BadRequestException("Refresh token đã hết hạn! Vui lòng đăng nhập lại.");
        }

        User user = refreshToken.getUser();
        String jwtToken = jwtService.generateToken(user.getEmail(), user.getRole().getName());

        return AuthResponse.builder()
                .token(jwtToken)
                .refreshToken(token) // Giữ nguyên refresh token cũ, hoặc có thể tạo mới
                .user(mapToUserResponse(user))
                .build();
    }

    public void logout(String jwtToken) {
        if (jwtToken == null || !jwtToken.startsWith("Bearer ")) return;
        String actualToken = jwtToken.substring(7);

        // Đưa token vào blacklist
        InvalidatedToken invalidatedToken = InvalidatedToken.builder()
                .token(actualToken)
                .expiryDate(LocalDateTime.now().plusDays(1)) // Giả sử access token sống 1 ngày
                .build();
        invalidatedTokenRepository.save(invalidatedToken);
    }

    public Optional<User> findByEmail(String email) {
        return userRepository.findByEmail(email);
    }

    private void handleFailedLogin(String email) {
        userRepository.findByEmail(email).ifPresent(user -> {
            // Nếu tài khoản đã bị khoá vĩnh viễn thì không cần tăng số lần sai nữa
            if (user.getIsActive() != null && !user.getIsActive()) return;

            int attempts = user.getFailedLoginAttempts() != null ? user.getFailedLoginAttempts() : 0;
            attempts++;
            user.setFailedLoginAttempts(attempts);
            
            // Khoá tài khoản 15 phút nếu nhập sai 5 lần
            if (attempts >= 5) {
                user.setLockoutTime(LocalDateTime.now().plusMinutes(15));
            }
            userRepository.save(user);
        });
    }

    public void saveUser(User user) {
        userRepository.save(user);
    }

    private UserResponse mapToUserResponse(User user) {
        UserResponse response = new UserResponse();
        response.setId(user.getId());
        response.setEmail(user.getEmail());
        response.setFullName(user.getFullName());
        response.setPhone(user.getPhone());
        response.setAddress(user.getAddress());
        response.setIsActive(user.getIsActive());

        if (user.getRole() != null) {
            RoleResponse roleResponse = new RoleResponse();
            roleResponse.setId(user.getRole().getId());
            roleResponse.setName(user.getRole().getName());
            response.setRole(roleResponse);
        }

        return response;
    }
}