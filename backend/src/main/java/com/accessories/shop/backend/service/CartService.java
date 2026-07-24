package com.accessories.shop.backend.service;

import com.accessories.shop.backend.dto.request.CartItemRequest;
import com.accessories.shop.backend.dto.response.CartItemResponse;
import com.accessories.shop.backend.entity.Cart;
import com.accessories.shop.backend.entity.CartItem;
import com.accessories.shop.backend.entity.ProductVariant;
import com.accessories.shop.backend.entity.User;
import com.accessories.shop.backend.exception.BadRequestException;
import com.accessories.shop.backend.exception.ResourceNotFoundException;
import com.accessories.shop.backend.repository.CartItemRepository;
import com.accessories.shop.backend.repository.CartRepository;
import com.accessories.shop.backend.repository.ProductVariantRepository;
import com.accessories.shop.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CartService {

    private final CartRepository cartRepository;
    private final CartItemRepository cartItemRepository;
    private final ProductVariantRepository productVariantRepository;
    private final UserRepository userRepository;

    private User getCurrentUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }

    private Cart getOrCreateCart(User user) {
        return cartRepository.findByUserId(user.getId())
                .orElseGet(() -> cartRepository.save(Cart.builder().user(user).items(new ArrayList<>()).build()));
    }

    @Transactional
    public List<CartItemResponse> getCart() {
        User user = getCurrentUser();
        Cart cart = getOrCreateCart(user);
        
        return cart.getItems().stream().map(item -> {
            ProductVariant variant = item.getProductVariant();
            String variantName = variant.getName();
            if (variantName == null) variantName = "";
            
            String image = variant.getImageUrl();
            if (image == null && variant.getProduct().getImages() != null && !variant.getProduct().getImages().isEmpty()) {
                image = variant.getProduct().getImages().iterator().next().getImageUrl();
            }

            return CartItemResponse.builder()
                    .id(item.getId())
                    .variantId(variant.getId())
                    .productId(variant.getProduct().getId())
                    .name(variant.getProduct().getName())
                    .variantName(variantName.isEmpty() ? variant.getProduct().getName() : variantName)
                    .price(variant.getPrice())
                    .image(image)
                    .quantity(item.getQuantity())
                    .stockQuantity(variant.getStockQuantity())
                    .build();
        }).collect(Collectors.toList());
    }

    @Transactional
    public List<CartItemResponse> addToCart(CartItemRequest request) {
        User user = getCurrentUser();
        Cart cart = getOrCreateCart(user);
        
        ProductVariant variant = productVariantRepository.findById(request.getVariantId())
                .orElseThrow(() -> new ResourceNotFoundException("Variant not found"));

        Optional<CartItem> existingItem = cartItemRepository.findByCartIdAndProductVariantId(cart.getId(), variant.getId());

        if (existingItem.isPresent()) {
            CartItem item = existingItem.get();
            int newQuantity = item.getQuantity() + request.getQuantity();
            if (newQuantity > variant.getStockQuantity()) {
                newQuantity = variant.getStockQuantity();
            }
            item.setQuantity(newQuantity);
            cartItemRepository.save(item);
        } else {
            int initialQuantity = request.getQuantity() > variant.getStockQuantity() ? variant.getStockQuantity() : request.getQuantity();
            if (initialQuantity > 0) {
                CartItem newItem = CartItem.builder()
                        .cart(cart)
                        .productVariant(variant)
                        .quantity(initialQuantity)
                        .build();
                cartItemRepository.save(newItem);
            }
        }
        
        return getCart();
    }

    @Transactional
    public List<CartItemResponse> updateQuantity(Long variantId, Integer quantity) {
        User user = getCurrentUser();
        Cart cart = getOrCreateCart(user);

        CartItem item = cartItemRepository.findByCartIdAndProductVariantId(cart.getId(), variantId)
                .orElseThrow(() -> new ResourceNotFoundException("Item not found in cart"));

        if (quantity <= 0) {
            cart.getItems().remove(item);
            cartItemRepository.delete(item);
        } else {
            int finalQuantity = quantity > item.getProductVariant().getStockQuantity() ? item.getProductVariant().getStockQuantity() : quantity;
            item.setQuantity(finalQuantity);
            cartItemRepository.save(item);
        }

        return getCart();
    }

    @Transactional
    public List<CartItemResponse> removeFromCart(Long variantId) {
        User user = getCurrentUser();
        Cart cart = getOrCreateCart(user);

        CartItem item = cartItemRepository.findByCartIdAndProductVariantId(cart.getId(), variantId)
                .orElseThrow(() -> new ResourceNotFoundException("Item not found in cart"));

        cart.getItems().remove(item);
        cartItemRepository.delete(item);

        return getCart();
    }

    @Transactional
    public List<CartItemResponse> mergeCart(List<CartItemRequest> localItems) {
        User user = getCurrentUser();
        Cart cart = getOrCreateCart(user);

        for (CartItemRequest req : localItems) {
            ProductVariant variant = productVariantRepository.findById(req.getVariantId()).orElse(null);
            if (variant != null && variant.getStockQuantity() > 0) {
                Optional<CartItem> existingItem = cartItemRepository.findByCartIdAndProductVariantId(cart.getId(), variant.getId());
                
                if (existingItem.isPresent()) {
                    CartItem item = existingItem.get();
                    int newQuantity = item.getQuantity() + req.getQuantity();
                    if (newQuantity > variant.getStockQuantity()) {
                        newQuantity = variant.getStockQuantity();
                    }
                    item.setQuantity(newQuantity);
                    cartItemRepository.save(item);
                } else {
                    int initialQuantity = req.getQuantity() > variant.getStockQuantity() ? variant.getStockQuantity() : req.getQuantity();
                    CartItem newItem = CartItem.builder()
                            .cart(cart)
                            .productVariant(variant)
                            .quantity(initialQuantity)
                            .build();
                    cartItemRepository.save(newItem);
                }
            }
        }

        return getCart();
    }
    
    @Transactional
    public void clearCart() {
        User user = getCurrentUser();
        Cart cart = getOrCreateCart(user);
        cartItemRepository.deleteAll(cart.getItems());
        cart.getItems().clear();
    }
}
