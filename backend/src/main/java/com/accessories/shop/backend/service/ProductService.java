package com.accessories.shop.backend.service;

import com.accessories.shop.backend.dto.request.ProductVariantRequest;
import com.accessories.shop.backend.entity.*;
import com.accessories.shop.backend.exception.ResourceNotFoundException;
import com.accessories.shop.backend.repository.*;
import com.accessories.shop.backend.specification.ProductSpecification;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.text.Normalizer;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import com.accessories.shop.backend.enums.ProductionType;
import com.accessories.shop.backend.dto.request.VariantRawMaterialRequest;
import java.util.regex.Pattern;

@Service
@RequiredArgsConstructor
public class ProductService {

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    private final MaterialRepository materialRepository;
    private final ProductVariantRepository productVariantRepository;

    @Cacheable(value = "max_price")
    public java.math.BigDecimal getMaxPrice() {
        java.math.BigDecimal max = productVariantRepository.findMaxPrice();
        return max != null ? max : new java.math.BigDecimal("2000000");
    }

    @Cacheable(value = "products")
    public Page<Product> getAllProducts(String search, String category, Double minPrice, Double maxPrice, Boolean isFeatured, Boolean includeInactive, Pageable pageable) {
        Specification<Product> spec = Specification.where(ProductSpecification.hasSearchKeyword(search));
        
        if (includeInactive == null || !includeInactive) {
            spec = spec.and(ProductSpecification.isActive());
        }
        spec = spec.and(ProductSpecification.hasCategory(category))
                .and(ProductSpecification.hasPriceBetween(minPrice, maxPrice))
                .and(ProductSpecification.hasIsFeatured(isFeatured));
                
        return productRepository.findAll(spec, pageable);
    }

    public Product getProductById(Long id) {
        return productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy sản phẩm với ID: " + id));
    }

    public Product getProductBySlug(String slug) {
        Product product = productRepository.findBySlug(slug)
                .orElseThrow(() -> new ResourceNotFoundException("Sản phẩm không tồn tại"));
                
        if (product.getIsActive() == null || !product.getIsActive()) {
            throw new ResourceNotFoundException("Sản phẩm không còn tồn tại hoặc đã bị ẩn");
        }
        return product;
    }

