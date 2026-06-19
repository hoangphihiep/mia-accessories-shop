package com.accessories.shop.backend.entity;

import jakarta.persistence.*;
import lombok.*;
import java.util.List;

@Entity
@Table(name = "roles")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Role {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 50)
    private String name; // Chứa giá trị: ROLE_ADMIN, ROLE_STAFF, ROLE_CUSTOMER

    // Một quyền sẽ có nhiều người dùng
    @OneToMany(mappedBy = "role", fetch = FetchType.LAZY)
    private List<User> users;
}