package com.accessories.shop.backend.controller;

import com.accessories.shop.backend.dto.request.OrderRequest;
import com.accessories.shop.backend.dto.response.OrderResponse;
import com.accessories.shop.backend.entity.Order;
import com.accessories.shop.backend.mapper.OrderMapper;
import com.accessories.shop.backend.service.OrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/admin/orders")
@RequiredArgsConstructor
public class AdminOrderController {

    private final OrderService orderService;
    private final OrderMapper orderMapper;

    @GetMapping
    public ResponseEntity<List<OrderResponse>> getAllOrders() {
        List<OrderResponse> responses = orderService.findAllOrders().stream()
                .map(orderMapper::toResponse)
                .collect(Collectors.toList());
        return ResponseEntity.ok(responses);
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<OrderResponse> updateOrderStatus(@PathVariable Long id, @RequestBody Map<String, String> payload) {
        String status = payload.get("status");
        String expectedDateStr = payload.get("expectedDate");
        String trackingCode = payload.get("trackingCode");
        Order order = orderService.updateOrderStatus(id, status, expectedDateStr, trackingCode);
        return ResponseEntity.ok(orderMapper.toResponse(order));
    }

    @PostMapping("/pos")
    public ResponseEntity<OrderResponse> placePosOrder(@RequestBody OrderRequest request) {
        Order order = orderService.placePosOrder(request);
        return ResponseEntity.ok(orderMapper.toResponse(order));
    }
}
