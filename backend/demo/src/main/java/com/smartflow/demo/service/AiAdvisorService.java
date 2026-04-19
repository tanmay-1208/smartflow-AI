package com.smartflow.demo.service;

import com.smartflow.demo.model.Transaction;
import com.smartflow.demo.repository.TransactionRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class AiAdvisorService {

    private final TransactionRepository transactionRepository;
    private final TeamService teamService;
    private final RestTemplate restTemplate = new RestTemplate();

    @Value("${groq.api.key}")
    private String groqApiKey;

    @Value("${groq.api.url:https://api.groq.com/openai/v1/chat/completions}")
    private String groqApiUrl;

    // Upgraded: 70B model for much better financial reasoning
    private static final String MODEL = "llama-3.3-70b-versatile";

    public AiAdvisorService(TransactionRepository transactionRepository, TeamService teamService) {
        this.transactionRepository = transactionRepository;
        this.teamService = teamService;
    }

    public String getFinancialAdvice(String userMessage, Long userId) {
        List<Transaction> allTransactions;
        if (userId != null) {
            List<Long> ids = teamService.getEffectiveUserIds(userId);
            allTransactions = ids.size() == 1
                ? transactionRepository.findByUserIdOrderByDateDesc(ids.get(0))
                : transactionRepository.findByUserIdInOrderByDateDesc(ids);
        } else {
            allTransactions = transactionRepository.findAllByOrderByDateDesc();
        }

        if (allTransactions.isEmpty()) {
            return callLLM(
                "You are an expert financial advisor for Indian small businesses.",
                "The user has no transaction data yet. " +
                "User question: " + userMessage + "\n\n" +
                "Give general financial advice for a small business just starting to track their finances. " +
                "Keep it concise (3-5 sentences), practical, and in Indian business context (use ₹)."
            );
        }

        // ---- Build rich financial context ----
        StringBuilder context = new StringBuilder();

        // 1. Overall Summary
        double totalIncome = 0, totalExpense = 0;
        for (Transaction t : allTransactions) {
            double amt = t.getAmount() != null ? t.getAmount() : 0;
            if ("INCOME".equalsIgnoreCase(t.getType())) totalIncome += Math.abs(amt);
            else if ("EXPENSE".equalsIgnoreCase(t.getType())) totalExpense += Math.abs(amt);
        }
        double netCashFlow = totalIncome - totalExpense;
        double savingsRate = totalIncome > 0 ? ((totalIncome - totalExpense) / totalIncome) * 100 : 0;

        // Final copies for use in lambdas
        final double finalTotalIncome = totalIncome;
        final double finalTotalExpense = totalExpense;

        context.append(String.format("=== FINANCIAL SUMMARY ===\n"));
        context.append(String.format("Total Income: ₹%.2f\n", totalIncome));
        context.append(String.format("Total Expenses: ₹%.2f\n", totalExpense));
        context.append(String.format("Net Cash Flow: ₹%.2f\n", netCashFlow));
        context.append(String.format("Savings Rate: %.1f%%\n", savingsRate));
        context.append(String.format("Total Transactions: %d\n\n", allTransactions.size()));

        // 2. Monthly Breakdown (last 6 months)
        DateTimeFormatter monthFmt = DateTimeFormatter.ofPattern("yyyy-MM");
        Map<String, double[]> monthlyData = new TreeMap<>();

        for (Transaction t : allTransactions) {
            if (t.getDate() == null) continue;
            String key = t.getDate().format(monthFmt);
            monthlyData.putIfAbsent(key, new double[]{0, 0});
            double amt = Math.abs(t.getAmount() != null ? t.getAmount() : 0);
            if ("INCOME".equalsIgnoreCase(t.getType())) {
                monthlyData.get(key)[0] += amt;
            } else {
                monthlyData.get(key)[1] += amt;
            }
        }

        context.append("=== MONTHLY TRENDS (Recent) ===\n");
        List<Map.Entry<String, double[]>> sortedEntries = new ArrayList<>(monthlyData.entrySet());
        int startIdx = Math.max(0, sortedEntries.size() - 6);
        double prevNet = Double.NaN;
        for (int i = startIdx; i < sortedEntries.size(); i++) {
            var entry = sortedEntries.get(i);
            double inc = entry.getValue()[0];
            double exp = entry.getValue()[1];
            double net = inc - exp;
            String growth = "";
            if (!Double.isNaN(prevNet) && prevNet != 0) {
                double pct = ((net - prevNet) / Math.abs(prevNet)) * 100;
                growth = String.format(" (MoM: %+.1f%%)", pct);
            }
            context.append(String.format("%s → Income: ₹%.0f, Expense: ₹%.0f, Net: ₹%.0f%s\n",
                entry.getKey(), inc, exp, net, growth));
            prevNet = net;
        }

        // 3. Category Breakdown
        context.append("\n=== EXPENSE CATEGORIES (Top 5) ===\n");
        Map<String, Double> catTotals = allTransactions.stream()
            .filter(t -> "EXPENSE".equalsIgnoreCase(t.getType()))
            .collect(Collectors.groupingBy(
                t -> t.getCategory() != null ? t.getCategory() : "Uncategorized",
                Collectors.summingDouble(t -> Math.abs(t.getAmount() != null ? t.getAmount() : 0))
            ));

        catTotals.entrySet().stream()
            .sorted((a, b) -> Double.compare(b.getValue(), a.getValue()))
            .limit(5)
            .forEach(e -> {
                double pct = finalTotalExpense > 0 ? (e.getValue() / finalTotalExpense) * 100 : 0;
                context.append(String.format("  %s: ₹%.0f (%.1f%% of expenses)\n",
                    e.getKey(), e.getValue(), pct));
            });

        // 4. Income Sources
        context.append("\n=== INCOME SOURCES ===\n");
        Map<String, Double> incomeSources = allTransactions.stream()
            .filter(t -> "INCOME".equalsIgnoreCase(t.getType()))
            .collect(Collectors.groupingBy(
                t -> t.getCategory() != null ? t.getCategory() : "Uncategorized",
                Collectors.summingDouble(t -> Math.abs(t.getAmount() != null ? t.getAmount() : 0))
            ));

        incomeSources.entrySet().stream()
            .sorted((a, b) -> Double.compare(b.getValue(), a.getValue()))
            .forEach(e -> {
                double pct = finalTotalIncome > 0 ? (e.getValue() / finalTotalIncome) * 100 : 0;
                context.append(String.format("  %s: ₹%.0f (%.1f%%)\n",
                    e.getKey(), e.getValue(), pct));
            });

        // 5. Recent Transactions
        context.append("\n=== RECENT TRANSACTIONS (Last 10) ===\n");
        allTransactions.stream().limit(10).forEach(t ->
            context.append(String.format("  %s | %s | %s | ₹%.2f\n",
                t.getDate(), t.getType(),
                t.getCategory() != null ? t.getCategory() : "Uncategorized",
                Math.abs(t.getAmount() != null ? t.getAmount() : 0)))
        );

        // ---- Build prompts ----
        String systemPrompt = """
            You are VaultCA, an expert AI financial advisor specializing in Indian small businesses (SMBs).
            
            Your capabilities:
            - Deep analysis of cash flow patterns, seasonality, and trends
            - Category-wise expense optimization recommendations
            - Revenue growth strategies specific to Indian markets
            - Tax planning tips relevant to Indian GST and Income Tax
            - Working capital management advice
            - Risk assessment based on income concentration
            
            Guidelines:
            - Always use ₹ (Indian Rupees) for amounts
            - Reference specific numbers from the user's data to back your advice
            - Be actionable and specific, not generic
            - Consider Indian business context (festivals, GST quarters, etc.)
            - Keep responses concise but insightful (4-6 sentences)
            - If the savings rate is low (<20%), flag it as a concern
            - If income is concentrated in one source (>70%), flag diversification risk
            """;

        String userPrompt = String.format(
            "Here is my complete financial data:\n\n%s\n\nMy question: %s",
            context.toString(), userMessage
        );

        return callLLM(systemPrompt, userPrompt);
    }

    private String callLLM(String systemPrompt, String userPrompt) {
        Map<String, Object> requestBody = Map.of(
            "model", MODEL,
            "messages", List.of(
                Map.of("role", "system", "content", systemPrompt),
                Map.of("role", "user", "content", userPrompt)
            ),
            "max_tokens", 700,
            "temperature", 0.4
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
            return "Sorry, AI Advisor is unavailable right now. Please try again later.";
        }
    }
}
