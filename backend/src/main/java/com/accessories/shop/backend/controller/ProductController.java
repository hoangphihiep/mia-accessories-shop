package com.accessories.shop.backend.controller;

import com.accessories.shop.backend.entity.Product;
import com.accessories.shop.backend.service.ProductService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/products")
@RequiredArgsConstructor
public class ProductController {

    private final ProductService productService;

    @GetMapping
    public ResponseEntity<List<Product>> getAllProducts() {
        return ResponseEntity.ok(productService.getAllProducts());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Product> getProductById(@PathVariable Long id) {
        return ResponseEntity.ok(productService.getProductById(id));
    }

    // Tạo sản phẩm: POST http://localhost:8080/api/v1/products?categoryId=1&materialId=1
    @PostMapping
    public ResponseEntity<Product> createProduct(
            @RequestBody Product product,
            @RequestParam Long categoryId,
            @RequestParam Long materialId) {
        return ResponseEntity.ok(productService.createProduct(product, categoryId, materialId));
    }

    // Cập nhật: PUT http://localhost:8080/api/v1/products/{id}?categoryId=1&materialId=1
    @PutMapping("/{id}")
    public ResponseEntity<Product> updateProduct(
            @PathVariable Long id,
            @RequestBody Product productDetails,
            @RequestParam Long categoryId,
            @RequestParam Long materialId) {
        return ResponseEntity.ok(productService.updateProduct(id, productDetails, categoryId, materialId));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteProduct(@PathVariable Long id) {
        productService.deleteProduct(id);
        return ResponseEntity.ok("Xóa thành công sản phẩm có ID: " + id);
    }
}