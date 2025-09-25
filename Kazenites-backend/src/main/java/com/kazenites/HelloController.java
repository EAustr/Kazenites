package com.kazenites;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class HelloController {

    @GetMapping("/")
    public String home() {
        return "Sveiks, Kazenites projekts strādā! 🚀";
    }
}
