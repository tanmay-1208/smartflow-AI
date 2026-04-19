package com.smartflow.demo.service;

import com.smartflow.demo.model.Transaction;
import com.smartflow.demo.repository.TransactionRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class AiAdvisorService {

    private final TransactionRepository transactionRepository;
    private final RestTemplate restTemplate = new RestTemplate();

    @Value("${groq.api.key}")
    private String groqApiKey;

    @Value("${groq.api.url:https://api.groq.com/openai/v1/chat/completions}")
    private String groqApiUrl;

    private static final String MODEL = "llama-3.1-8b-instant";

    public AiAdvisorService(TransactionRepository transactionRepository) {
        this.transactionRepository = transactionRepository;
    }

    public String getFinancialAdvice(String userMessage, Long userId) {
        List<Transaction> allTransactions = userId != null
            ? transactionRepository.findByUserIdOrderByDateDesc(userId)
            : transactionRepository.findAllByOrderByDateDesc();

        double totalIncome = 0.0;
        double totalExpense = 0.0;

        for (Transaction t : allTransactions) {
            double amount = t.getAmount() != null ? t.getAmount() : 0.0;
            if ("INCOME".equalsIgnoreCase(t.getType())) {
                totalIncome += Math.abs(amount);
            } else if ("EXPENSE".equalsIgnoreCase(t.getType())) {
                totalExpense += Math.abs(amount);
            }
        }
        
        double netCashFlow = totalIncome - totalExpense;

        String topExpensesStr = allTransactions.stream()
                .filter(t -> "EXPENSE".equalsIgnoreCase(t.getType()))
                .collect(Collectors.groupingBy(
                        t -> t.getCategory() != null ? t.getCategory() : "Uncategorized",
                        Collectors.summingDouble(t -> Math.abs(t.getAmount() != null ? t.getAmount() : 0.0))
                ))
                .entrySet().stream()
                .sorted((e1, e2) -> Double.compare(e2.getValue(), e1.getValue()))
                .limit(3)
                .map(e -> String.format("%s (%.2f)", e.getKey(), e.getValue()))
                .collect(Collectors.joining(", "));

        if (topExpensesStr.isEmpty()) {
            topExpensesStr = "None";
        }

        String recentTxStr = allTransactions.stream()
                .limit(5)
                .map(t -> String.format("%s | %s | %s | %.2f", 
                        t.getDate(), 
                        t.getType(), 
                        t.getCategory() != null ? t.getCategory() : "Uncategorized",
                        t.getAmount() != null ? Math.abs(t.getAmount()) : 0.0))
                .collect(Collectors.joining("\n"));

        if (recentTxStr.isEmpty()) {
            recentTxStr = "No recent transactions.";
        }

        String contextStr = String.format(
                "Total Income: %.2f\nTotal Expense: %.2f\nNet Cash Flow: %.2f\nTop 3 Expense Categories: %s\n\nRecent 5 Transactions:\n%s",
                totalIncome, totalExpense, netCashFlow, topExpensesStr, recentTxStr
        );

        String systemPrompt = "You are an expert financial advisor for an Indian small business. "
                + "You analyze cash flow data and give practical, actionable advice. "
                + "Keep answers concise (3-5 sentences max). Focus on rupees (₹), Indian business context.";

        String userPrompt = String.format(
                "Here is the user's current financial data context:\n%s\n\nUser question: %s\n\nGive specific, actionable, and professional advice in 3-5 sentences.",
                contextStr, userMessage
        );

        // Build Groq API request
        Map<String, Object> requestBody = Map.of(
            "model", MODEL,
            "messages", List.of(
                Map.of("role", "system", "content", systemPrompt),
                Map.of("role", "user", "content", userPrompt)
            ),
            "max_tokens", 500
        );

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setBearerAuth(groqApiKey);

        try {
            ResponseEntity<Map> response = restTemplate.postForEntity(
                groqApiUrl,
                new HttpEntity<>(requestBody, headers),
                Map.class
            );

            List<Map> choices = (List<Map>) response.getBody().get("choices");
            Map message = (Map) choices.get(0).get("message");
            return (String) message.get("content");

        } catch (Exception e) {
            e.printStackTrace();
            return "Sorry, AI Advisor is unavailable right now. Please try again later. Error: " + e.getMessage();
        }
    }
}
