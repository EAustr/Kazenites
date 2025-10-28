package com.kazenites.user;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import com.kazenites.security.UserPrincipal;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserRepository userRepository;

    @Value("${app.upload.dir:uploads}")
    private String uploadDir;

    public UserController(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @GetMapping("/profile")
    public User getProfile(@AuthenticationPrincipal UserPrincipal userPrincipal) {
        return userRepository.findById(userPrincipal.getUser().getId())
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    @GetMapping("/{id}")
    public User getUserById(@PathVariable Long id) {
        return userRepository.findById(id)
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
        user.setPhoneNumber(request.getPhoneNumber());

        return userRepository.save(user);
    }

    @PostMapping(value = "/profile/avatar", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public User uploadAvatar(@AuthenticationPrincipal UserPrincipal userPrincipal,
            @RequestParam("file") MultipartFile file) throws IOException {
        if (file == null || file.isEmpty()) {
            throw new RuntimeException("No file uploaded");
        }

        User user = userRepository.findById(userPrincipal.getUser().getId())
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Prepare directories: uploads/avatars/{userId}
        Path base = Paths.get(uploadDir);
        Path userDir = base.resolve("avatars").resolve(String.valueOf(user.getId()));
        Files.createDirectories(userDir);

        // Generate file name with timestamp to bust caches
        String original = file.getOriginalFilename();
        String ext = "";
        if (original != null) {
            int idx = original.lastIndexOf('.');
            if (idx > -1)
                ext = original.substring(idx);
        }
        String filename = "avatar_" + System.currentTimeMillis() + ext;
        Path dest = userDir.resolve(filename);

        // Save file
        Files.copy(file.getInputStream(), dest, StandardCopyOption.REPLACE_EXISTING);

        // Store relative path exposed by WebConfig: /uploads/**
        String relative = "/uploads/avatars/" + user.getId() + "/" + filename;
        user.setAvatarPath(relative);
        return userRepository.save(user);
    }

    public static class UpdateProfileRequest {
        private String name;
        private String surname;
        private String city;
        private String phoneNumber;

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

        public String getPhoneNumber() {
            return phoneNumber;
        }

        public void setPhoneNumber(String phoneNumber) {
            this.phoneNumber = phoneNumber;
        }
    }
}