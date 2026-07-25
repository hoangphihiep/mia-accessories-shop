package com.accessories.shop.backend.repository;

import com.accessories.shop.backend.entity.RefreshToken;
import com.accessories.shop.backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

import org.springframework.transaction.annotation.Transactional;

@Repository
public interface RefreshTokenRepository extends JpaRepository<RefreshToken, Long> {
    Optional<RefreshToken> findByToken(String token);
    
    @Transactional
    void deleteByUser(User user);
}
