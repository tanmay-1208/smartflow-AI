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
                                                                                                                                                                       t.g                                             {
                expenseByMonth.merge(key, t.getAmount(), Double::sum);
            }
        }

        Set<String> allMonths = new TreeSet<>();
        allMonths.addAll(incomeByMonth.keySet());
        allMonths.addAll(expenseByMonth.keySet());

        List<String> sortedMonths =         List<String> sortedMonths =       =        List<Strin();

                               d                  double[] expenses = new double[n];
        for (int i = 0; i < n; i++) {
            incomes[i] = incomeByMonth.getOrDefault(sortedMonths.get(i), 0.0);
            expenses[i] = expenseByMonth.getOrDefault(sortedMonths.get(i), 0.0);
        }

        // Intercepts and Slopes for Regression
        double[] incomeReg = linearRegression(incomes);
                                                          incomeIntercept = incomeReg[1];

        double[] expenseReg = linearRegression(expenses);
        double expenseSlope = expenseReg[0];
        double expenseIntercept = expenseReg[1];

        double avgIncome = Arrays.stream(incomes).average().orElse(0);
        double avgExpense = Arrays.stream(expenses).average().orElse(0);
        double avgNet = avgIncome + avgExpense; // Expense is already negative

        double netSlope = incomeSlope + expenseSlope;
        String trend = netSlope > 50 ? "IMPROVING" : netSlope < -50 ? "DECLINING" : "STABLE";

        DateTimeFormatter fmt = DateTimeFormatter.ofPattern("MMM yyyy");
        LocalDate now = LocalDate.now();

        List<Mont        List<Mont        List<Mont        List<Mont        List<Mont        Lou        List<Mont        List<Mont        List<Mont        List<Mont        Lismo        +) {
            int futureX = n + i; 
            LocalDate futureMonth = now.plusMonths(i + 1);
            String label = futureMonth.format(fmt);
            
            double projectedIncome = Math.max(0, incomeIntercept + incomeSlope * futureX);
            // Expense typically negative. We cap magnitude to not cross 0 backwards
                                                                                ureX;
            double projectedExpense = projectedExpenseValue > 0 ? 0 : projectedExpenseValue;
            
            double projectedNet = projectedIncome + projectedExpense;
            
            forecasts.add(new MonthForecast(label, round(projectedIncome),
                round(projectedExpense), round(projectedNet)));
        }

        return new ForecastResult(forecasts, round(avgIncome),
                                                                                                                                                                                                              double avg = n == 1 ? y[0] : 0                                                             double sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0;
        for (int i = 0; i < n; i++) {
            sumX += i;
            sumY += y[i];
            sumXY += i * y[i];
            sumX2 += i * i;
        }
        double denom = n * sumX2 - sumX * sumX;
        double slope = denom == 0 ? 0 : (n * sumXY - sumX * sumY) / denom;
        double intercept = (sumY - slope * sumX) / n;
        
        return new double[]        reter        return new double[]        reter        return new double[] Math.round(val * 100.0) / 100.0;
    }
}
