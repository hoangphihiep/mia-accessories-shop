package com.accessories.shop.backend.controller;

import com.accessories.shop.backend.dto.request.ProductVariantRequest;
import com.accessories.shop.backend.dto.response.ProductVariantResponse;
import com.accessories.shop.backend.entity.ProductVariant;
import com.accessories.shop.backend.mapper.ProductMapper;
import com.accessories.shop.backend.service.ProductVariantService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/variants")
@RequiredArgsConstructor
public class ProductVariantController {

    private final ProductVariantService productVariantService;
    private final ProductMapper productMapper;

    @GetMapping
    public ResponseEntity<List<ProductVariantResponse>> getAllVariants() {
        List<ProductVariantResponse> responses = productVariantService.getAllVariants().stream()
                .map(productMapper::toVariantResponse)
                .collect(Collectors.toList());
        return ResponseEntity.ok(responses);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProductVariantResponse> getVariantById(@PathVariable Long id) {
        ProductVariant variant = productVariantService.getVariantById(id);
        return ResponseEntity.ok(productMapper.toVariantResponse(variant));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ProductVariantResponse> createVariant(@RequestBody ProductVariantRequest request) {
        ProductVariant variant = new ProductVariant();
        variant.setName(request.getName());
        variant.setPrice(request.getPrice());
        variant.setCompareAtPrice(request.getCompareAtPrice());
        variant.setStockQuantity(0.0);
        variant.setCostPrice(java.math.BigDecimal.ZERO);
        variant.setSku(request.getSku());
        variant.setImageUrl(request.getImageUrl());
        
        ProductVariant savedVariant = productVariantService.createVariant(variant, request.getProductId());
        return ResponseEntity.ok(productMapper.toVariantResponse(savedVariant));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ProductVariantResponse> updateVariant(
            @PathVariable Long id,
            @RequestBody ProductVariantRequest request) {
            
        ProductVariant variantDetails = new ProductVariant();
        variantDetails.setName(request.getName());
        variantDetails.setPrice(request.getPrice());
        variantDetails.setCompareAtPrice(request.getCompareAtPrice());
        variantDetails.setSku(request.getSku());
        variantDetails.setImageUrl(request.getImageUrl());
        
        ProductVariant updatedVariant = productVariantService.updateVariant(id, variantDetails, request.getProductId());
        return ResponseEntity.ok(productMapper.toVariantResponse(updatedVariant));
    }
    
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<String> deleteVariant(@PathVariable Long id) {
        productVariantService.deleteVariant(id);
        return ResponseEntity.ok("Xóa thành công mẫu mã có ID: " + id);
    }
}