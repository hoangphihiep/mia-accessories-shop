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
    private final com.accessories.shop.backend.repository.OrderDetailRepository orderDetailRepository;
    private final com.accessories.shop.backend.mapper.OrderMapper orderMapper;

    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getStats() {
        java.time.LocalDateTime now = java.time.LocalDateTime.now();
        
        // This Month
        java.time.LocalDateTime startOfMonth = now.with(java.time.temporal.TemporalAdjusters.firstDayOfMonth()).withHour(0).withMinute(0).withSecond(0);
        java.time.LocalDateTime endOfMonth = now.with(java.time.temporal.TemporalAdjusters.lastDayOfMonth()).withHour(23).withMinute(59).withSecond(59);

        long ordersThisMonth = orderRepository.countByCreatedAtBetween(startOfMonth, endOfMonth);
        BigDecimal revenueThisMonth = orderRepository.sumTotalRevenueForCompletedOrdersBetween(startOfMonth, endOfMonth);
        if (revenueThisMonth == null) revenueThisMonth = BigDecimal.ZERO;

        // Last Month
        java.time.LocalDateTime startOfLastMonth = startOfMonth.minusMonths(1);
        java.time.LocalDateTime endOfLastMonth = startOfMonth.minusSeconds(1);

        long ordersLastMonth = orderRepository.countByCreatedAtBetween(startOfLastMonth, endOfLastMonth);
        BigDecimal revenueLastMonth = orderRepository.sumTotalRevenueForCompletedOrdersBetween(startOfLastMonth, endOfLastMonth);
        if (revenueLastMonth == null) revenueLastMonth = BigDecimal.ZERO;

        // Calculate Trends (%)
        double ordersTrend = 0.0;
        if (ordersLastMonth > 0) {
            ordersTrend = ((double) (ordersThisMonth - ordersLastMonth) / ordersLastMonth) * 100;
        } else if (ordersThisMonth > 0) {
            ordersTrend = 100.0;
        }

        double revenueTrend = 0.0;
        if (revenueLastMonth.compareTo(BigDecimal.ZERO) > 0) {
            revenueTrend = revenueThisMonth.subtract(revenueLastMonth)
                    .divide(revenueLastMonth, 4, java.math.RoundingMode.HALF_UP)
                    .multiply(new BigDecimal("100")).doubleValue();
        } else if (revenueThisMonth.compareTo(BigDecimal.ZERO) > 0) {
            revenueTrend = 100.0;
        }

        long pendingOrders = orderRepository.countByStatus("PENDING");
        long lowStockItems = productVariantRepository.countByStockQuantityLessThan(10);

        Map<String, Object> stats = new HashMap<>();
        stats.put("ordersThisMonth", ordersThisMonth);
        stats.put("revenueThisMonth", revenueThisMonth);
        stats.put("ordersTrend", Math.round(ordersTrend * 10.0) / 10.0);
        stats.put("revenueTrend", Math.round(revenueTrend * 10.0) / 10.0);
        stats.put("pendingOrders", pendingOrders);
        stats.put("lowStockItems", lowStockItems);

        return ResponseEntity.ok(stats);
    }

    @GetMapping("/recent-orders")
    public ResponseEntity<List<com.accessories.shop.backend.dto.response.OrderResponse>> getRecentOrders() {
        org.springframework.data.domain.Pageable pageable = org.springframework.data.domain.PageRequest.of(0, 5);
        List<com.accessories.shop.backend.dto.response.OrderResponse> recentOrders = orderRepository.findAllByOrderByCreatedAtDesc(pageable)
                .stream()
                .map(orderMapper::toResponse)
                .toList();
        return ResponseEntity.ok(recentOrders);
    }
    @GetMapping("/daily-revenue")
    public ResponseEntity<List<Map<String, Object>>> getDailyRevenue() {
        java.time.LocalDateTime now = java.time.LocalDateTime.now();
        java.time.LocalDateTime startOfMonth = now.with(java.time.temporal.TemporalAdjusters.firstDayOfMonth()).withHour(0).withMinute(0).withSecond(0);
        java.time.LocalDateTime endOfMonth = now.with(java.time.temporal.TemporalAdjusters.lastDayOfMonth()).withHour(23).withMinute(59).withSecond(59);

        List<Order> completedOrders = orderRepository.findByStatusAndCreatedAtBetween("COMPLETED", startOfMonth, endOfMonth);

        // Group by day of month
        Map<Integer, BigDecimal> dailySums = new HashMap<>();
        for (Order order : completedOrders) {
            int day = order.getCreatedAt().getDayOfMonth();
            dailySums.merge(day, order.getTotalAmount(), BigDecimal::add);
        }

        List<Map<String, Object>> result = new java.util.ArrayList<>();
        int daysInMonth = now.toLocalDate().lengthOfMonth();
        java.time.format.DateTimeFormatter formatter = java.time.format.DateTimeFormatter.ofPattern("dd/MM");

        for (int i = 1; i <= daysInMonth; i++) {
            Map<String, Object> dayData = new HashMap<>();
            java.time.LocalDate date = now.toLocalDate().withDayOfMonth(i);
            dayData.put("date", date.format(formatter));
            dayData.put("revenue", dailySums.getOrDefault(i, BigDecimal.ZERO));
            result.add(dayData);
        }

        return ResponseEntity.ok(result);
    }

    @GetMapping("/top-products")
    public ResponseEntity<List<Map<String, Object>>> getTopProducts() {
        java.time.LocalDateTime now = java.time.LocalDateTime.now();
        java.time.LocalDateTime startOfMonth = now.with(java.time.temporal.TemporalAdjusters.firstDayOfMonth()).withHour(0).withMinute(0).withSecond(0);
        java.time.LocalDateTime endOfMonth = now.with(java.time.temporal.TemporalAdjusters.lastDayOfMonth()).withHour(23).withMinute(59).withSecond(59);

        org.springframework.data.domain.Pageable topFive = org.springframework.data.domain.PageRequest.of(0, 5);
        List<Map<String, Object>> topProducts = orderDetailRepository.findTopSellingProducts(startOfMonth, endOfMonth, topFive);
        
        return ResponseEntity.ok(topProducts);
    }
}
