package com.accessories.shop.backend.controller;

import com.accessories.shop.backend.service.VNPayService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/payments")
@RequiredArgsConstructor
public class PaymentController {

    private final VNPayService vnPayService;

    @PostMapping("/create-vnpay")
    public ResponseEntity<?> createVNPayPayment(
            @RequestBody Map<String, Object> payload,
            HttpServletRequest request) {
        
        Long orderId = Long.valueOf(payload.get("orderId").toString());
        long amount = Long.parseLong(payload.get("amount").toString());
        String bankCode = payload.containsKey("bankCode") ? payload.get("bankCode").toString() : null;
        
        String ipAddress = request.getHeader("X-FORWARDED-FOR");
        if (ipAddress == null) {
            ipAddress = request.getRemoteAddr();
        }

        String paymentUrl = vnPayService.createPaymentUrl(orderId, amount, bankCode, ipAddress);
        return ResponseEntity.ok(Map.of("paymentUrl", paymentUrl));
    }
}
