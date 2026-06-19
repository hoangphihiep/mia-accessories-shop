package com.accessories.shop.backend.controller;

import com.accessories.shop.backend.entity.Address;
import com.accessories.shop.backend.service.AddressService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/v1/addresses")
@RequiredArgsConstructor
public class AddressController {

    private final AddressService addressService;

    @GetMapping
    public ResponseEntity<List<Address>> getMyAddresses(Authentication authentication) {
        String email = authentication.getName();
        return ResponseEntity.ok(addressService.getUserAddresses(email));
    }

    @PostMapping
    public ResponseEntity<Address> addAddress(Authentication authentication, @RequestBody Address address) {
        String email = authentication.getName();
        return ResponseEntity.ok(addressService.addAddress(email, address));
    }
}
