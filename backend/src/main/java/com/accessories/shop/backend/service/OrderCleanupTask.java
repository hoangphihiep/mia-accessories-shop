package com.accessories.shop.backend.service;

import com.accessories.shop.backend.entity.Order;
import com.accessories.shop.backend.repository.OrderRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.List;

@Component
@RequiredArgsConstructor
public class OrderCleanupTask {

    private final OrderRepository orderRepository;
    private final OrderService orderService;

    // Chạy mỗi 5 phút (300000 ms)
    @Scheduled(fixedRate = 300000)
    public void cleanupAbandonedVnpayOrders() {
        System.out.println("[CRON JOB] Đang dọn dẹp các đơn hàng VNPAY bị treo (PENDING) quá hạn...");
        // Tìm các đơn hàng PENDING cách đây hơn 15 phút
        LocalDateTime cutoffTime = LocalDateTime.now().minusMinutes(15);
        List<Order> oldPendingOrders = orderRepository.findByStatusAndCreatedAtBefore("PENDING", cutoffTime);

        int count = 0;
        for (Order order : oldPendingOrders) {
            // Chỉ hủy những đơn hàng online (VNPAY) chưa thanh toán
            if ("VNPAY".equals(order.getPaymentMethod()) && !order.getIsPaid()) {
                try {
                    orderService.updateOrderStatus(order.getId(), "CANCELLED");
                    count++;
                } catch (Exception e) {
                    System.err.println("Lỗi khi hủy tự động đơn hàng ID " + order.getId() + ": " + e.getMessage());
                }
            }
        }
        System.out.println("[CRON JOB] Đã tự động hủy " + count + " đơn hàng VNPAY quá hạn 15 phút.");
    }
}
