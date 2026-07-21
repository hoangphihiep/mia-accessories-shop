package com.accessories.shop.backend.controller;

import com.accessories.shop.backend.dto.request.SupplierRequest;
import com.accessories.shop.backend.dto.response.SupplierResponse;
import com.accessories.shop.backend.entity.Supplier;
import com.accessories.shop.backend.mapper.SupplierMapper;
import com.accessories.shop.backend.service.SupplierService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/admin/suppliers")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminSupplierController {

    private final SupplierService supplierService;
    private final SupplierMapper supplierMapper;

    @GetMapping
    public ResponseEntity<List<SupplierResponse>> getAllSuppliers() {
        List<SupplierResponse> responses = supplierService.getAllSuppliers().stream()
                .map(supplierMapper::toResponse)
                .collect(Collectors.toList());
        return ResponseEntity.ok(responses);
    }

    @PostMapping
    public ResponseEntity<SupplierResponse> createSupplier(@RequestBody SupplierRequest request) {
        Supplier supplier = supplierMapper.toEntity(request);
        Supplier savedSupplier = supplierService.createSupplier(supplier);
        return ResponseEntity.ok(supplierMapper.toResponse(savedSupplier));
    }

    @PutMapping("/{id}")
    public ResponseEntity<SupplierResponse> updateSupplier(@PathVariable Long id, @RequestBody SupplierRequest request) {
        Supplier supplierDetails = supplierMapper.toEntity(request);
        Supplier updatedSupplier = supplierService.updateSupplier(id, supplierDetails);
        return ResponseEntity.ok(supplierMapper.toResponse(updatedSupplier));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteSupplier(@PathVariable Long id) {
        supplierService.deleteSupplier(id);
        return ResponseEntity.ok("Xóa thành công nhà cung cấp có ID: " + id);
    }
}
