package com.smartflow.demo.service;

import com.smartflow.demo.model.Transaction;
import com.smartflow.demo.repository.TransactionRepository;
import org.springframework.stereotype.Service;

import java.util.*;
import java.time.format.DateTimeFormatter;

@Service
public class DashboardService {

    private final TransactionRepository transactionRepository;
    private final TeamService teamService;

    public DashboardService(TransactionRepository transactionRepository, TeamService teamService) {
        this.transactionRepository = transactionRepository;
        this.teamService = teamService;
    }

    private List<Transaction> getTransactions(Long userId) {
        if (userId == null) return transactionRepository.findAll();
        List<Long> ids = teamService.getEffectiveUserIds(userId);
        return ids.size() == 1
            ? transactionRepository.findByUserId(ids.get(0))
            : transactionRepository.findByUserIdIn(ids);
    }

    public Map<String, Object> getSummary(Long userId) {
        List<Transaction> all = getTransactions(userId);

        double totalIncome = all.stream()
            .filter(t -> "INCOME".equalsIgnoreCase(t.getType()))
            .mapToDouble(Transaction::getAmount)
            .sum();

        double totalExpense = all.stream()
            .filter(t -> "EXPENSE".equalsIgnoreCase(t.getType()))
            .mapToDouble(Transaction::getAmount)
            .sum();

        double netCashFlow = totalIncome + totalExpense;

        return Map.of(
            "totalIncome", totalIncome,
            "totalExpense", Math.abs(totalExpense),
            "netCashFlow", netCashFlow,
            "transactionCount", all.size()
        );
    }

    public List<Map<String, Object>> getCashflowChart(Long userId) {
        List<Transaction> all = getTransactions(userId);

        Map<String, double[]> monthlyData = new LinkedHashMap<>();
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("MMM yyyy");

        for (Transaction t : all) {
            if (t.getDate() == null) continue;
            String month = t.getDate().format(formatter);
            monthlyData.putIfAbsent(month, new double[]{0, 0});

            if ("INCOME".equalsIgnoreCase(t.getType())) {
                monthlyData.get(month)[0] += t.getAmount();
            } else {
                monthlyData.get(month)[1] += t.getAmount();
            }
        }

        List<Map<String, Object>> result = new ArrayList<>();
        for (Map.Entry<String, double[]> entry : monthlyData.entrySet()) {
            result.add(Map.of(
                "month", entry.getKey(),
                "income", entry.getValue()[0],
                "expense", Math.abs(entry.getValue()[1]) 
            ));
        }
        return result;
    }
}
