package com.accessories.shop.backend.controller;

import com.accessories.shop.backend.service.VNPayService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

import com.accessories.shop.backend.service.OrderService;
import java.util.HashMap;

@RestController
@RequestMapping("/api/v1/payments")
@RequiredArgsConstructor
public class PaymentController {

    private final VNPayService vnPayService;
    private final OrderService orderService;

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

    @GetMapping("/vnpay-return")
    public ResponseEntity<?> vnpayReturn(@RequestParam Map<String, String> allParams) {
        try {
            // Create a mutable copy of params because Spring's map might be immutable
            Map<String, String> params = new HashMap<>(allParams);
            
            boolean isValidSignature = vnPayService.verifySignature(params);
            
            if (!isValidSignature) {
                return ResponseEntity.badRequest().body(Map.of("status", "error", "message", "Invalid signature"));
            }

            String responseCode = params.get("vnp_ResponseCode");
            String txnRef = params.get("vnp_TxnRef"); // format: orderId-timestamp
            Long orderId = Long.valueOf(txnRef.split("-")[0]);

            if ("00".equals(responseCode)) {
                // Payment success
                orderService.updatePaymentStatus(orderId, true);
                return ResponseEntity.ok(Map.of("status", "success", "message", "Payment completed"));
            } else {
                // Payment failed
                return ResponseEntity.ok(Map.of("status", "failed", "message", "Payment failed"));
            }
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().body(Map.of("status", "error", "message", e.getMessage()));
        }
    }

    @GetMapping("/vnpay-ipn")
    public ResponseEntity<?> vnpayIpn(@RequestParam Map<String, String> allParams) {
        try {
            Map<String, String> params = new HashMap<>(allParams);
            boolean isValidSignature = vnPayService.verifySignature(params);
            
            if (!isValidSignature) {
                return ResponseEntity.ok(Map.of("RspCode", "97", "Message", "Invalid signature"));
            }

            String responseCode = params.get("vnp_ResponseCode");
            String txnRef = params.get("vnp_TxnRef");
            Long orderId = Long.valueOf(txnRef.split("-")[0]);

            if ("00".equals(responseCode)) {
                // Payment success - VNPAY calls this quietly in the background
                orderService.updatePaymentStatus(orderId, true);
                return ResponseEntity.ok(Map.of("RspCode", "00", "Message", "Confirm Success"));
            } else {
                // Payment failed
                return ResponseEntity.ok(Map.of("RspCode", "02", "Message", "Order already confirmed or failed"));
            }
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.ok(Map.of("RspCode", "99", "Message", "Unknown error"));
        }
    }
}
