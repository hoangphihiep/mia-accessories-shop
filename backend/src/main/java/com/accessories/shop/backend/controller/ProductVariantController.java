package com.accessories.shop.backend.controller;

import com.accessories.shop.backend.entity.ProductVariant;
import com.accessories.shop.backend.service.ProductVariantService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/variants")
@RequiredArgsConstructor
public class ProductVariantController {

    private final ProductVariantService productVariantService;

    @GetMapping
    public ResponseEntity<List<ProductVariant>> getAllVariants() {
        return ResponseEntity.ok(productVariantService.getAllVariants());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProductVariant> getVariantById(@PathVariable Long id) {
        return ResponseEntity.ok(productVariantService.getVariantById(id));
    }

    @PostMapping
    public ResponseEntity<ProductVariant> createVariant(@RequestBody ProductVariant variant) {
        Long productId = variant.getProduct() != null ? variant.getProduct().getId() : null;
        return ResponseEntity.ok(productVariantService.createVariant(variant, productId));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ProductVariant> updateVariant(
            @PathVariable Long id,
            @RequestBody ProductVariant variantDetails) {
        Long productId = variantDetails.getProduct() != null ? variantDetails.getProduct().getId() : null;
        return ResponseEntity.ok(productVariantService.updateVariant(id, variantDetails, productId));
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteVariant(@PathVariable Long id) {
        productVariantService.deleteVariant(id);
        return ResponseEntity.ok("Xóa thành công mẫu mã có ID: " + id);
    }
}