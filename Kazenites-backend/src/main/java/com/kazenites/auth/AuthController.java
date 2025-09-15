package com.kazenites.auth;

import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.kazenites.auth.dto.AuthResponse;
import com.kazenites.auth.dto.LoginRequest;
import com.kazenites.auth.dto.RegisterRequest;
import com.kazenites.security.JwtService;
import com.kazenites.security.UserPrincipal;
import com.kazenites.user.Role;
import com.kazenites.user.User;
import com.kazenites.user.UserRepository;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authManager;

    public AuthController(UserRepository userRepository, PasswordEncoder passwordEncoder, JwtService jwtService,
            AuthenticationManager authManager) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.authManager = authManager;
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterRequest req) {
        if (req.email == null || req.password == null || req.name == null) {
            return ResponseEntity.badRequest().body("Missing fields");
        }
        if (userRepository.findByEmail(req.email).isPresent()) {
            return ResponseEntity.badRequest().body("Email already in use");
        }
        User u = new User();
        u.setEmail(req.email);
        u.setPasswordHash(passwordEncoder.encode(req.password));
        u.setName(req.name);
        u.setCity(req.city);
        u.setRole(Role.USER);
        userRepository.save(u);
        String token = jwtService.generateToken(u.getId(), u.getEmail(), u.getRole().name());
        return ResponseEntity.ok(new AuthResponse(token, u.getId(), u.getEmail(), u.getRole().name()));
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest req) {
        Authentication auth = authManager.authenticate(
                new UsernamePasswordAuthenticationToken(req.email, req.password));
        UserPrincipal principal = (UserPrincipal) auth.getPrincipal();
        User u = principal.getUser();
        String token = jwtService.generateToken(u.getId(), u.getEmail(), u.getRole().name());
        return ResponseEntity.ok(new AuthResponse(token, u.getId(), u.getEmail(), u.getRole().name()));
    }

    @GetMapping("/me")
    public ResponseEntity<?> me(@AuthenticationPrincipal UserPrincipal principal) {
        if (principal == null)
            return ResponseEntity.status(401).build();
        User u = principal.getUser();
        return ResponseEntity.ok(new AuthResponse("", u.getId(), u.getEmail(), u.getRole().name()));
    }
}
