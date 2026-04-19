package com.smartflow.demo.controller;

import com.smartflow.demo.model.User;
import com.smartflow.demo.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class AuthController {

    @Autowired
    private UserRepository userRepository;

    // POST /api/auth/register
    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody User user) {
        if (userRepository.findByEmail(user.getEmail()).isPresent()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Email already registered"));
        }
        user.setInviteCode(java.util.UUID.randomUUID().toString().substring(0, 8).toUpperCase());
        User saved = userRepository.save(user);
        saved.setWorkspaceId(saved.getId());
        userRepository.save(saved);
        saved.setPassword(null); // don't return password
        return ResponseEntity.ok(saved);
    }

    // POST /api/auth/login
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> credentials) {
        String email = credentials.get("email");
        String password = credentials.get("password");

        Optional<User> userOpt = userRepository.findByEmail(email);
        if (userOpt.isEmpty() || !userOpt.get().getPassword().equals(password)) {
            return ResponseEntity.status(401).body(Map.of("error", "Invalid email or password"));
        }

        User user = userOpt.get();
        user.setPassword(null);
        return ResponseEntity.ok(user);
    }
    
    // POST /api/auth/join
    @PostMapping("/join")
    public ResponseEntity<?> joinWorkspace(@RequestBody Map<String, String> payload) {
        String inviteCode = payload.get("inviteCode");
        String userIdStr = payload.get("userId");
        if (inviteCode == null || userIdStr == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "Missing inviteCode or userId"));
        }
        
        Optional<User> targetWorkspaceOwner = userRepository.findByInviteCode(inviteCode);
        if (targetWorkspaceOwner.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Invalid invite code"));
        }
        
        Optional<User> currentUserOpt = userRepository.findById(Long.parseLong(userIdStr));
        if (currentUserOpt.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "User not found"));
        }
        
        User currentUser = currentUserOpt.get();
        currentUser.setWorkspaceId(targetWorkspaceOwner.get().getWorkspaceId());
        userRepository.save(currentUser);
        
        currentUser.setPassword(null);
        return ResponseEntity.ok(currentUser);
    }
}
