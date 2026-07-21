package com.accessories.shop.backend.repository;

import com.accessories.shop.backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email); // Phục vụ cực tốt cho chức năng Đăng nhập
    boolean existsByEmail(String email); // Kiểm tra email đã đăng ký chưa
    Optional<User> findByPhone(String phone); // Lấy khách hàng theo số điện thoại

    @org.springframework.data.jpa.repository.Query("SELECT u FROM User u WHERE " +
            "u.role.name IN ('ROLE_ADMIN', 'ROLE_STAFF') AND " +
            "(:keyword IS NULL OR :keyword = '' OR " +
            "LOWER(u.email) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
            "LOWER(u.fullName) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
            "LOWER(u.phone) LIKE LOWER(CONCAT('%', :keyword, '%')))")
    org.springframework.data.domain.Page<User> searchUsers(@org.springframework.data.repository.query.Param("keyword") String keyword, org.springframework.data.domain.Pageable pageable);

    @org.springframework.data.jpa.repository.Query("SELECT u FROM User u WHERE " +
            "u.role.name = 'ROLE_CUSTOMER' AND " +
            "(:keyword IS NULL OR :keyword = '' OR " +
            "LOWER(u.email) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
            "LOWER(u.fullName) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
            "LOWER(u.phone) LIKE LOWER(CONCAT('%', :keyword, '%')))")
    org.springframework.data.domain.Page<User> searchCustomers(@org.springframework.data.repository.query.Param("keyword") String keyword, org.springframework.data.domain.Pageable pageable);
}