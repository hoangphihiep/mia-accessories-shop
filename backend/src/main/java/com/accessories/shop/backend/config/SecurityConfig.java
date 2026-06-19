package com.accessories.shop.backend.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable()) // Vô hiệu hóa CSRF cho API
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/api/v1/**").permitAll() // Cho phép truy cập tất cả API v1 mà không cần đăng nhập
                .anyRequest().authenticated()
            );
        
        return http.build();
    }
}
