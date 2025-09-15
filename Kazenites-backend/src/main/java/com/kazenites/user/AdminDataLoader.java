package com.kazenites.user;

import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
public class AdminDataLoader {

    @Bean
    @ConditionalOnProperty(name = "app.seed.admin", havingValue = "true", matchIfMissing = true)
    CommandLineRunner seedAdmin(UserRepository repo, PasswordEncoder encoder) {
        return args -> {
            repo.findByEmail("admin@kazenites.local").map(existing -> {
                boolean changed = false;
                if (existing.getPasswordHash() == null || existing.getPasswordHash().isBlank()) {
                    existing.setPasswordHash(encoder.encode("admin123"));
                    changed = true;
                }
                if (existing.getRole() != Role.ADMIN) {
                    existing.setRole(Role.ADMIN);
                    changed = true;
                }
                if (existing.getName() == null || existing.getName().isBlank()) {
                    existing.setName("Admin");
                    changed = true;
                }
                if (existing.getCity() == null) {
                    existing.setCity("Rīga");
                    changed = true;
                }
                return changed ? repo.save(existing) : existing;
            }).orElseGet(() -> {
                User admin = new User();
                admin.setEmail("admin@kazenites.local");
                admin.setName("Admin");
                admin.setCity("Rīga");
                admin.setRole(Role.ADMIN);
                admin.setPasswordHash(encoder.encode("admin123"));
                return repo.save(admin);
            });
        };
    }
}
