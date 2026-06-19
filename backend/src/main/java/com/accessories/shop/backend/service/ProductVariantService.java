package com.accessories.shop.backend.service;

import com.accessories.shop.backend.entity.Product;
import com.accessories.shop.backend.entity.ProductVariant;
import com.accessories.shop.backend.repository.ProductRepository;
import com.accessories.shop.backend.repository.ProductVariantRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ProductVariantService {

    private final ProductVariantRepository productVariantRepository;
    private final ProductRepository productRepository;

    // Lấy tất cả các mẫu mã đang có hệ thống
    public List<ProductVariant> getAllVariants() {
        return productVariantRepository.findAll();
    }

    // Lấy chi tiết 1 mẫu theo ID
    public ProductVariant getVariantById(Long id) {
        return productVariantRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy mẫu mã với ID: " + id));
    }

    // Tạo mới một mẫu (Ví dụ: tạo Mẫu A cho sản phẩm Vòng Tay Chỉ Đỏ)
    public ProductVariant createVariant(ProductVariant variant, Long productId) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy sản phẩm với ID: " + productId));

        variant.setProduct(product);
        return productVariantRepository.save(variant);
    }

    // Cập nhật thông tin mẫu (Giá tiền, số lượng kho...)
    public ProductVariant updateVariant(Long id, ProductVariant variantDetails, Long productId) {
        ProductVariant variant = getVariantById(id);

        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy sản phẩm với ID: " + productId));

        variant.setProduct(product);
        variant.setName(variantDetails.getName());
        variant.setSku(variantDetails.getSku());
        variant.setPrice(variantDetails.getPrice());
        variant.setStockQuantity(variantDetails.getStockQuantity());
        variant.setIsActive(variantDetails.getIsActive());

        return productVariantRepository.save(variant);
    }

    // Xóa mẫu mã
    public void deleteVariant(Long id) {
        ProductVariant variant = getVariantById(id);
        productVariantRepository.delete(variant);
    }
}