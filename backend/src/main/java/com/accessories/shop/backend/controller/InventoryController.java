package com.accessories.shop.backend.controller;

import com.accessories.shop.backend.dto.InventoryReceiptRequest;
import com.accessories.shop.backend.entity.InventoryReceipt;
import com.accessories.shop.backend.service.InventoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/admin/inventory")
@RequiredArgsConstructor
public class InventoryController {

    private final InventoryService inventoryService;

    @GetMapping
    public ResponseEntity<List<InventoryReceipt>> getAllReceipts() {
        return ResponseEntity.ok(inventoryService.findAllReceipts());
    }

    @PostMapping
    public ResponseEntity<InventoryReceipt> createReceipt(@RequestBody InventoryReceiptRequest request) {
        return ResponseEntity.ok(inventoryService.createReceipt(request));
    }
}
