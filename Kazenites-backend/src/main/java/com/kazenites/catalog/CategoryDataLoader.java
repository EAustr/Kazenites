package com.kazenites.catalog;

import java.util.List;

import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class CategoryDataLoader {

    @Bean
    CommandLineRunner seedCategories(CategoryRepository repo) {
        return args -> {
            if (repo.count() == 0) {
                repo.saveAll(List.of(
                    new Category("Zemenes", "strawberries"),
                    new Category("Mellenes", "blueberries"),
                    new Category("Avenes", "raspberries"),
                    new Category("Kazenes", "blackberries")
                ));
            }
        };
    }
}
