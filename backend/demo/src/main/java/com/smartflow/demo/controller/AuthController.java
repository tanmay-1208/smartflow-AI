package com.smartflow.demo.controller;

import com.smartflow.demo.model.User;
import com.smartflow.demo.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Collections;
import java.util.Map;
import java.util.Optional;

import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.gson.GsonFactory;
import org.springframework.beans.factory.annotation.Value;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class AuthController {

    @Autowired
    private UserRepository userRepository;

    @Value("${google.client.id:YOUR_GOOGLE_CLIENT_ID}")
    private String googleClientId;

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

    // POST /api/auth/google
    @PostMapping("/google")
    public ResponseEntity<?> googleLogin(@RequestBody Map<String, String> payload) {
        String token = payload.get("token");
        if (token == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "Missing token"));
        }

        try {
            GoogleIdTokenVerifier verifier = new GoogleIdTokenVerifier.Builder(new NetHttpTransport(), new GsonFactory())
                    .setAudience(Collections.singletonList(googleClientId))
                    .build();

            GoogleIdToken idToken = verifier.verify(token);
            if (idToken != null) {
                GoogleIdToken.Payload googlePayload = idToken.getPayload();
                String email = googlePayload.getEmail();
                String name = (String) googlePayload.get("name");

                Optional<User> userOpt = userRepository.findByEmail(email);
                User user;
                if (userOpt.isPresent()) {
                    user = userOpt.get();
                } else {
                    // Create new user
                    user = new User();
                    user.setEmail(email);
                    user.setBusinessName(name != null ? name : "My Business");
                    user.setInviteCode(java.util.UUID.randomUUID().toString().substring(0, 8).toUpperCase());
                    User saved = userRepository.save(user);
                    saved.setWorkspaceId(saved.getId());
                    user = userRepository.save(saved);
                }
                user.setPassword(null);
                return ResponseEntity.ok(user);
            } else {
                return ResponseEntity.status(401).body(Map.of("error", "Invalid ID token. Ensure the client ID matches or check the token validity."));
            }
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of("error", "Error verifying Google token: " + e.getMessage()));
        }
    }
}
