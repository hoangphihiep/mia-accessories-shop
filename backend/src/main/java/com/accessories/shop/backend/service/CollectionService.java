package com.accessories.shop.backend.service;

import com.accessories.shop.backend.dto.request.CollectionRequest;
import com.accessories.shop.backend.entity.Collection;
import com.accessories.shop.backend.entity.Product;
import com.accessories.shop.backend.exception.ResourceNotFoundException;
import com.accessories.shop.backend.repository.CollectionRepository;
import com.accessories.shop.backend.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CollectionService {

    private final CollectionRepository collectionRepository;
    private final ProductRepository productRepository;

    public List<Collection> getAllActiveCollections() {
        return collectionRepository.findAll().stream()
                .filter(Collection::getIsActive)
                .collect(Collectors.toList());
    }

    public List<Collection> getAllCollections() {
        // Admin needs to see all collections including inactive ones
        return collectionRepository.findAll();
    }

    public Collection getCollectionBySlug(String slug) {
        return collectionRepository.findBySlug(slug)
                .filter(Collection::getIsActive)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy bộ sưu tập với slug: " + slug));
    }

    public Collection createCollection(CollectionRequest request) {
        Collection collection = new Collection();
        mapRequestToEntity(request, collection);
        return collectionRepository.save(collection);
    }

    public Collection updateCollection(Long id, CollectionRequest request) {
        Collection collection = collectionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy bộ sưu tập ID: " + id));
        mapRequestToEntity(request, collection);
        return collectionRepository.save(collection);
    }

    public void deleteCollection(Long id) {
        Collection collection = collectionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy bộ sưu tập ID: " + id));
        collectionRepository.delete(collection);
    }

    private void mapRequestToEntity(CollectionRequest request, Collection collection) {
        collection.setName(request.getName());
        collection.setDescription(request.getDescription());
        collection.setCoverImage(request.getCoverImage());
        collection.setBannerImage(request.getBannerImage());
        collection.setIsActive(request.getIsActive() != null ? request.getIsActive() : true);
        
        // Auto generate slug if empty
        if (request.getSlug() == null || request.getSlug().trim().isEmpty()) {
            collection.setSlug(generateSlug(request.getName()));
        } else {
            collection.setSlug(request.getSlug());
        }

        if (request.getProductIds() != null) {
            Set<Product> products = new HashSet<>(productRepository.findAllById(request.getProductIds()));
            collection.setProducts(products);
        } else {
            collection.setProducts(new HashSet<>());
        }
    }

    private String generateSlug(String title) {
        String slug = title.toLowerCase()
                .replaceAll("[áàảãạăắằẳẵặâấầẩẫậ]", "a")
                .replaceAll("[éèẻẽẹêếềểễệ]", "e")
                .replaceAll("[íìỉĩị]", "i")
                .replaceAll("[óòỏõọôốồổỗộơớờởỡợ]", "o")
                .replaceAll("[úùủũụưứừửữự]", "u")
                .replaceAll("[ýỳỷỹỵ]", "y")
                .replaceAll("đ", "d")
                .replaceAll("[^a-z0-9\\s-]", "")
                .replaceAll("\\s+", "-")
                .replaceAll("-+", "-")
                .trim();
        if (slug.endsWith("-")) {
            slug = slug.substring(0, slug.length() - 1);
        }
        return slug;
    }
}
