package com.accessories.shop.backend.service;

import com.accessories.shop.backend.entity.Address;
import com.accessories.shop.backend.entity.User;
import com.accessories.shop.backend.repository.AddressRepository;
import com.accessories.shop.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;
import com.accessories.shop.backend.exception.ResourceNotFoundException;

@Service
@RequiredArgsConstructor
public class AddressService {
    private final AddressRepository addressRepository;
    private final UserRepository userRepository;

    public List<Address> getUserAddresses(String email) {
        User user = userRepository.findByEmail(email).orElseThrow(() -> new ResourceNotFoundException("Người dùng không tồn tại"));
        return addressRepository.findByUserId(user.getId());
    }

    public Address addAddress(String email, Address addressRequest) {
        User user = userRepository.findByEmail(email).orElseThrow(() -> new ResourceNotFoundException("Người dùng không tồn tại"));
        
        // Nếu đây là địa chỉ mặc định, bỏ mặc định của các địa chỉ khác
        if (addressRequest.getIsDefault() != null && addressRequest.getIsDefault()) {
            addressRepository.findByUserIdAndIsDefaultTrue(user.getId()).ifPresent(oldDefault -> {
                oldDefault.setIsDefault(false);
                addressRepository.save(oldDefault);
            });
        }

        addressRequest.setUser(user);
        return addressRepository.save(addressRequest);
    }
}
