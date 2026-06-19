package com.accessories.shop.backend.config;

import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthFilter;
    private final AuthenticationProvider authenticationProvider;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .csrf(AbstractHttpConfigurer::disable)
                .cors(cors -> {}) // Kích hoạt CORS (Nó sẽ tự lấy cấu hình CorsConfig)
                .authorizeHttpRequests(auth -> auth
                        // Mở cửa cho Đăng ký, Đăng nhập
                        .requestMatchers("/api/v1/auth/**").permitAll()
                        // Mở cửa cho Khách hàng xem danh sách Sản phẩm, Thể loại, Chất liệu
                        .requestMatchers(HttpMethod.GET, "/api/v1/categories/**", "/api/v1/products/**", "/api/v1/materials/**", "/api/v1/variants/**").permitAll()
                        // Tất cả các request còn lại bắt buộc phải có Token (Đã đăng nhập)
                        .anyRequest().authenticated()
                )
                .sessionManagement(sess -> sess.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authenticationProvider(authenticationProvider)
                .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}