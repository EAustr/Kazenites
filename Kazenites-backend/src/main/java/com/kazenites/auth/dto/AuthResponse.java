package com.kazenites.auth.dto;

public class AuthResponse {
    public String token;
    public Long userId;
    public String email;
    public String role;

    public AuthResponse(String token, Long userId, String email, String role) {
        this.token = token;
        this.userId = userId;
        this.email = email;
        this.role = role;
    }
}
