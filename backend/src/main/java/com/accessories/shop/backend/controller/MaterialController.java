package com.accessories.shop.backend.controller;

import com.accessories.shop.backend.dto.request.MaterialRequest;
import com.accessories.shop.backend.dto.response.MaterialResponse;
import com.accessories.shop.backend.entity.Material;
import com.accessories.shop.backend.mapper.MaterialMapper;
import com.accessories.shop.backend.service.MaterialService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/materials")
@RequiredArgsConstructor
public class MaterialController {

    private final MaterialService materialService;
    private final MaterialMapper materialMapper;

    @GetMapping
    public ResponseEntity<List<MaterialResponse>> getAllMaterials() {
        List<MaterialResponse> responses = materialService.getAllMaterials().stream()
                .map(materialMapper::toResponse)
                .collect(Collectors.toList());
        return ResponseEntity.ok(responses);
    }

    @GetMapping("/{id}")
    public ResponseEntity<MaterialResponse> getMaterialById(@PathVariable Long id) {
        Material material = materialService.getMaterialById(id);
        return ResponseEntity.ok(materialMapper.toResponse(material));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<MaterialResponse> createMaterial(@RequestBody MaterialRequest request) {
        Material material = materialMapper.toEntity(request);
        Material savedMaterial = materialService.createMaterial(material);
        return ResponseEntity.ok(materialMapper.toResponse(savedMaterial));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<MaterialResponse> updateMaterial(@PathVariable Long id, @RequestBody MaterialRequest request) {
        Material materialDetails = materialMapper.toEntity(request);
        Material updatedMaterial = materialService.updateMaterial(id, materialDetails);
        return ResponseEntity.ok(materialMapper.toResponse(updatedMaterial));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<String> deleteMaterial(@PathVariable Long id) {
        materialService.deleteMaterial(id);
        return ResponseEntity.ok("Xóa thành công chất liệu có ID: " + id);
    }
}