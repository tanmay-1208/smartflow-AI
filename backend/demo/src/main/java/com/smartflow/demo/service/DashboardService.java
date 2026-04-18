package com.smartflow.demo.service;

import com.smartflow.demo.model.Transaction;
import com.smartflow.demo.repository.TransactionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.*;
import java.time.format.DateTimeFormatter;

@Service
public class DashboardService {

    @Autowired
    private TransactionRepository transactionRepository;

    public Map<String, Object> getSummary() {
        List<Transaction> all = transactionRepository.findAll();

        double totalIncome = all.stream()
            .filter(t -> "INCOME".equalsIgnoreCase(t.getType()))
            .mapToDouble(Transaction::getAmount)
            .sum();

        double totalExpense = all.stream()
            .filter(t -> "EXPENSE".equalsIgnoreCase(t.getType()))
            .mapToDouble(Transaction::getAmount)
            .sum();

        // Expenses are already negative, so we add them to get net cash flow
        double netCashFlow = totalIncome + totalExpense;

        return Map.of(
            "totalIncome", totalIncome,
            "totalExpense", Math.abs(totalExpense),
            "netCashFlow", netCashFlow
        );
    }

    public List<Map<String, Object>> getCashflowChart() {
        List<Transaction> all = transactionRepository.findAll();
        Map<String, double[]> monthlyData = new LinkedHashMap<>();
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("MMM yyyy");

        for (Transaction t : all) {
            if (t.getDate() == null) continue;
            String month = t.getDate().format(formatter);
            monthlyData.putIfAbsent(month, new double[]{0, 0}); // [income, expense]

            if ("INCOME".equalsIgnoreCase(t.getType())) {
                monthlyData.get(month)[0] += t.getAmount();
            } else {
                monthlyData.get(month)[1] += t.getAmount(); // amounts are negative
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
