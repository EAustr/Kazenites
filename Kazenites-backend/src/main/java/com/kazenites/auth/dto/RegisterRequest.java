package com.kazenites.auth.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public class RegisterRequest {
    @NotBlank(message = "Email is required")
    @Email(message = "Invalid email format")
    public String email;

    @NotBlank(message = "Password is required")
    @Size(min = 8, max = 100, message = "Password must be at least 8 characters")
    @Pattern(
        regexp = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)\\S+$",
        message = "Password must include upper, lower, number, and no spaces"
    )
    public String password;

    @NotBlank(message = "Name is required")
    @Size(min = 2, max = 100, message = "Name must be at least 2 characters")
    @Pattern(
        regexp = "^(?=.*[\\p{L}])[\\p{L}\\p{M} .'-]+$",
        message = "Name must contain letters and only letters/spaces/.'-"
    )
    public String name;

    @Size(max = 100, message = "City must be under 100 characters")
    @Pattern(
        regexp = "^[\\p{L}\\p{M} .'-]*$",
        message = "City may only contain letters/spaces/.'-"
    )
    public String city;
}
