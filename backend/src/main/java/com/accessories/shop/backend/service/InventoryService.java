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

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class InventoryService {

    private final InventoryReceiptRepository inventoryReceiptRepository;
    private final ProductVariantRepository productVariantRepository;
    private final UserRepository userRepository;

    public List<InventoryReceipt> findAllReceipts() {
        return inventoryReceiptRepository.findAll();
    }

    @Transactional
    public InventoryReceipt createReceipt(InventoryReceiptRequest request) {
        String currentUserEmail = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmail(currentUserEmail)
                .orElseThrow(() -> new com.accessories.shop.backend.exception.ResourceNotFoundException("Không tìm thấy người dùng đăng nhập"));

        InventoryReceipt receipt = InventoryReceipt.builder()
                .createdBy(user)
                .supplier(request.getSupplier())
                .details(new ArrayList<>())
                .build();

        BigDecimal totalCost = BigDecimal.ZERO;

        for (InventoryReceiptRequest.ReceiptDetailReq reqDetail : request.getDetails()) {
            ProductVariant variant = productVariantRepository.findById(reqDetail.getVariantId())
                    .orElseThrow(() -> new com.accessories.shop.backend.exception.ResourceNotFoundException("Không tìm thấy mẫu sản phẩm"));

            // Tăng số lượng tồn kho
            variant.setStockQuantity(variant.getStockQuantity() + reqDetail.getQuantity());
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
        return inventoryReceiptRepository.save(receipt);
    }
}
