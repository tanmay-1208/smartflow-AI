package com.smartflow.demo.service;

import com.smartflow.demo.model.ForecastResult;
import com.smartflow.demo.model.ForecastResult.MonthForecast;
import com.smartflow.demo.model.Transaction;
import com.smartflow.demo.repository.TransactionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.*;

@Service
@RequiredArgsConstructor
public class ForecastService {

    private final TransactionRepository transactionRepository;

    public ForecastResult forecast(int months) {
        List<Transaction> all = transactionRepository.findAll();

        Map<String, Double> incomeByMonth = new TreeMap<>();
        Map<String, Double> expenseByMonth = new TreeMap<>();

        DateTimeFormatter keyFormat = DateTimeFormatter.ofPattern("yyyy-MM");

        for (Transaction t : all) {
            if (t.getDate() == null) continue;
            String key = t.getDate().format(keyFormat);
            if ("INCOME".equalsIgnoreCase(t.getType())) {
                incomeByMonth.merge(key, t.getAmount(), Double::sum);
            } else {
                expenseByMonth.merge(key, t.getAmount(), Double::sum);
            }
        }

        Set<String> allMonths = new TreeSet<>();
        allMonths.addAll(incomeByMonth.keySet());
        allMonths.addAll(expenseByMonth.keySet());

        List<String> sortedMonths = new ArrayList<>(allMonths);
        int n = sortedMonths.size();

        double[] incomes = new double[n];
        double[] expenses = new double[n];

        for (int i = 0; i < n; i++) {
            incomes[i] = incomeByMonth.getOrDefault(sortedMonths.get(i), 0.0);
            expenses[i] = Math.abs(expenseByMonth.getOrDefault(sortedMonths.get(i), 0.0));
        }

        // Regression 1: Income
        double[] incomeReg = linearRegression(incomes);
        double incomeSlope = incomeReg[0];
        double incomeIntercept = incomeReg[1];

        // Regression 2: Expense (positive absolute values)
        double[] expenseReg = linearRegression(expenses);
        double expenseSlope = expenseReg[0];
        double expenseIntercept = expenseReg[1];

        double avgIncome = Arrays.stream(incomes).average().orElse(0);
        double avgExpense = Arrays.stream(expenses).average().orElse(0);
        double avgNet = avgIncome - avgExpense; 

        double netSlope = incomeSlope - expenseSlope;
        String trend = netSlope > 50 ? "IMPROVING" : netSlope < -50 ? "DECLINING" : "STABLE";

        DateTimeFormatter fmt = DateTimeFormatter.ofPattern("MMM yyyy");
        LocalDate now = LocalDate.now();

        List<MonthForecast> forecasts = new ArrayList<>();
        for (int i = 0; i < months; i++) {
            int futureX = n + i; 
            LocalDate futureMonth = now.plusMonths(i + 1);
            String label = futureMonth.format(fmt);
            
            double projectedIncome = Math.max(0, incomeIntercept + incomeSlope * futureX);
            double projectedExpense = Math.max(0, expenseIntercept + expenseSlope * futureX);
            
            double projectedNet = projectedIncome - projectedExpense;
            
            forecasts.add(new MonthForecast(label, round(projectedIncome),
                round(projectedExpense), round(projectedNet)));
        }

        return new ForecastResult(forecasts, round(avgIncome),
             round(avgExpense), round(avgNet), trend);
    }

    private double[] linearRegression(double[] y) {
        int n = y.length;
        if (n == 0) return new double[]{0, 0};
        if (n == 1) return new double[]{0, y[0]};

        double sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0;
        for (int i = 0; i < n; i++) {
            sumX += i;
            sumY += y[i];
            sumXY += i * y[i];
            sumX2 += i * i;
        }
        double denom = n * sumX2 - sumX * sumX;
        double slope = denom == 0 ? 0 : (n * sumXY - sumX * sumY) / denom;
        double intercept = (sumY - slope * sumX) / n;
        
        return new double[]{slope, intercept};
    }

    private double round(double val) {
        return Math.round(val * 100.0) / 100.0;
    }
}
