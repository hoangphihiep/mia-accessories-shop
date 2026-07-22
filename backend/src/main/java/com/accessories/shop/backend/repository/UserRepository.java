package com.accessories.shop.backend.repository;

import com.accessories.shop.backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email); // Phục vụ cực tốt cho chức năng Đăng nhập
    boolean existsByEmail(String email); // Kiểm tra email đã đăng ký chưa
    Optional<User> findByPhone(String phone); // Lấy khách hàng theo số điện thoại

    @Query("SELECT u FROM User u WHERE " +
            "u.role.name IN ('ROLE_ADMIN', 'ROLE_STAFF') AND " +
            "(:keyword IS NULL OR :keyword = '' OR " +
            "LOWER(u.email) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
            "LOWER(u.fullName) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
            "LOWER(u.phone) LIKE LOWER(CONCAT('%', :keyword, '%')))")
    Page<User> searchUsers(@Param("keyword") String keyword, Pageable pageable);

    @Query("SELECT u FROM User u WHERE " +
            "u.role.name = 'ROLE_CUSTOMER' AND " +
            "(:keyword IS NULL OR :keyword = '' OR " +
            "LOWER(u.email) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
            "LOWER(u.fullName) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
            "LOWER(u.phone) LIKE LOWER(CONCAT('%', :keyword, '%')))")
    Page<User> searchCustomers(@Param("keyword") String keyword, Pageable pageable);
}