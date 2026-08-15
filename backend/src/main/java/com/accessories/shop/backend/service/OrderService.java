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
import com.accessories.shop.backend.exception.ResourceNotFoundException;
import com.accessories.shop.backend.exception.BadRequestException;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.cache.annotation.CacheEvict;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class OrderService {

    private final OrderRepository orderRepository;
    private final ProductVariantRepository productVariantRepository;
    private final UserRepository userRepository;
    private final com.accessories.shop.backend.repository.SiteSettingRepository siteSettingRepository;

    private BigDecimal processOrderItem(OrderItemRequest itemReq, Order order) {
        ProductVariant variant = productVariantRepository.findById(itemReq.getVariantId())
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy mẫu sản phẩm với ID: " + itemReq.getVariantId()));

        double displayStock = variant.getDisplayQuantity() != null ? variant.getDisplayQuantity() : variant.getStockQuantity();
        if (itemReq.getQuantity() > displayStock) {
            throw new BadRequestException("Sản phẩm " + variant.getName() + " chỉ còn tối đa " + displayStock + " trên cửa hàng!");
        }

        int updated = productVariantRepository.decreaseStock(itemReq.getVariantId(), itemReq.getQuantity());
        if (updated == 0) {
            throw new BadRequestException("Sản phẩm " + variant.getName() + " đã hết hàng trong kho thực tế!");
        }

        OrderDetail orderDetail = OrderDetail.builder()
                .order(order)
                .productVariant(variant)
                .quantity(itemReq.getQuantity())
                .price(variant.getPrice())
                .unitCost(variant.getCostPrice() != null ? variant.getCostPrice() : BigDecimal.ZERO)
                .build();

        order.getOrderDetails().add(orderDetail);

        return variant.getPrice().multiply(BigDecimal.valueOf(itemReq.getQuantity()));
    }

    // Dùng @Transactional để lỡ đang lưu đơn hàng mà bị lỗi thì nó hoàn tác (rollback) lại toàn bộ, không bị trừ hụt kho
    @Transactional
    @CacheEvict(value = "products", allEntries = true)
    public Order placeOrder(OrderRequest request) {
        // 1. Lấy Email của người đang đăng nhập từ Security Context
        String currentUserEmail = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmail(currentUserEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy người dùng đăng nhập"));

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
            BigDecimal itemTotal = processOrderItem(itemReq, order);
            totalAmount = totalAmount.add(itemTotal);
        }

        BigDecimal defaultShippingFee = siteSettingRepository.findById("SHIPPING_FEE_DEFAULT")
                .map(s -> new BigDecimal(s.getSettingValue()))
                .orElse(BigDecimal.valueOf(30000));
                
        BigDecimal freeShippingThreshold = siteSettingRepository.findById("FREE_SHIPPING_THRESHOLD")
                .map(s -> new BigDecimal(s.getSettingValue()))
                .orElse(BigDecimal.valueOf(500000));

        BigDecimal shippingFee;
        if (totalAmount.compareTo(freeShippingThreshold) >= 0) {
            shippingFee = BigDecimal.ZERO;
        } else {
            shippingFee = defaultShippingFee;
        }

        order.setShippingFee(shippingFee);
        order.setTotalAmount(totalAmount.add(shippingFee));

        // 4. Lưu đơn hàng (CascadeType.ALL sẽ tự động lưu luôn các OrderDetail bên trong)
        return orderRepository.save(order);
    }

    @Transactional
    @CacheEvict(value = "products", allEntries = true)
    public Order placePosOrder(OrderRequest request) {
        // POS order can be made by Staff or Admin
        String currentUserEmail = SecurityContextHolder.getContext().getAuthentication().getName();
        User staff = userRepository.findByEmail(currentUserEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy người dùng đăng nhập"));

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
            BigDecimal itemTotal = processOrderItem(itemReq, order);
            totalAmount = totalAmount.add(itemTotal);
        }

        order.setShippingFee(BigDecimal.ZERO);
        order.setTotalAmount(totalAmount);
        return orderRepository.save(order);
    }

    public List<Order> getUserOrders(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy người dùng đăng nhập"));
        return orderRepository.findByUserId(user.getId());
    }

    public List<Order> trackOrdersByPhone(String phone) {
        return orderRepository.findByCustomerPhone(phone);
    }

    @Transactional
    public Order cancelOrder(String email, Long orderId) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Người dùng không tồn tại"));

        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Đơn hàng không tồn tại"));

        if (!order.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Bạn không có quyền hủy đơn hàng này");
        }

        if (!"PENDING".equalsIgnoreCase(order.getStatus())) {
            throw new BadRequestException("Chỉ có thể hủy đơn hàng ở trạng thái Chờ xác nhận");
        }

        order.setStatus("CANCELLED");

        // Hoàn lại số lượng tồn kho (Nếu hệ thống có trừ tồn kho khi đặt)
        // Vì hiện tại chưa thấy logic trừ tồn kho trong placeOrder nên tạm thời chỉ set Status
        
        return orderRepository.save(order);
    }

    public List<Order> findAllOrders() {
        return orderRepository.findAll();
    }

    @Transactional
    @CacheEvict(value = "products", allEntries = true)
    public Order updateOrderStatus(Long orderId, String newStatus, String expectedDateStr, String trackingCode) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy đơn hàng với ID: " + orderId));
        
        String currentStatus = order.getStatus();

        // Kiểm tra State Machine
        switch (newStatus) {
            case "CANCELLED" -> {
                if (!currentStatus.equals("PENDING") && !currentStatus.equals("PROCESSING")) {
                    throw new BadRequestException("Chỉ có thể hủy đơn hàng khi đang chờ xử lý hoặc đang sản xuất.");
                }
                // Hoàn lại số lượng tồn kho an toàn (Atomic)
                for (OrderDetail detail : order.getOrderDetails()) {
                    productVariantRepository.increaseStock(detail.getProductVariant().getId(), detail.getQuantity());
                }
            }
            case "PROCESSING" -> {
                if (!currentStatus.equals("PENDING")) {
                    throw new BadRequestException("Chỉ có thể chuyển sang sản xuất từ trạng thái chờ xử lý.");
                }
                if (expectedDateStr != null && !expectedDateStr.trim().isEmpty()) {
                    order.setExpectedCompletionDate(LocalDate.parse(expectedDateStr));
                }
            }
            case "SHIPPING" -> {
                if (!currentStatus.equals("PENDING") && !currentStatus.equals("PROCESSING")) {
                    throw new BadRequestException("Chỉ có thể chuyển sang giao hàng từ trạng thái chờ xử lý hoặc đang sản xuất.");
                }
                if (expectedDateStr != null && !expectedDateStr.trim().isEmpty()) {
                    order.setExpectedDeliveryDate(LocalDate.parse(expectedDateStr));
                }
                if (trackingCode != null && !trackingCode.trim().isEmpty()) {
                    order.setTrackingCode(trackingCode.trim());
                }
            }
            case "COMPLETED" -> {
                if (!currentStatus.equals("SHIPPING")) {
                    throw new BadRequestException("Chỉ có thể hoàn thành đơn hàng đang giao.");
                }
                // Tự động cập nhật đã thanh toán khi giao hàng thành công (dành cho COD)
                order.setIsPaid(true);
            }
            default -> throw new BadRequestException("Trạng thái không hợp lệ: " + newStatus);
        }

        order.setStatus(newStatus);
        return orderRepository.save(order);
    }

    @Transactional
    public void updatePaymentStatus(Long orderId, boolean isPaid) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy đơn hàng với ID: " + orderId));
        order.setIsPaid(isPaid);
        orderRepository.save(order);
    }
}