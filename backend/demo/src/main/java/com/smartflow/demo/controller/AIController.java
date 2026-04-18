package com.smartflow.demo.controller;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;

import java.util.*;

@RestController
@RequestMapping("/api/ai-raw")
@CrossOrigin(origins = "*")
public class AIController {

    @Value("${groq.api.key}")
    private String groqApiKey;

    private static final String GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";
    private static final String MODEL = "llama-3.1-8b-instant";

    // POST /api/ai/advise
    // Body: { "question": "...", "transactions": [...] }
    @PostMapping("/advise")
    public ResponseEntity<?> advise(@RequestBody Map<String, Object> body) {
        String question = (String) body.getOrDefault("question", "Analyze my cash flow");
        Object transactions = body.getOrDefault("transactions", List.of());

        String systemPrompt = """
            You are VaultCA, an expert AI financial advisor for Indian small businesses.
            You analyze cash flow data and give practical, actionable advice in simple English.
            Keep answers concise (3-5 sentences max). Focus on rupees (₹), Indian business context.
            """;

        String userMessage = "My transactions: " + transactions.toString() + "\n\nQuestion: " + question;

        // Build Groq request
        Map<String, Object> requestBody = Map.of(
            "model", MODEL,
            "messages", List.of(
                Map.of("role", "system", "content", systemPrompt),
                Map.of("role", "user", "content", userMessage)
            ),
            "max_tokens", 300
        );

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setBearerAuth(groqApiKey);

        RestTemplate restTemplate = new RestTemplate();
        try {
            ResponseEntity<Map> response = restTemplate.postForEntity(
                GROQ_URL,
                new HttpEntity<>(requestBody, headers),
                Map.class
            );

            // Extract the reply text
            List<Map> choices = (List<Map>) response.getBody().get("choices");
            Map message = (Map) choices.get(0).get("message");
            String reply = (String) message.get("content");

            return ResponseEntity.ok(Map.of("reply", reply));

        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", "AI service failed: " + e.getMessage()));
        }
    }
}