package com.accessories.shop.backend.service;

import com.accessories.shop.backend.dto.AuthResponse;
import com.accessories.shop.backend.dto.LoginRequest;
import com.accessories.shop.backend.dto.RegisterRequest;
import com.accessories.shop.backend.entity.Role;
import com.accessories.shop.backend.entity.User;
import com.accessories.shop.backend.repository.RoleRepository;
import com.accessories.shop.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;

    public AuthResponse register(RegisterRequest request) {
        // Kiểm tra xem Email đã tồn tại chưa
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email đã được sử dụng!");
        }

        // Lấy Role mặc định là ROLE_CUSTOMER (Nếu chưa có trong DB thì phải tạo tay trong MySQL nhé)
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
                .build();

        userRepository.save(user);

        // Sinh Token
        String jwtToken = jwtService.generateToken(user.getEmail(), user.getRole().getName());

        return AuthResponse.builder()
                .token(jwtToken)
                .email(user.getEmail())
                .role(user.getRole().getName())
                .build();
    }

    public AuthResponse login(LoginRequest request) {
        // Hàm này của Spring Security sẽ tự động tra DB và so sánh Password đã băm
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );

        // Đã pass qua được hàm trên nghĩa là tài khoản đúng
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow();

        // Sinh Token
        String jwtToken = jwtService.generateToken(user.getEmail(), user.getRole().getName());

        return AuthResponse.builder()
                .token(jwtToken)
                .email(user.getEmail())
                .role(user.getRole().getName())
                .build();
    }
}