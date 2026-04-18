package com.smartflow.demo.controller;

import com.smartflow.demo.service.AiAdvisorService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/ai")
@CrossOrigin(origins = "*")
public class AiAdvisorController {

    private final AiAdvisorService aiAdvisorService;

    @Autowired
    public AiAdvisorController(AiAdvisorService aiAdvisorService) {
        this.aiAdvisorService = aiAdvisorService;
    }

    @PostMapping("/advice")
    public Map<String, String> getAdvice(@RequestBody Map<String, String> request) {
        String message = request.get("message");
        
        if (message == null || message.trim().isEmpty()) {
            return Map.of("advice", "Please provide a valid question.");
        }
        
        String advice = aiAdvisorService.getFinancialAdvice(message);
        return Map.of("advice", advice);
    }
}
