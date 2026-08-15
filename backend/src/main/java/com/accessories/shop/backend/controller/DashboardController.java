package com.accessories.shop.backend.controller;

import com.accessories.shop.backend.entity.Order;
import com.accessories.shop.backend.repository.OrderRepository;
import com.accessories.shop.backend.repository.ProductVariantRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.math.BigDecimal;
import java.util.HashMap;
import com.accessories.shop.backend.repository.OrderDetailRepository;
import com.accessories.shop.backend.mapper.OrderMapper;
import com.accessories.shop.backend.dto.response.OrderResponse;
import java.time.LocalDateTime;
import java.time.temporal.TemporalAdjusters;
import java.util.ArrayList;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.PageRequest;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/admin/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private final OrderRepository orderRepository;
    private final ProductVariantRepository productVariantRepository;
    private final OrderDetailRepository orderDetailRepository;
    private final OrderMapper orderMapper;

    private LocalDateTime[] getTimeRange(String timeRange, String startDateStr, String endDateStr, LocalDateTime now) {
        LocalDateTime start;
        LocalDateTime end;
        LocalDateTime prevStart;
        LocalDateTime prevEnd;

        java.time.format.DateTimeFormatter dateFormatter = java.time.format.DateTimeFormatter.ofPattern("yyyy-MM-dd");

        if ("custom".equals(timeRange) && startDateStr != null && endDateStr != null) {
            java.time.LocalDate sDate = java.time.LocalDate.parse(startDateStr, dateFormatter);
            java.time.LocalDate eDate = java.time.LocalDate.parse(endDateStr, dateFormatter);
            start = sDate.atStartOfDay();
            end = eDate.atTime(23, 59, 59, 0);
            
            long daysBetween = java.time.temporal.ChronoUnit.DAYS.between(start, end) + 1;
            prevStart = start.minusDays(daysBetween);
            prevEnd = end.minusDays(daysBetween);
        } else if ("thisYear".equals(timeRange)) {
            start = now.with(TemporalAdjusters.firstDayOfYear()).withHour(0).withMinute(0).withSecond(0).withNano(0);
            end = now.with(TemporalAdjusters.lastDayOfYear()).withHour(23).withMinute(59).withSecond(59).withNano(0);
            prevStart = start.minusYears(1);
            prevEnd = end.minusYears(1);
        } else if ("thisWeek".equals(timeRange)) {
            start = now.with(java.time.DayOfWeek.MONDAY).withHour(0).withMinute(0).withSecond(0).withNano(0);
            end = now.with(java.time.DayOfWeek.SUNDAY).withHour(23).withMinute(59).withSecond(59).withNano(0);
            prevStart = start.minusWeeks(1);
            prevEnd = end.minusWeeks(1);
        } else if ("lastMonth".equals(timeRange)) {
            LocalDateTime startOfThisMonth = getStartOfMonth(now);
            start = startOfThisMonth.minusMonths(1);
            end = startOfThisMonth.minusSeconds(1);
            prevStart = start.minusMonths(1);
            prevEnd = end.minusMonths(1);
        } else {
            // thisMonth (default)
            start = getStartOfMonth(now);
            end = getEndOfMonth(now);
            prevStart = start.minusMonths(1);
            prevEnd = start.minusSeconds(1);
        }
        return new LocalDateTime[]{start, end, prevStart, prevEnd};
    }

    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getStats(
            @RequestParam(defaultValue = "thisMonth") String timeRange,
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate) {
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime[] tr = getTimeRange(timeRange, startDate, endDate, now);
        LocalDateTime startOfRange = tr[0];
        LocalDateTime endOfRange = tr[1];
        LocalDateTime prevStart = tr[2];
        LocalDateTime prevEnd = tr[3];

        long ordersThisRange = orderRepository.countByCreatedAtBetween(startOfRange, endOfRange);
        BigDecimal revenueThisRange = orderRepository.sumTotalRevenueForCompletedOrdersBetween(startOfRange, endOfRange);
        if (revenueThisRange == null) revenueThisRange = BigDecimal.ZERO;

        long ordersPrevRange = orderRepository.countByCreatedAtBetween(prevStart, prevEnd);
        BigDecimal revenuePrevRange = orderRepository.sumTotalRevenueForCompletedOrdersBetween(prevStart, prevEnd);
        if (revenuePrevRange == null) revenuePrevRange = BigDecimal.ZERO;

        // Calculate Trends (%)
        double ordersTrend = 0.0;
        if (ordersPrevRange > 0) {
            ordersTrend = ((double) (ordersThisRange - ordersPrevRange) / ordersPrevRange) * 100;
        } else if (ordersThisRange > 0) {
            ordersTrend = 100.0;
        }

        double revenueTrend = 0.0;
        if (revenuePrevRange.compareTo(BigDecimal.ZERO) > 0) {
            revenueTrend = revenueThisRange.subtract(revenuePrevRange)
                    .divide(revenuePrevRange, 4, java.math.RoundingMode.HALF_UP)
                    .multiply(new BigDecimal("100")).doubleValue();
        } else if (revenueThisRange.compareTo(BigDecimal.ZERO) > 0) {
            revenueTrend = 100.0;
        }

        long pendingOrders = orderRepository.countByStatus("PENDING");
        long lowStockItems = productVariantRepository.countByStockQuantityLessThan(10.0);

        Map<String, Object> stats = new HashMap<>();
        stats.put("ordersThisMonth", ordersThisRange);
        stats.put("revenueThisMonth", revenueThisRange);
        stats.put("ordersTrend", Math.round(ordersTrend * 10.0) / 10.0);
        stats.put("revenueTrend", Math.round(revenueTrend * 10.0) / 10.0);
        stats.put("pendingOrders", pendingOrders);
        stats.put("lowStockItems", lowStockItems);

        return ResponseEntity.ok(stats);
    }

    @GetMapping("/recent-orders")
    public ResponseEntity<List<OrderResponse>> getRecentOrders() {
        Pageable pageable = PageRequest.of(0, 5);
        List<OrderResponse> recentOrders = orderRepository.findAllByOrderByCreatedAtDesc(pageable)
                .stream()
                .map(orderMapper::toResponse)
                .toList();
        return ResponseEntity.ok(recentOrders);
    }
    
    @GetMapping("/daily-revenue")
    public ResponseEntity<List<Map<String, Object>>> getDailyRevenue(
            @RequestParam(defaultValue = "thisMonth") String timeRange,
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate) {
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime[] tr = getTimeRange(timeRange, startDate, endDate, now);
        LocalDateTime startOfRange = tr[0];
        LocalDateTime endOfRange = tr[1];

        List<Order> completedOrders = orderRepository.findByStatusAndCreatedAtBetween("COMPLETED", startOfRange, endOfRange);

        // Group by yyyy-MM-dd
        Map<String, BigDecimal> dailySums = new HashMap<>();
        java.time.format.DateTimeFormatter formatKey = java.time.format.DateTimeFormatter.ofPattern("yyyy-MM-dd");
        
        for (Order order : completedOrders) {
            String key = order.getCreatedAt().format(formatKey);
            dailySums.merge(key, order.getTotalAmount(), BigDecimal::add);
        }

        List<Map<String, Object>> result = new ArrayList<>();
        java.time.format.DateTimeFormatter formatter = java.time.format.DateTimeFormatter.ofPattern("dd/MM/yyyy");
        if (!"thisYear".equals(timeRange)) {
            formatter = java.time.format.DateTimeFormatter.ofPattern("dd/MM");
        }

        for (java.time.LocalDate date = startOfRange.toLocalDate(); !date.isAfter(endOfRange.toLocalDate()); date = date.plusDays(1)) {
            Map<String, Object> dayData = new HashMap<>();
            String key = date.format(formatKey);
            dayData.put("date", date.format(formatter));
            dayData.put("revenue", dailySums.getOrDefault(key, BigDecimal.ZERO));
            result.add(dayData);
        }

        return ResponseEntity.ok(result);
    }

    @GetMapping("/top-products")
    public ResponseEntity<List<Map<String, Object>>> getTopProducts(
            @RequestParam(defaultValue = "thisMonth") String timeRange,
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate) {
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime[] tr = getTimeRange(timeRange, startDate, endDate, now);
        
        Pageable topFive = PageRequest.of(0, 5);
        List<Map<String, Object>> topProducts = orderDetailRepository.findTopSellingProducts(tr[0], tr[1], topFive);
        
        return ResponseEntity.ok(topProducts);
    }

    @GetMapping("/product-stats")
    public ResponseEntity<List<Map<String, Object>>> getAllProductStats(
            @RequestParam(defaultValue = "thisMonth") String timeRange,
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate) {
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime[] tr = getTimeRange(timeRange, startDate, endDate, now);
        
        List<Map<String, Object>> allProductStats = orderDetailRepository.findAllProductStats(tr[0], tr[1]);
        
        return ResponseEntity.ok(allProductStats);
    }

    @org.springframework.transaction.annotation.Transactional(readOnly = true)
    @GetMapping("/daily-product-sales")
    public ResponseEntity<List<Map<String, Object>>> getDailyProductSales(
            @RequestParam(defaultValue = "thisMonth") String timeRange,
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate) {
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime[] tr = getTimeRange(timeRange, startDate, endDate, now);
        LocalDateTime startOfRange = tr[0];
        LocalDateTime endOfRange = tr[1];

        List<Order> completedOrders = orderRepository.findByStatusAndCreatedAtBetween("COMPLETED", startOfRange, endOfRange);

        Map<String, Double> dailyQuantity = new HashMap<>();
        Map<String, Map<String, Double>> dailyProductQty = new HashMap<>();
        Map<String, Map<String, BigDecimal>> dailyProductRev = new HashMap<>();
        java.time.format.DateTimeFormatter formatKey = java.time.format.DateTimeFormatter.ofPattern("yyyy-MM-dd");

        for (Order order : completedOrders) {
            String key = order.getCreatedAt().format(formatKey);
            for (var detail : order.getOrderDetails()) {
                Double qty = detail.getQuantity();
                BigDecimal rev = detail.getPrice().multiply(BigDecimal.valueOf(qty));
                
                dailyQuantity.merge(key, qty, Double::sum);
                
                dailyProductQty.putIfAbsent(key, new HashMap<>());
                dailyProductRev.putIfAbsent(key, new HashMap<>());
                String productName = detail.getProductVariant().getProduct().getName();
                
                dailyProductQty.get(key).merge(productName, qty, Double::sum);
                dailyProductRev.get(key).merge(productName, rev, BigDecimal::add);
            }
        }

        List<Map<String, Object>> result = new ArrayList<>();
        java.time.format.DateTimeFormatter formatter = java.time.format.DateTimeFormatter.ofPattern("dd/MM/yyyy");
        if (!"thisYear".equals(timeRange)) {
            formatter = java.time.format.DateTimeFormatter.ofPattern("dd/MM");
        }

        for (java.time.LocalDate date = startOfRange.toLocalDate(); !date.isAfter(endOfRange.toLocalDate()); date = date.plusDays(1)) {
            Map<String, Object> dayData = new HashMap<>();
            String key = date.format(formatKey);
            dayData.put("date", date.format(formatter));
            
            double totalQty = dailyQuantity.getOrDefault(key, 0.0);
            dayData.put("totalQuantity", totalQty);
            
            String productsDetail = "";
            List<Map<String, Object>> productsData = new ArrayList<>();
            if (totalQty > 0) {
                Map<String, Double> prods = dailyProductQty.get(key);
                Map<String, BigDecimal> revProds = dailyProductRev.get(key);
                
                for (String pName : prods.keySet()) {
                    Map<String, Object> p = new HashMap<>();
                    p.put("name", pName);
                    p.put("quantity", prods.get(pName));
                    p.put("revenue", revProds.get(pName));
                    productsData.add(p);
                }

                List<Map.Entry<String, Double>> sortedProds = new ArrayList<>(prods.entrySet());
                sortedProds.sort((a, b) -> b.getValue().compareTo(a.getValue()));
                
                List<String> prodStrings = new ArrayList<>();
                for (int j = 0; j < Math.min(3, sortedProds.size()); j++) {
                    prodStrings.add(sortedProds.get(j).getKey() + " (" + sortedProds.get(j).getValue() + ")");
                }
                if (sortedProds.size() > 3) {
                    prodStrings.add("...");
                }
                productsDetail = String.join(", ", prodStrings);
            }
            
            dayData.put("productsDetail", productsDetail);
            dayData.put("productsData", productsData);
            result.add(dayData);
        }

        return ResponseEntity.ok(result);
    }

    private LocalDateTime getStartOfMonth(LocalDateTime date) {
        return date.with(TemporalAdjusters.firstDayOfMonth()).withHour(0).withMinute(0).withSecond(0).withNano(0);
    }

    private LocalDateTime getEndOfMonth(LocalDateTime date) {
        return date.with(TemporalAdjusters.lastDayOfMonth()).withHour(23).withMinute(59).withSecond(59).withNano(0);
    }
}
