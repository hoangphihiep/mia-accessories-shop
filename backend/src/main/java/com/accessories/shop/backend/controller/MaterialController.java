package com.accessories.shop.backend.controller;

import com.accessories.shop.backend.entity.Material;
import com.accessories.shop.backend.service.MaterialService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/materials")
@RequiredArgsConstructor
public class MaterialController {

    private final MaterialService materialService;

    @GetMapping
    public ResponseEntity<List<Material>> getAllMaterials() {
        return ResponseEntity.ok(materialService.getAllMaterials());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Material> getMaterialById(@PathVariable Long id) {
        return ResponseEntity.ok(materialService.getMaterialById(id));
    }

    @PostMapping
    public ResponseEntity<Material> createMaterial(@RequestBody Material material) {
        return ResponseEntity.ok(materialService.createMaterial(material));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Material> updateMaterial(@PathVariable Long id, @RequestBody Material materialDetails) {
        return ResponseEntity.ok(materialService.updateMaterial(id, materialDetails));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteMaterial(@PathVariable Long id) {
        materialService.deleteMaterial(id);
        return ResponseEntity.ok("Xóa thành công chất liệu có ID: " + id);
    }
}