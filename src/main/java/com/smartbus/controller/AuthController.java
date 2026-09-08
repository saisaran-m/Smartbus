package com.smartbus.controller;

import com.smartbus.dto.UserRegistrationDto;
import com.smartbus.model.User;
import com.smartbus.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final UserService userService;

    public AuthController(UserService userService) {
        this.userService = userService;
    }

    @PostMapping("/register")
    public ResponseEntity<User> register(@RequestBody UserRegistrationDto registrationDto) {
        User user = userService.registerUser(registrationDto);
        user.setPassword(null); // Exclude password from response
        return ResponseEntity.ok(user);
    }

    @GetMapping("/me")
    public ResponseEntity<Map<String, Object>> getCurrentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String username = auth.getName();
        return userService.findByUsername(username)
                .map(user -> {
                    Map<String, Object> userInfo = new HashMap<>();
                    userInfo.put("id", user.getId());
                    userInfo.put("username", user.getUsername());
                    userInfo.put("email", user.getEmail());
                    userInfo.put("fullName", user.getFullName());
                    userInfo.put("role", user.getRole());
                    userInfo.put("seniorCitizenMode", user.isSeniorCitizenMode());
                    userInfo.put("seniorMode", user.isSeniorCitizenMode());
                    userInfo.put("language", user.getPreferredLanguage());
                    return ResponseEntity.ok(userInfo);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/senior-mode")
    public ResponseEntity<Boolean> toggleSeniorMode() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        return userService.findByUsername(auth.getName())
                .map(user -> {
                    User updated = userService.toggleSeniorMode(user.getId());
                    return ResponseEntity.ok(updated.isSeniorCitizenMode());
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/language")
    public ResponseEntity<Void> updateLanguage(@RequestBody Map<String, String> body) {
        String language = body.get("language");
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        userService.findByUsername(auth.getName()).ifPresent(user -> 
                userService.updateLanguage(user.getId(), language));
        return ResponseEntity.ok().build();
    }
}
