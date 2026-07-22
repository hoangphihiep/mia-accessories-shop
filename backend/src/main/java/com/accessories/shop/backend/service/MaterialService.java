package com.accessories.shop.backend.service;

import com.accessories.shop.backend.entity.Material;
import com.accessories.shop.backend.repository.MaterialRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class MaterialService {

    private final MaterialRepository materialRepository;

    public List<Material> getAllMaterials() {
        return materialRepository.findAll();
    }

    public Material getMaterialById(Long id) {
        return materialRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy chất liệu với ID: " + id));
    }

    public Material createMaterial(Material material) {
        if (material.getSlug() == null || material.getSlug().isEmpty()) {
            material.setSlug(material.getName().toLowerCase().replaceAll(" ", "-"));
        }
        return materialRepository.save(material);
    }

    public Material updateMaterial(Long id, Material materialDetails) {
        Material material = getMaterialById(id);
        material.setName(materialDetails.getName());
        material.setSlug(materialDetails.getSlug());
        material.setCareInstructions(materialDetails.getCareInstructions());
        return materialRepository.save(material);
    }

    public void deleteMaterial(Long id) {
        Material material = getMaterialById(id);
        materialRepository.delete(material);
    }
}