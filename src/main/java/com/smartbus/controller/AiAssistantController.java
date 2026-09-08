package com.smartbus.controller;

import com.smartbus.service.AiAssistantService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Arrays;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/ai")
public class AiAssistantController {

    @Autowired
    private AiAssistantService aiAssistantService;

    @PostMapping("/chat")
    public ResponseEntity<Map<String, Object>> chat(@RequestBody Map<String, String> request) {
        String query = request.getOrDefault("message", "");
        String language = request.getOrDefault("language", "en");
        Map<String, Object> response = aiAssistantService.askAssistant(query, language);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/suggestions")
    public ResponseEntity<List<String>> getSuggestions(@RequestParam(defaultValue = "en") String language) {
        if ("ta".equalsIgnoreCase(language)) {
            return ResponseEntity.ok(Arrays.asList(
                "சென்னை முதல் சேலம் பஸ்கள்",
                "மதுரை கட்டணம் எவ்வளவு?",
                "ஸ்டாப் கார்டியன் எப்படி விழிப்பூட்டும்?",
                "அவசர உதவி எண்கள் 112 / 108",
                "மூத்த குடிமக்கள் 50% சலுகை",
                "அடுத்த பஸ் எப்போது வரும்?"
            ));
        }
        return ResponseEntity.ok(Arrays.asList(
            "Buses from Chennai to Salem",
            "What is the fare to Madurai?",
            "How does Stop Guardian alert me?",
            "Emergency helplines 112 / 108",
            "Senior citizen concessions",
            "Find the next available bus"
        ));
    }
}