    @CacheEvict(value = "products", allEntries = true)
    public Product createProduct(Product product, Long categoryId, Long materialId, List<ProductVariantRequest> variantRequests, List<String> images) {
        Category category = categoryRepository.findById(categoryId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy thể loại với ID: " + categoryId));
        Material material = materialRepository.findById(materialId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy chất liệu với ID: " + materialId));

        product.setCategory(category);
        product.setMaterial(material);

        product.setIsFeatured(product.getIsFeatured() != null ? product.getIsFeatured() : false);
        product.setIsNew(product.getIsNew() != null ? product.getIsNew() : false);

        if (product.getSlug() == null || product.getSlug().trim().isEmpty()) {
            product.setSlug(generateSlug(product.getName()));
        } else {
            product.setSlug(generateSlug(product.getSlug()));
        }
        
        // Save product first to generate ID
        Product savedProduct = productRepository.save(product);

        if (variantRequests != null && !variantRequests.isEmpty()) {
            Set<ProductVariant> variants = new HashSet<>();
            for (ProductVariantRequest vReq : variantRequests) {
                ProductVariant variant = createVariantFromRequest(savedProduct, vReq);
                calculateProductionCost(savedProduct, variant, vReq.getRawMaterials(), false);

                variants.add(variant);
            }
            savedProduct.setVariants(variants);
        }

        processImages(savedProduct, images);

        return productRepository.save(savedProduct);
    }

    @CacheEvict(value = "products", allEntries = true)
    public Product updateProduct(Long id, Product productDetails, Long categoryId, Long materialId, List<ProductVariantRequest> variantRequests, List<String> images) {
        Product product = getProductById(id);

        Category category = categoryRepository.findById(categoryId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy thể loại với ID: " + categoryId));
        Material material = materialRepository.findById(materialId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy chất liệu với ID: " + materialId));

        product.setName(productDetails.getName());
        if (productDetails.getSlug() == null || productDetails.getSlug().trim().isEmpty()) {
            product.setSlug(generateSlug(productDetails.getName()));
        } else {
            product.setSlug(generateSlug(productDetails.getSlug()));
        }
        product.setDescription(productDetails.getDescription());
        product.setIsActive(productDetails.getIsActive());
        product.setIsFeatured(productDetails.getIsFeatured() != null ? productDetails.getIsFeatured() : false);
        product.setIsNew(productDetails.getIsNew() != null ? productDetails.getIsNew() : false);
        product.setCategory(category);
        product.setMaterial(material);

        if (variantRequests != null) {
            Set<ProductVariant> existingVariants = product.getVariants();
            if (existingVariants == null) {
                existingVariants = new HashSet<>();
                product.setVariants(existingVariants);
            }

            // Đánh dấu id của các variant gửi lên
            Set<Long> requestVariantIds = new HashSet<>();
            
            for (ProductVariantRequest vReq : variantRequests) {
                if (vReq.getId() != null) {
                    requestVariantIds.add(vReq.getId());
                    // Cập nhật variant cũ
                    existingVariants.stream()
                            .filter(v -> vReq.getId().equals(v.getId()))
                            .findFirst()
                            .ifPresent(v -> {
                                v.setName(vReq.getName());
                                v.setSku(vReq.getSku());
                                v.setPrice(vReq.getPrice());
                                v.setCompareAtPrice(vReq.getCompareAtPrice());
                                v.setImageUrl(vReq.getImageUrl());
                                v.setIsActive(true);
                                v.setMachineHours(vReq.getMachineHours() != null ? vReq.getMachineHours() : 0.0);
                                v.setDisplayQuantity(vReq.getDisplayQuantity() != null ? vReq.getDisplayQuantity() : v.getStockQuantity());
                                
                                calculateProductionCost(product, v, vReq.getRawMaterials(), true);
                                // Tuyệt đối KHÔNG cập nhật stockQuantity và costPrice ở đây
                            });
                } else {
                    // Tạo variant mới
                    ProductVariant newVariant = createVariantFromRequest(product, vReq);
                    calculateProductionCost(product, newVariant, vReq.getRawMaterials(), false);

                    existingVariants.add(newVariant);
                }
            }

            // Xóa mềm các variant không có trong danh sách gửi lên
            for (ProductVariant existingVariant : existingVariants) {
                if (existingVariant.getId() != null && !requestVariantIds.contains(existingVariant.getId())) {
                    existingVariant.setIsActive(false);
                }
            }
        }

        processImages(product, images);

        return productRepository.save(product);
    }

    @CacheEvict(value = "products", allEntries = true)
    public void deleteProduct(Long id) {
        Product product = getProductById(id);
        productRepository.delete(product);
    }

    private void processImages(Product product, List<String> images) {
        if (images != null) {
            Set<ProductImage> existingImages = product.getImages();
            if (existingImages == null) {
                existingImages = new HashSet<>();
                product.setImages(existingImages);
            }
            existingImages.clear();
            for (int i = 0; i < images.size(); i++) {
                String imgUrl = images.get(i);
                if (imgUrl != null && !imgUrl.trim().isEmpty()) {
                    ProductImage img = ProductImage.builder()
                            .product(product)
                            .imageUrl(imgUrl)
                            .isPrimary(i == 0)
                            .build();
                    existingImages.add(img);
                }
            }
        }
    }

    private void calculateProductionCost(Product product, ProductVariant variant, List<VariantRawMaterialRequest> rawMaterialRequests, boolean isExisting) {
        if (product.getProductionType() == ProductionType.MANUFACTURED) {
            BigDecimal electricityCost = product.getElectricityCost() != null ? product.getElectricityCost() : BigDecimal.ZERO;
            BigDecimal machineCost = product.getMachineCost() != null ? product.getMachineCost() : BigDecimal.ZERO;
            
            BigDecimal depreciationCost = machineCost.divide(BigDecimal.valueOf(3000), 10, java.math.RoundingMode.HALF_UP)
                    .multiply(BigDecimal.valueOf(variant.getMachineHours()));
            
            variant.setDepreciationCost(depreciationCost);
            variant.setProductionCost(electricityCost.add(depreciationCost));
            
            variant.setCostPrice(electricityCost.add(depreciationCost));
            
            if (variant.getRawMaterials() == null) {
                variant.setRawMaterials(new HashSet<>());
            } else if (isExisting) {
                variant.getRawMaterials().clear();
            }
            
            if (rawMaterialRequests != null && !rawMaterialRequests.isEmpty()) {
                for (VariantRawMaterialRequest rmReq : rawMaterialRequests) {
                    ProductVariant materialVariant = productVariantRepository.findById(rmReq.getMaterialVariantId())
                            .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy mẫu mã thành phần với ID: " + rmReq.getMaterialVariantId()));
                    VariantRawMaterial vrm = VariantRawMaterial.builder()
                            .productVariant(variant)
                            .materialVariant(materialVariant)
                            .quantity(rmReq.getQuantity())
                            .build();
                    variant.getRawMaterials().add(vrm);
                }
            }
        }
    }

    private ProductVariant createVariantFromRequest(Product product, ProductVariantRequest vReq) {
        return ProductVariant.builder()
                .product(product)
                .name(vReq.getName())
                .sku(vReq.getSku())
                .price(vReq.getPrice())
                .compareAtPrice(vReq.getCompareAtPrice())
                .imageUrl(vReq.getImageUrl())
                .stockQuantity(vReq.getStockQuantity() != null ? vReq.getStockQuantity() : 0)
                .displayQuantity(vReq.getDisplayQuantity() != null ? vReq.getDisplayQuantity() : (vReq.getStockQuantity() != null ? vReq.getStockQuantity() : 0.0))
                .costPrice(BigDecimal.ZERO)
                .isActive(true)
                .machineHours(vReq.getMachineHours() != null ? vReq.getMachineHours() : 0.0)
                .build();
    }

    private String generateSlug(String input) {
        if (input == null || input.isEmpty()) return "";
        String normalized = Normalizer.normalize(input, Normalizer.Form.NFD);
        Pattern pattern = Pattern.compile("\\p{InCombiningDiacriticalMarks}+");
        String slug = pattern.matcher(normalized).replaceAll("").toLowerCase();
        return slug.replaceAll("đ", "d").replaceAll("[^a-z0-9]+", "-").replaceAll("^-|-$", "");
    }
}