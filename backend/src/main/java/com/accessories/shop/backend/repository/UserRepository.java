package com.accessories.shop.backend.repository;

import com.accessories.shop.backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email); // Phục vụ cực tốt cho chức năng Đăng nhập
    boolean existsByEmail(String email); // Kiểm tra email đã đăng ký chưa
}