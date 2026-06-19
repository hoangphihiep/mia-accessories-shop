package com.accessories.shop.backend.entity;

import jakarta.persistence.*;
import lombok.*;
import java.util.List;

@Entity
@Table(name = "materials")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Material {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 100)
    private String name;

    @Column(nullable = false, unique = true, length = 100)
    private String slug;

    @OneToMany(mappedBy = "material", fetch = FetchType.LAZY)
    @com.fasterxml.jackson.annotation.JsonIgnoreProperties({"material", "hibernateLazyInitializer", "handler"})
    private List<Product> products;
}