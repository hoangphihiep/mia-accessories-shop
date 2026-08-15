package com.accessories.shop.backend.service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class EmailService {

    private final JavaMailSender mailSender;

    public void sendPasswordResetEmail(String to, String resetUrl) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setTo(to);
            helper.setSubject("Khôi phục mật khẩu tài khoản MIA Accessories");

            String htmlContent = "<div style='font-family: Arial, sans-serif; padding: 20px; color: #333; max-width: 600px; margin: 0 auto;'>"
                    + "<h2 style='color: #000; text-align: center; text-transform: uppercase;'>Yêu cầu khôi phục mật khẩu</h2>"
                    + "<p>Chào bạn,</p>"
                    + "<p>Chúng tôi nhận được yêu cầu khôi phục mật khẩu cho tài khoản liên kết với email này.</p>"
                    + "<p>Vui lòng click vào nút bên dưới để đặt lại mật khẩu của bạn (Link sẽ hết hạn sau 1 giờ):</p>"
                    + "<div style='text-align: center; margin: 30px 0;'>"
                    + "<a href='" + resetUrl + "' style='background-color: #000; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;'>ĐẶT LẠI MẬT KHẨU</a>"
                    + "</div>"
                    + "<p>Nếu bạn không gửi yêu cầu này, vui lòng bỏ qua email này.</p>"
                    + "<p>Trân trọng,<br/><strong>MIA Accessories Team</strong></p>"
                    + "</div>";

            helper.setText(htmlContent, true);

            mailSender.send(message);
        } catch (MessagingException e) {
            log.error("Failed to send email to {}", to, e);
            throw new RuntimeException("Lỗi hệ thống khi gửi email khôi phục mật khẩu.", e);
        }
    }
}
