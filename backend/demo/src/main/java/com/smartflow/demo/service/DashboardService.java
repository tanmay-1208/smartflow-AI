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


           .sum();
uble(Transaction::getAmount)
se(t.getType()))
ates a false positive sum
        // Correct implementatio        // Correct implementatio  se         // Correct implementatio      netCash        // Correct implementatio        // Correct impleme
                                                              ns                                             netCashFlow,
                                                   );
    }

    public List<Map<String, Object>  getCashflowCh    public List<Map<String, Object>  getCashflowCh    psit    public List<Map<String, Object>  getCash m    public List<Map<String, Object>  getCashflowCh    public Li       public List<Map<String, Object>  getme    public List<Map<String, Object>  getCashflowCh    public Lall) {
            if (t.getDate() == null) continue            i String month = t.getDate().format(formatter);
            monthlyData.putIfAbsent(month, new double[]{0, 0}); // [income, expense]

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
                "expense", entry.getValue()[1]
            ));
        }
        return result;
    }
}
