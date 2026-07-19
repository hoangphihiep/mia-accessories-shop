package com.accessories.shop.backend.controller;

import com.accessories.shop.backend.dto.request.AddressRequest;
import com.accessories.shop.backend.dto.response.AddressResponse;
import com.accessories.shop.backend.entity.Address;
import com.accessories.shop.backend.mapper.AddressMapper;
import com.accessories.shop.backend.service.AddressService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/addresses")
@RequiredArgsConstructor
public class AddressController {

    private final AddressService addressService;
    private final AddressMapper addressMapper;

    @GetMapping
    public ResponseEntity<List<AddressResponse>> getMyAddresses(Authentication authentication) {
        String email = authentication.getName();
        List<AddressResponse> responses = addressService.getUserAddresses(email).stream()
                .map(addressMapper::toResponse)
                .collect(Collectors.toList());
        return ResponseEntity.ok(responses);
    }

    @PostMapping
    public ResponseEntity<AddressResponse> addAddress(Authentication authentication, @RequestBody AddressRequest request) {
        String email = authentication.getName();
        
        Address address = Address.builder()
                .receiverName(request.getReceiverName())
                .phone(request.getPhone())
                .streetAddress(request.getStreetAddress())
                .city(request.getCity())
                .district(request.getDistrict())
                .ward(request.getWard())
                .isDefault(request.getIsDefault())
                .build();
                
        Address savedAddress = addressService.addAddress(email, address);
        return ResponseEntity.ok(addressMapper.toResponse(savedAddress));
    }
}
