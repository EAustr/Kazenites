package com.kazenites.user;

import com.kazenites.user.User;
import com.kazenites.user.UserRepository;
import com.kazenites.security.UserPrincipal;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@RequestMapping("/api/admin/users")
@PreAuthorize("hasRole('ADMIN')")
public class AdminUserController {

    private final UserRepository userRepository;

    public AdminUserController(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @GetMapping
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteUser(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal currentUser) {
        
        User userToDelete = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        // Prevent deleting yourself
        if (userToDelete.getId().equals(currentUser.getUser().getId())) {
            throw new ResponseStatusException(
                HttpStatus.FORBIDDEN, 
                "You cannot delete your own account"
            );
        }
        
        // Prevent deleting other admin users
        if (userToDelete.getRole() == Role.ADMIN) {
            throw new ResponseStatusException(
                HttpStatus.FORBIDDEN, 
                "Cannot delete admin users"
            );
        }
        
        userRepository.delete(userToDelete);
        return ResponseEntity.noContent().build();
    }
}
