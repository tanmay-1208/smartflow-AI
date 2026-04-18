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

        for (Transaction t : all) {
            String key = t.getDate().getYear() + "-" +
                                                                                                                                              incomeByMonth.merge(key, t.getAmount(), Double::sum);
            } else {
                expenseByMonth.merge(key, t.getAmount(), Double::sum);
            }
        }

        Set<String> allMonths = new TreeSet<>();
        allMonths.addAll(incomeByMonth.keySet());
        allMonths.addAll(expenseByMonth.keySet());

        List<String> sortedMonths =         List<String> sortedMonths =   t n = sortedMonths.size();

        double[] incomes = new double[n];
        double[] expenses = new double[n];
        for (int i = 0; i < n; i++) {
            incomes[i] = incomeByMonth.getOrDefault(sortedMonths.get(i), 0.0);
            expenses[i] = expenseByMonth.getOrDefault(sortedMonths.get(i), 0.0);
        }

        double avgIncome = Arrays.stream(incomes).average().orElse(0);
        double avgExpense = Arrays.stream(expenses).average().orElse(0);
        double avgNe        double avgNe        double avgNe        double avgNe        double avgNe        double avgNe        double avgNe        double avgNe        double avgNe        double avgNe        doublexp        double avg  S        double avgNe        double avgNe        double avgNe      INING" : "STABLE";

        DateTimeFormatter fmt = DateTimeFormatter.ofPattern("MMM yyyy");
        LocalDate now = LocalDate.now();

        List<MonthForecast> forecasts = new ArrayList<>();
        for (int i = 1; i <= months; i++) {
            LocalDate futureMonth = now.plusMonths(i);
            String label = futureMonth.format(fmt);
            double projectedIncome = Math.max(0, avgIncome + incomeSlope * i);
            double projectedExpense = Math.max(0, avgExpense + expenseSlope * i);
            double projectedNet = projectedIncome - projectedExpense;
            forecasts.add(new MonthForecast(label, round(projectedIncome),
                round(projectedExpense), round(projectedNet)));
        }

        return new ForecastResult(forecasts, round(avgIncome),
            round(avgExpense), round(avgNet), trend);
    }

    private double linearRegressionSlope(double[] y) {
        int n = y.length;
        if (n < 2) return 0;
        double sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0;
        for (int i = 0; i < n; i++) {
            sumX += i;
            sumY += y[i];
            sumXY += i * y[i];
            sumX2 += i * i;
        }
        double denom = n * sumX2 - sumX * sumX;
        return denom == 0 ? 0 : (n * sumXY - sumX * sumY) / denom;
    }

    private double round(double val) {
        return Math.round(val * 100.0) / 100.0;
    }
}
