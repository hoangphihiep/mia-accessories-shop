package com.accessories.shop.backend.controller;

import com.accessories.shop.backend.dto.request.ProductRequest;
import com.accessories.shop.backend.dto.response.ProductResponse;
import com.accessories.shop.backend.entity.Product;
import com.accessories.shop.backend.mapper.ProductMapper;
import com.accessories.shop.backend.service.ProductService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/v1/products")
@RequiredArgsConstructor
public class ProductController {

    private final ProductService productService;
    private final ProductMapper productMapper;

    @GetMapping
    public ResponseEntity<Page<ProductResponse>> getAllProducts(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) Double minPrice,
            @RequestParam(required = false) Double maxPrice,
            @RequestParam(required = false) Boolean isFeatured,
            @RequestParam(required = false, defaultValue = "false") Boolean includeInactive,
            Pageable pageable) {
        Page<Product> productPage = productService.getAllProducts(search, category, minPrice, maxPrice, isFeatured, includeInactive, pageable);
        return ResponseEntity.ok(productPage.map(productMapper::toResponse));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProductResponse> getProductById(@PathVariable Long id) {
        Product product = productService.getProductById(id);
        return ResponseEntity.ok(productMapper.toResponse(product));
    }

    @GetMapping("/slug/{slug}")
    public ResponseEntity<ProductResponse> getProductBySlug(@PathVariable String slug) {
        Product product = productService.getProductBySlug(slug);
        return ResponseEntity.ok(productMapper.toResponse(product));
    }

    @GetMapping("/max-price")
    public ResponseEntity<java.math.BigDecimal> getMaxPrice() {
        return ResponseEntity.ok(productService.getMaxPrice());
    }

    // Tạo sản phẩm: POST http://localhost:8080/api/v1/products
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ProductResponse> createProduct(@Valid @RequestBody ProductRequest request) {
        Product product = productMapper.toEntity(request);
        Product savedProduct = productService.createProduct(product, request.getCategoryId(), request.getMaterialId(), request.getVariants(), request.getImages());
        return ResponseEntity.ok(productMapper.toResponse(savedProduct));
    }

    // Cập nhật: PUT http://localhost:8080/api/v1/products/{id}
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ProductResponse> updateProduct(
            @PathVariable Long id,
            @Valid @RequestBody ProductRequest request) {
        Product productDetails = productMapper.toEntity(request);
        Product updatedProduct = productService.updateProduct(id, productDetails, request.getCategoryId(), request.getMaterialId(), request.getVariants(), request.getImages());
        return ResponseEntity.ok(productMapper.toResponse(updatedProduct));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<String> deleteProduct(@PathVariable Long id) {
        productService.deleteProduct(id);
        return ResponseEntity.ok("Xóa thành công sản phẩm có ID: " + id);
    }
}