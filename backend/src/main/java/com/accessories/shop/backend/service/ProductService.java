package com.accessories.shop.backend.service;

import com.accessories.shop.backend.entity.Category;
import com.accessories.shop.backend.entity.Material;
import com.accessories.shop.backend.entity.Product;
import com.accessories.shop.backend.exception.ResourceNotFoundException;
import com.accessories.shop.backend.repository.CategoryRepository;
import com.accessories.shop.backend.repository.MaterialRepository;
import com.accessories.shop.backend.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class ProductService {

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    private final MaterialRepository materialRepository;

    @Cacheable(value = "products")
    public Page<Product> getAllProducts(String search, String category, Double minPrice, Double maxPrice, Pageable pageable) {
        org.springframework.data.jpa.domain.Specification<Product> spec = org.springframework.data.jpa.domain.Specification.where(com.accessories.shop.backend.specification.ProductSpecification.isActive())
                .and(com.accessories.shop.backend.specification.ProductSpecification.hasSearchKeyword(search))
                .and(com.accessories.shop.backend.specification.ProductSpecification.hasCategory(category))
                .and(com.accessories.shop.backend.specification.ProductSpecification.hasPriceBetween(minPrice, maxPrice));
                
        return productRepository.findAll(spec, pageable);
    }

    public Product getProductById(Long id) {
        return productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy sản phẩm với ID: " + id));
    }

    @CacheEvict(value = "products", allEntries = true)
    public Product createProduct(Product product, Long categoryId, Long materialId) {
        // Tìm và gắn Thể loại vào sản phẩm
        Category category = categoryRepository.findById(categoryId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy thể loại với ID: " + categoryId));

        // Tìm và gắn Chất liệu vào sản phẩm
        Material material = materialRepository.findById(materialId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy chất liệu với ID: " + materialId));

        product.setCategory(category);
        product.setMaterial(material);

        if (product.getSlug() == null || product.getSlug().isEmpty()) {
            product.setSlug(product.getName().toLowerCase().replaceAll(" ", "-"));
        }

        return productRepository.save(product);
    }

    @CacheEvict(value = "products", allEntries = true)
    public Product updateProduct(Long id, Product productDetails, Long categoryId, Long materialId) {
        Product product = getProductById(id);

        Category category = categoryRepository.findById(categoryId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy thể loại với ID: " + categoryId));
        Material material = materialRepository.findById(materialId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy chất liệu với ID: " + materialId));

        product.setName(productDetails.getName());
        product.setSlug(productDetails.getSlug());
        product.setDescription(productDetails.getDescription());
        product.setIsActive(productDetails.getIsActive());
        product.setCategory(category);
        product.setMaterial(material);

        return productRepository.save(product);
    }

    @CacheEvict(value = "products", allEntries = true)
    public void deleteProduct(Long id) {
        Product product = getProductById(id);
        productRepository.delete(product);
    }
}