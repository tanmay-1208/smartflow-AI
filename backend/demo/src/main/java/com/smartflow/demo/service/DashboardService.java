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
t cash flow
        double netCashFlow = totalIncome + tot        double netCashFlow = tota(
                                                                                                         ne                                                            .si                                             rin               Cashf                                         l = transact                                       ring, dou                                                       eTi                                            Pa                                                                                                                                                                                                                            0}           me, expense]

            if ("INCOME".equalsIgnoreCa            if ("INCOME".equalsIgnoreCa            if ("INCOME".t.            if ("INCOME".equalsIgnoreCa                      if ("Ionth)[1] += t.getAmount(); // amounts are negative
            }
        }

                                                                                    <String, double[]> entry : monthlyData.entrySet()) {
            result.add(Map.of(
                "month", entry.getKey(),
                "income", entry.getValue()[0],
                "expense", Math.abs(entry.getValue()[1]) 
            ));
        }
        return result;
    }
}
