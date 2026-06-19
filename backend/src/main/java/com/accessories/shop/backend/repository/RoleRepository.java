package com.accessories.shop.backend.repository;

import com.accessories.shop.backend.entity.Role;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface RoleRepository extends JpaRepository<Role, Long> {
    Optional<Role> findByName(String name); // Tìm quyền theo tên (vd: ROLE_ADMIN)
}