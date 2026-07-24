package com.accessories.shop.backend.service;

import com.accessories.shop.backend.dto.request.InventoryReceiptRequest;
import com.accessories.shop.backend.entity.InventoryReceipt;
import com.accessories.shop.backend.entity.InventoryReceiptDetail;
import com.accessories.shop.backend.entity.ProductVariant;
import com.accessories.shop.backend.entity.User;
import com.accessories.shop.backend.repository.InventoryReceiptRepository;
import com.accessories.shop.backend.repository.ProductVariantRepository;
import com.accessories.shop.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.cache.annotation.CacheEvict;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import com.accessories.shop.backend.repository.SupplierRepository;
import com.accessories.shop.backend.entity.Supplier;
import com.accessories.shop.backend.exception.ResourceNotFoundException;

@Service
@RequiredArgsConstructor
public class InventoryService {

    private final InventoryReceiptRepository inventoryReceiptRepository;
    private final ProductVariantRepository productVariantRepository;
    private final UserRepository userRepository;
    private final SupplierRepository supplierRepository;

    public List<InventoryReceipt> findAllReceipts() {
        return inventoryReceiptRepository.findAll();
    }

    public List<InventoryReceipt> getReceiptsBySupplierId(Long supplierId) {
        return inventoryReceiptRepository.findBySupplierEntityIdOrderByCreatedAtDesc(supplierId);
    }

    @Transactional
    @CacheEvict(value = "products", allEntries = true)
    public InventoryReceipt createReceipt(InventoryReceiptRequest request) {
        String currentUserEmail = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmail(currentUserEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy người dùng đăng nhập"));

        Supplier supplierEntity = supplierRepository.findById(request.getSupplierId())
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy Nhà cung cấp"));

        InventoryReceipt receipt = InventoryReceipt.builder()
                .createdBy(user)
                .supplier(supplierEntity.getName())
                .supplierEntity(supplierEntity)
                .details(new ArrayList<>())
                .build();

        BigDecimal totalCost = BigDecimal.ZERO;

        for (InventoryReceiptRequest.ReceiptDetailReq reqDetail : request.getDetails()) {
            ProductVariant variant = productVariantRepository.findById(reqDetail.getVariantId())
                    .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy biến thể sản phẩm"));

            // Tính toán giá vốn bình quân gia quyền (MAC)
            int currentStock = variant.getStockQuantity() != null ? variant.getStockQuantity() : 0;
            BigDecimal currentCost = variant.getCostPrice() != null ? variant.getCostPrice() : BigDecimal.ZERO;
            
            int incomingQty = reqDetail.getQuantity();
            BigDecimal incomingPrice = reqDetail.getUnitPrice();

            if (currentStock <= 0) {
                // Nếu kho hết hàng hoặc âm, lấy luôn giá nhập mới làm giá vốn
                variant.setCostPrice(incomingPrice);
            } else {
                // Tính trung bình
                BigDecimal totalCurrentValue = currentCost.multiply(BigDecimal.valueOf(currentStock));
                BigDecimal totalIncomingValue = incomingPrice.multiply(BigDecimal.valueOf(incomingQty));
                BigDecimal newTotalValue = totalCurrentValue.add(totalIncomingValue);
                BigDecimal newTotalStock = BigDecimal.valueOf(currentStock + incomingQty);
                
                // Chia để ra giá mới (làm tròn 2 chữ số thập phân, chế độ HALF_UP)
                BigDecimal newCost = newTotalValue.divide(newTotalStock, 2, java.math.RoundingMode.HALF_UP);
                variant.setCostPrice(newCost);
            }

            // Cập nhật số lượng tồn kho
            variant.setStockQuantity(currentStock + incomingQty);
            productVariantRepository.save(variant);

            BigDecimal detailTotal = reqDetail.getUnitPrice().multiply(BigDecimal.valueOf(reqDetail.getQuantity()));
            totalCost = totalCost.add(detailTotal);

            InventoryReceiptDetail detail = InventoryReceiptDetail.builder()
                    .inventoryReceipt(receipt)
                    .productVariant(variant)
                    .quantity(reqDetail.getQuantity())
                    .unitPrice(reqDetail.getUnitPrice())
                    .build();

            receipt.getDetails().add(detail);
        }

        receipt.setTotalCost(totalCost);

        // Cộng nợ cho nhà cung cấp
        supplierEntity.setDebt(supplierEntity.getDebt().add(totalCost));
        supplierRepository.save(supplierEntity);

        return inventoryReceiptRepository.save(receipt);
    }
}
