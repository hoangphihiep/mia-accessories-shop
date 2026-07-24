package com.accessories.shop.backend.controller;

import com.accessories.shop.backend.dto.request.CollectionRequest;
import com.accessories.shop.backend.dto.response.CollectionResponse;
import com.accessories.shop.backend.entity.Collection;
import com.accessories.shop.backend.mapper.CollectionMapper;
import com.accessories.shop.backend.service.CollectionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/collections")
@RequiredArgsConstructor
public class CollectionController {

    private final CollectionService collectionService;
    private final CollectionMapper collectionMapper;

    // Public API for customers (only active collections)
    @GetMapping("/active")
    public ResponseEntity<List<CollectionResponse>> getActiveCollections() {
        List<CollectionResponse> responses = collectionService.getAllActiveCollections().stream()
                .map(collectionMapper::toResponse)
                .collect(Collectors.toList());
        return ResponseEntity.ok(responses);
    }

    // Public API for customers
    @GetMapping("/{slug}")
    public ResponseEntity<CollectionResponse> getCollectionBySlug(@PathVariable String slug) {
        return ResponseEntity.ok(collectionMapper.toResponse(collectionService.getCollectionBySlug(slug)));
    }

    // Admin APIs
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<CollectionResponse>> getAllCollections() {
        List<CollectionResponse> responses = collectionService.getAllCollections().stream()
                .map(collectionMapper::toResponse)
                .collect(Collectors.toList());
        return ResponseEntity.ok(responses);
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<CollectionResponse> createCollection(@Valid @RequestBody CollectionRequest request) {
        Collection savedCollection = collectionService.createCollection(request);
        return ResponseEntity.ok(collectionMapper.toResponse(savedCollection));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<CollectionResponse> updateCollection(@PathVariable Long id, @Valid @RequestBody CollectionRequest request) {
        Collection updatedCollection = collectionService.updateCollection(id, request);
        return ResponseEntity.ok(collectionMapper.toResponse(updatedCollection));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<String> deleteCollection(@PathVariable Long id) {
        collectionService.deleteCollection(id);
        return ResponseEntity.ok("Xóa bộ sưu tập thành công");
    }
}
