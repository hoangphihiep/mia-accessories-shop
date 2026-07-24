package com.accessories.shop.backend.controller;

import com.accessories.shop.backend.dto.request.OrderRequest;
import com.accessories.shop.backend.dto.response.OrderResponse;
import com.accessories.shop.backend.entity.Order;
import com.accessories.shop.backend.mapper.OrderMapper;
import com.accessories.shop.backend.service.OrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.core.Authentication;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/orders")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;
    private final OrderMapper orderMapper;

    @PostMapping
    public ResponseEntity<OrderResponse> placeOrder(@RequestBody OrderRequest request) {
        Order order = orderService.placeOrder(request);
        return ResponseEntity.ok(orderMapper.toResponse(order));
    }

    @GetMapping("/my-orders")
    public ResponseEntity<List<OrderResponse>> getMyOrders(Authentication authentication) {
        String email = authentication.getName();
        List<OrderResponse> responses = orderService.getUserOrders(email).stream()
                .map(orderMapper::toResponse)
                .collect(Collectors.toList());
        return ResponseEntity.ok(responses);
    }

    @GetMapping("/track")
    public ResponseEntity<List<OrderResponse>> trackOrders(@RequestParam String phone) {
        List<OrderResponse> responses = orderService.trackOrdersByPhone(phone).stream()
                .map(orderMapper::toResponse)
                .collect(Collectors.toList());
        return ResponseEntity.ok(responses);
    }

    @PutMapping("/{id}/cancel")
    public ResponseEntity<OrderResponse> cancelOrder(Authentication authentication, @PathVariable Long id) {
        String email = authentication.getName();
        Order order = orderService.cancelOrder(email, id);
        return ResponseEntity.ok(orderMapper.toResponse(order));
    }
}