package com.lostandfound.config;

import com.lostandfound.model.Category;
import com.lostandfound.model.Role;
import com.lostandfound.model.User;
import com.lostandfound.repository.CategoryRepository;
import com.lostandfound.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class DataSeeder implements CommandLineRunner {

    private final CategoryRepository categoryRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public DataSeeder(CategoryRepository categoryRepository,
                      UserRepository userRepository,
                      PasswordEncoder passwordEncoder) {
        this.categoryRepository = categoryRepository;
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) throws Exception {
        // Seed default categories if empty
        if (categoryRepository.count() == 0) {
            List<String> categories = List.of(
                    "Accessories",
                    "ID Cards & Documents",
                    "Phones & Tablets",
                    "Laptops & Electronics",
                    "Bags & Backpacks",
                    "Textbooks & Notebooks",
                    "Keys",
                    "Clothing",
                    "Other"
            );

            for (String cat : categories) {
                categoryRepository.save(Category.builder().name(cat).build());
            }
        }

        // Seed default Admin user if no admin exists
        if (!userRepository.existsByEmail("admin@campus.edu")) {
            User admin = User.builder()
                    .name("Main Gate Lost & Found Office")
                    .email("admin@campus.edu")
                    .password(passwordEncoder.encode("admin123"))
                    .role(Role.ADMIN)
                    .build();
            userRepository.save(admin);
        }
    }
}
