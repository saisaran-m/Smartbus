package com.smartbus.controller;

import com.smartbus.dto.UserRegistrationDto;
import com.smartbus.service.UserService;
import jakarta.validation.Valid;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PostMapping;

import java.security.Principal;

@Controller
public class PageController {

    private final UserService userService;

    public PageController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping("/")
    public String index(Principal principal) {
        if (principal != null) {
            return "redirect:/dashboard";
        }
        return "welcome";
    }

    @GetMapping("/welcome")
    public String welcome(Principal principal) {
        if (principal != null) {
            return "redirect:/dashboard";
        }
        return "welcome";
    }

    @GetMapping("/login")
    public String login() {
        return "login";
    }

    @GetMapping("/register")
    public String register(Model model) {
        model.addAttribute("user", new UserRegistrationDto());
        return "register";
    }

    @PostMapping("/register")
    public String registerUser(@ModelAttribute("user") @Valid UserRegistrationDto registrationDto,
                               BindingResult result) {
        if (result.hasErrors()) {
            return "register";
        }
        
        try {
            userService.registerUser(registrationDto);
            return "redirect:/login?registered=true";
        } catch (Exception e) {
            result.rejectValue("username", "error.user", e.getMessage());
            return "register";
        }
    }

    @GetMapping("/dashboard")
    public String dashboard(Model model, Principal principal) {
        String username = (principal != null) ? principal.getName() : "Passenger";
        model.addAttribute("username", username);
        return "dashboard";
    }

    @GetMapping("/downloads/SmartBus.apk")
    @org.springframework.web.bind.annotation.ResponseBody
    public org.springframework.http.ResponseEntity<org.springframework.core.io.Resource> downloadApk() {
        try {
            org.springframework.core.io.Resource resource = new org.springframework.core.io.ClassPathResource("static/downloads/SmartBus.apk");
            if (!resource.exists()) {
                return org.springframework.http.ResponseEntity.notFound().build();
            }
            return org.springframework.http.ResponseEntity.ok()
                    .contentType(org.springframework.http.MediaType.parseMediaType("application/vnd.android.package-archive"))
                    .header(org.springframework.http.HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"SmartBus.apk\"")
                    .header(org.springframework.http.HttpHeaders.CONTENT_LENGTH, String.valueOf(resource.contentLength()))
                    .header(org.springframework.http.HttpHeaders.CACHE_CONTROL, "no-cache, no-store, must-revalidate")
                    .body(resource);
        } catch (java.io.IOException e) {
            return org.springframework.http.ResponseEntity.internalServerError().build();
        }
    }
}
