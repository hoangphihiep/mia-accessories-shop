package com.accessories.shop.backend.service;

import com.accessories.shop.backend.dto.request.OrderRequest;
import com.accessories.shop.backend.dto.request.OrderItemRequest;
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
                .orElseThrow(() -> new com.accessories.shop.backend.exception.ResourceNotFoundException("Không tìm thấy người dùng đăng nhập"));

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
                    .orElseThrow(() -> new com.accessories.shop.backend.exception.ResourceNotFoundException("Không tìm thấy mẫu sản phẩm với ID: " + itemReq.getVariantId()));

            // Kiểm tra tồn kho
            if (variant.getStockQuantity() < itemReq.getQuantity()) {
                throw new com.accessories.shop.backend.exception.BadRequestException("Sản phẩm " + variant.getName() + " không đủ số lượng trong kho!");
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

    @Transactional
    public Order placePosOrder(OrderRequest request) {
        // POS order can be made by Staff or Admin
        String currentUserEmail = SecurityContextHolder.getContext().getAuthentication().getName();
        User staff = userRepository.findByEmail(currentUserEmail)
                .orElseThrow(() -> new com.accessories.shop.backend.exception.ResourceNotFoundException("Không tìm thấy người dùng đăng nhập"));

        // Xác định Khách hàng thực sự mua (dựa vào số điện thoại)
        User actualCustomer = staff; // Mặc định gán cho Staff nếu không tìm thấy (Khách vãng lai không có SĐT)
        if (request.getCustomerPhone() != null && !request.getCustomerPhone().isEmpty()) {
            java.util.Optional<User> foundCustomer = userRepository.findByPhone(request.getCustomerPhone());
            if (foundCustomer.isPresent()) {
                actualCustomer = foundCustomer.get();
            }
        }

        Order order = Order.builder()
                .user(actualCustomer) // Gán cho Khách hàng (để tính điểm CRM) hoặc Staff nếu là khách vãng lai
                .createdBy(staff) // Lưu vết Nhân viên thu ngân đứng máy POS
                .customerName(request.getCustomerName() != null && !request.getCustomerName().isEmpty() ? request.getCustomerName() : "Khách vãng lai")
                .customerPhone(request.getCustomerPhone() != null ? request.getCustomerPhone() : "")
                .shippingAddress("Mua trực tiếp tại quầy")
                .paymentMethod(request.getPaymentMethod() != null ? request.getPaymentMethod() : "CASH")
                .status("COMPLETED") // Tự động hoàn thành
                .isPaid(true) // Tự động đã thanh toán
                .orderDetails(new ArrayList<>())
                .build();

        BigDecimal totalAmount = BigDecimal.ZERO;

        for (OrderItemRequest itemReq : request.getItems()) {
            ProductVariant variant = productVariantRepository.findById(itemReq.getVariantId())
                    .orElseThrow(() -> new com.accessories.shop.backend.exception.ResourceNotFoundException("Không tìm thấy mẫu sản phẩm"));

            if (variant.getStockQuantity() < itemReq.getQuantity()) {
                throw new com.accessories.shop.backend.exception.BadRequestException("Sản phẩm " + variant.getName() + " không đủ số lượng trong kho!");
            }

            variant.setStockQuantity(variant.getStockQuantity() - itemReq.getQuantity());
            productVariantRepository.save(variant);

            BigDecimal itemTotal = variant.getPrice().multiply(BigDecimal.valueOf(itemReq.getQuantity()));
            totalAmount = totalAmount.add(itemTotal);

            OrderDetail orderDetail = OrderDetail.builder()
                    .order(order)
                    .productVariant(variant)
                    .quantity(itemReq.getQuantity())
                    .price(variant.getPrice())
                    .build();

            order.getOrderDetails().add(orderDetail);
        }

        order.setTotalAmount(totalAmount);
        return orderRepository.save(order);
    }

    public List<Order> getUserOrders(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new com.accessories.shop.backend.exception.ResourceNotFoundException("Không tìm thấy người dùng đăng nhập"));
        return orderRepository.findByUserId(user.getId());
    }

    public List<Order> trackOrdersByPhone(String phone) {
        return orderRepository.findByCustomerPhone(phone);
    }

    public List<Order> findAllOrders() {
        return orderRepository.findAll();
    }

    @Transactional
    public Order updateOrderStatus(Long orderId, String newStatus) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new com.accessories.shop.backend.exception.ResourceNotFoundException("Không tìm thấy đơn hàng với ID: " + orderId));
        order.setStatus(newStatus);
        
        // Nếu hủy đơn hàng, hoàn lại số lượng tồn kho
        if ("CANCELLED".equals(newStatus)) {
            for (OrderDetail detail : order.getOrderDetails()) {
                ProductVariant variant = detail.getProductVariant();
                variant.setStockQuantity(variant.getStockQuantity() + detail.getQuantity());
                productVariantRepository.save(variant);
            }
        }
        
        return orderRepository.save(order);
    }
}