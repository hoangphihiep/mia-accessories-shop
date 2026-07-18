package com.accessories.shop.backend.service;

import org.springframework.stereotype.Service;

@Service
public class EmailService {

    public void sendPasswordResetEmail(String to, String resetUrl) {
        // MOCK EMAIL SENDER
        System.out.println("=========================================");
        System.out.println("MOCK EMAIL SENDER - DO NOT USE IN PROD");
        System.out.println("To: " + to);
        System.out.println("Subject: Khôi phục mật khẩu tài khoản MIA Accessories");
        System.out.println("Body: Vui lòng click vào link sau để đặt lại mật khẩu: " + resetUrl);
        System.out.println("=========================================");
    }
}
