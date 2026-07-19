package com.accessories.shop.backend.controller;

import com.accessories.shop.backend.dto.request.InventoryReceiptRequest;
import com.accessories.shop.backend.dto.response.InventoryReceiptResponse;
import com.accessories.shop.backend.entity.InventoryReceipt;
import com.accessories.shop.backend.mapper.InventoryMapper;
import com.accessories.shop.backend.service.InventoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/admin/inventory")
@RequiredArgsConstructor
public class InventoryController {

    private final InventoryService inventoryService;
    private final InventoryMapper inventoryMapper;

    @GetMapping
    public ResponseEntity<List<InventoryReceiptResponse>> getAllReceipts() {
        List<InventoryReceiptResponse> responses = inventoryService.findAllReceipts().stream()
                .map(inventoryMapper::toResponse)
                .collect(Collectors.toList());
        return ResponseEntity.ok(responses);
    }

    @PostMapping
    public ResponseEntity<InventoryReceiptResponse> createReceipt(@RequestBody InventoryReceiptRequest request) {
        InventoryReceipt receipt = inventoryService.createReceipt(request);
        return ResponseEntity.ok(inventoryMapper.toResponse(receipt));
    }
}
