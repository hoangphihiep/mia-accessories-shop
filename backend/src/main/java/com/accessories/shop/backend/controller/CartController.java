package com.accessories.shop.backend.controller;

import com.accessories.shop.backend.dto.request.CartItemRequest;
import com.accessories.shop.backend.dto.response.CartItemResponse;
import com.accessories.shop.backend.service.CartService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/cart")
@RequiredArgsConstructor
public class CartController {

    private final CartService cartService;

    @GetMapping
    public ResponseEntity<List<CartItemResponse>> getCart() {
        return ResponseEntity.ok(cartService.getCart());
    }

    @PostMapping("/add")
    public ResponseEntity<List<CartItemResponse>> addToCart(@RequestBody CartItemRequest request) {
        return ResponseEntity.ok(cartService.addToCart(request));
    }

    @PutMapping("/update/{variantId}")
    public ResponseEntity<List<CartItemResponse>> updateQuantity(@PathVariable Long variantId, @RequestParam Integer quantity) {
        return ResponseEntity.ok(cartService.updateQuantity(variantId, quantity));
    }

    @DeleteMapping("/remove/{variantId}")
    public ResponseEntity<List<CartItemResponse>> removeFromCart(@PathVariable Long variantId) {
        return ResponseEntity.ok(cartService.removeFromCart(variantId));
    }

    @PostMapping("/merge")
    public ResponseEntity<List<CartItemResponse>> mergeCart(@RequestBody List<CartItemRequest> localItems) {
        return ResponseEntity.ok(cartService.mergeCart(localItems));
    }

    @DeleteMapping("/clear")
    public ResponseEntity<?> clearCart() {
        cartService.clearCart();
        return ResponseEntity.ok().build();
    }
}
