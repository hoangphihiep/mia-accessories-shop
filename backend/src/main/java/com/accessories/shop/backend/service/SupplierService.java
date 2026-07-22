package com.accessories.shop.backend.service;

import com.accessories.shop.backend.entity.Supplier;
import com.accessories.shop.backend.exception.ResourceNotFoundException;
import com.accessories.shop.backend.repository.SupplierRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.security.core.context.SecurityContextHolder;
import com.accessories.shop.backend.exception.BadRequestException;
import com.accessories.shop.backend.repository.UserRepository;
import com.accessories.shop.backend.entity.User;
import com.accessories.shop.backend.entity.SupplierPayment;
import com.accessories.shop.backend.repository.SupplierPaymentRepository;
import com.accessories.shop.backend.dto.request.SupplierPaymentRequest;
import com.accessories.shop.backend.dto.response.SupplierPaymentResponse;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SupplierService {

    private final SupplierRepository supplierRepository;
    private final SupplierPaymentRepository supplierPaymentRepository;
    private final UserRepository userRepository;

    public List<Supplier> getAllSuppliers() {
        return supplierRepository.findAll();
    }

    public Supplier createSupplier(Supplier supplier) {
        return supplierRepository.save(supplier);
    }

    public Supplier updateSupplier(Long id, Supplier supplierDetails) {
        Supplier supplier = supplierRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy nhà cung cấp"));
        
        supplier.setName(supplierDetails.getName());
        supplier.setPhone(supplierDetails.getPhone());
        supplier.setEmail(supplierDetails.getEmail());
        supplier.setAddress(supplierDetails.getAddress());
        
        return supplierRepository.save(supplier);
    }

    public void deleteSupplier(Long id) {
        try {
            supplierRepository.deleteById(id);
        } catch (DataIntegrityViolationException e) {
            throw new BadRequestException("Không thể xóa nhà cung cấp do đã có phiếu nhập liên quan");
        }
    }

    public List<SupplierPaymentResponse> getPaymentsBySupplierId(Long supplierId) {
        return supplierPaymentRepository.findBySupplierIdOrderByCreatedAtDesc(supplierId).stream()
                .map(payment -> SupplierPaymentResponse.builder()
                        .id(payment.getId())
                        .supplierId(payment.getSupplier().getId())
                        .createdBy(payment.getCreatedBy() != null ? payment.getCreatedBy().getFullName() : "Hệ thống")
                        .amount(payment.getAmount())
                        .note(payment.getNote())
                        .createdAt(payment.getCreatedAt())
                        .build())
                .collect(Collectors.toList());
    }

    @Transactional
    public SupplierPaymentResponse payDebt(Long supplierId, SupplierPaymentRequest request) {
        Supplier supplier = supplierRepository.findById(supplierId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy nhà cung cấp"));

        if (supplier.getDebt().compareTo(request.getAmount()) < 0) {
            throw new BadRequestException("Số tiền trả không được lớn hơn số công nợ hiện tại (" + supplier.getDebt() + ")");
        }

        String currentUserEmail = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmail(currentUserEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy người dùng"));

        // Giảm nợ
        supplier.setDebt(supplier.getDebt().subtract(request.getAmount()));
        supplierRepository.save(supplier);

        // Lưu lịch sử
        SupplierPayment payment = SupplierPayment.builder()
                .supplier(supplier)
                .createdBy(user)
                .amount(request.getAmount())
                .note(request.getNote())
                .build();
        SupplierPayment savedPayment = supplierPaymentRepository.save(payment);

        return SupplierPaymentResponse.builder()
                .id(savedPayment.getId())
                .supplierId(supplier.getId())
                .createdBy(user.getFullName())
                .amount(savedPayment.getAmount())
                .note(savedPayment.getNote())
                .createdAt(savedPayment.getCreatedAt())
                .build();
    }
}
