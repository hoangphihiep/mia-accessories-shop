package com.accessories.shop.backend.controller;

import com.accessories.shop.backend.entity.Order;
import com.accessories.shop.backend.entity.ProductVariant;
import com.accessories.shop.backend.repository.OrderRepository;
import com.accessories.shop.backend.repository.ProductVariantRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/admin/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private final OrderRepository orderRepository;
    private final ProductVariantRepository productVariantRepository;

    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getStats() {
        List<Order> allOrders = orderRepository.findAll();
        
        long totalOrders = allOrders.size();
        
        BigDecimal totalRevenue = allOrders.stream()
                .filter(o -> !"CANCELLED".equals(o.getStatus()))
                .map(Order::getTotalAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        List<ProductVariant> allVariants = productVariantRepository.findAll();
        long lowStockItems = allVariants.stream()
                .filter(v -> v.getStockQuantity() < 10)
                .count();

        Map<String, Object> stats = new HashMap<>();
        stats.put("totalOrders", totalOrders);
        stats.put("totalRevenue", totalRevenue);
        stats.put("lowStockItems", lowStockItems);

        return ResponseEntity.ok(stats);
    }
}
