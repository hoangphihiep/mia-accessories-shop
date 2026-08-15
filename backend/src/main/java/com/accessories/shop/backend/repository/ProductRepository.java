package com.accessories.shop.backend.repository;

import com.accessories.shop.backend.entity.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.List;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long>, JpaSpecificationExecutor<Product> {
    @EntityGraph(attributePaths = {"variants", "category", "images"})
    Optional<Product> findBySlug(String slug);
    
    @EntityGraph(attributePaths = {"variants", "category", "images"})
    List<Product> findAll();
}