package com.smartflow.demo.service;

import com.smartflow.demo.model.Transaction;
import com.smartflow.demo.repository.TransactionRepository;
import org.springframework.ai.chat.ChatClient;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class AiAdvisorService {

    private final TransactionRepository transactionRepository;
    private final ChatClient chatClient;

    @Autowired
    public AiAdvisorService(TransactionRepository transactionRepository, ChatClient chatClient) {
        this.transactionRepository = transactionRepository;
        this.chatClient = chatClient;
    }

    public String getFinancialAdvice(String userMessage) {
        List<Transaction> allTransactions = transactionRepository.findAllByOrderByDateDesc();

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

        String prompt = String.format(
                "You are an expert financial advisor for an Indian small business.\n" +
                "Here is the user's current financial data context:\n%s\n\n" +
                "User question: %s\n\n" +
                "Give specific, actionable, and professional advice in 3-5 sentences.",
                contextStr, userMessage
        );

        try {
            return chatClient.call(prompt);
        } catch (Exception e) {
            e.printStackTrace();
            return "Sorry, AI Advisor is unavailable right now. Please try again later.";
        }
    }
}
