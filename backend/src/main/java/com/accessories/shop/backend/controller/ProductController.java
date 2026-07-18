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
    public ResponseEntity<List<Product>> getAllProducts(@RequestParam(required = false) String search) {
        return ResponseEntity.ok(productService.getAllProducts(search));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Product> getProductById(@PathVariable Long id) {
        return ResponseEntity.ok(productService.getProductById(id));
    }

    // Tạo sản phẩm: POST http://localhost:8080/api/v1/products
    @PostMapping
    public ResponseEntity<Product> createProduct(@RequestBody Product product) {
        Long categoryId = product.getCategory() != null ? product.getCategory().getId() : null;
        Long materialId = product.getMaterial() != null ? product.getMaterial().getId() : null;
        return ResponseEntity.ok(productService.createProduct(product, categoryId, materialId));
    }

    // Cập nhật: PUT http://localhost:8080/api/v1/products/{id}
    @PutMapping("/{id}")
    public ResponseEntity<Product> updateProduct(
            @PathVariable Long id,
            @RequestBody Product productDetails) {
        Long categoryId = productDetails.getCategory() != null ? productDetails.getCategory().getId() : null;
        Long materialId = productDetails.getMaterial() != null ? productDetails.getMaterial().getId() : null;
        return ResponseEntity.ok(productService.updateProduct(id, productDetails, categoryId, materialId));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteProduct(@PathVariable Long id) {
        productService.deleteProduct(id);
        return ResponseEntity.ok("Xóa thành công sản phẩm có ID: " + id);
    }
}