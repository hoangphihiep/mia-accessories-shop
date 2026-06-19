package com.accessories.shop.backend.service;

import com.accessories.shop.backend.dto.OrderRequest;
import com.accessories.shop.backend.dto.OrderItemRequest;
import com.accessories.shop.backend.entity.Order;
import com.accessories.shop.backend.entity.OrderDetail;
import com.accessories.shop.backend.entity.ProductVariant;
import com.accessories.shop.backend.entity.User;
import com.accessories.shop.backend.repository.OrderRepository;
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
public class OrderService {

    private final OrderRepository orderRepository;
    private final ProductVariantRepository productVariantRepository;
    private final UserRepository userRepository;

    // Dùng @Transactional để lỡ đang lưu đơn hàng mà bị lỗi thì nó hoàn tác (rollback) lại toàn bộ, không bị trừ hụt kho
    @Transactional
    public Order placeOrder(OrderRequest request) {
        // 1. Lấy Email của người đang đăng nhập từ Security Context
        String currentUserEmail = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmail(currentUserEmail)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng đăng nhập"));

        // 2. Khởi tạo Đơn hàng (Order)
        Order order = Order.builder()
                .user(user)
                .customerName(request.getCustomerName())
                .customerPhone(request.getCustomerPhone())
                .shippingAddress(request.getShippingAddress())
                .paymentMethod(request.getPaymentMethod())
                .status("PENDING") // Trạng thái mặc định là Chờ xác nhận
                .isPaid(false)
                .orderDetails(new ArrayList<>())
                .build();

        BigDecimal totalAmount = BigDecimal.ZERO;

        // 3. Xử lý từng món hàng trong giỏ
        for (OrderItemRequest itemReq : request.getItems()) {
            ProductVariant variant = productVariantRepository.findById(itemReq.getVariantId())
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy mẫu sản phẩm với ID: " + itemReq.getVariantId()));

            // Kiểm tra tồn kho
            if (variant.getStockQuantity() < itemReq.getQuantity()) {
                throw new RuntimeException("Sản phẩm " + variant.getName() + " không đủ số lượng trong kho!");
            }

            // Trừ tồn kho
            variant.setStockQuantity(variant.getStockQuantity() - itemReq.getQuantity());
            productVariantRepository.save(variant);

            // Tính tiền
            BigDecimal itemTotal = variant.getPrice().multiply(BigDecimal.valueOf(itemReq.getQuantity()));
            totalAmount = totalAmount.add(itemTotal);

            // Tạo Chi tiết đơn hàng
            OrderDetail orderDetail = OrderDetail.builder()
                    .order(order)
                    .productVariant(variant)
                    .quantity(itemReq.getQuantity())
                    .price(variant.getPrice()) // Lưu cứng giá bán hiện tại
                    .build();

            order.getOrderDetails().add(orderDetail);
        }

        order.setTotalAmount(totalAmount);

        // 4. Lưu đơn hàng (CascadeType.ALL sẽ tự động lưu luôn các OrderDetail bên trong)
        return orderRepository.save(order);
    }

    public List<Order> getUserOrders(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng đăng nhập"));
        return orderRepository.findByUserId(user.getId());
    }
}