package com.kazenites.user;

import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import com.kazenites.security.UserPrincipal;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserRepository userRepository;

    public UserController(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @GetMapping("/profile")
    public User getProfile(@AuthenticationPrincipal UserPrincipal userPrincipal) {
        return userRepository.findById(userPrincipal.getUser().getId())
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    @PutMapping("/profile")
    public User updateProfile(@AuthenticationPrincipal UserPrincipal userPrincipal,
            @RequestBody UpdateProfileRequest request) {
        User user = userRepository.findById(userPrincipal.getUser().getId())
                .orElseThrow(() -> new RuntimeException("User not found"));

        user.setName(request.getName());
        user.setSurname(request.getSurname());
        user.setCity(request.getCity());

        return userRepository.save(user);
    }

    public static class UpdateProfileRequest {
        private String name;
        private String surname;
        private String city;

        // Getters and setters
        public String getName() {
            return name;
        }

        public void setName(String name) {
            this.name = name;
        }

        public String getSurname() {
            return surname;
        }

        public void setSurname(String surname) {
            this.surname = surname;
        }

        public String getCity() {
            return city;
        }

        public void setCity(String city) {
            this.city = city;
        }
    }
}