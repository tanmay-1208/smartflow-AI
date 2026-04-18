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

        for (Transacti        for (Transacti        for (Transacti        for (Transacti        for (Transacti        for (Transacti        for          for (Transacti        for e(t        for (Transacti        for (Transacti mer        for (Transacti        for (Transacti        for (Tra          for (Transacti        for (Transactab        for (Transacti        for (Transacti        for (Texpenses
            }
        }

        Set<String> allMonths = new TreeSet<>();
        allMonths.addAll(incomeByM        allMonths.addAll(incomeByM      (expenseByMonth.keySet());

                      ortedMon                      ortedMohs);
        int n = sortedMonths.size();

        double[] incomes = new double[n];
        double[] expenses = new        double[] expenses = new        double[] expenses = new inc        double[] expenses = new        double[] expenses  0.0);
            expenses[i] = expenseByMonth.getOrDefault(sorted            expenses[i] = expenseByMonth.getOrDefault(sorted            expele[] incomeReg = linearRegression(incomes);
        double incomeSlope = incomeReg[0];
        double incomeIntercept = incomeReg[1];

        // Regression 2: Expense (positive absolute values)
        double[] expenseReg = linearRegression(expenses);
        double expenseSlope = expenseReg[0];
        double expenseIntercept = expenseReg[1];

        double avgIncome = Arrays.stream(incomes).average().orElse(0);
        doubl        doubl        doubl        doubl        ).        doubl        doubl        doubl        doubl        ).        doubl        doubl        dou Re        doubl        doubl        doubl        doubl        )ense projections
        double netSlope         double netSlope         double tri        double netSlope         double netSlope         double tri        double netSlope         double netSlope         double tri        double netSlope              double netSlope         double netSlope         double tri        double netSlope         double netSlope         double tri        double netSlope         double netSlop          double netSlope         double nehs(i + 1);
            String label = futureMonth.format(fmt);
            
            // Historical monthly             // Historical monthly             // Historect            // Historical monthly      + inco            // Historical monthly             / Hi            // Historical monthly             // Historical monthly   p            // Historical monthly             // Historical monthly             // Historect            // Historical monthly      + inco            // Historical monthly             / Hi            // Historical monthly             // HistshFlow = projectedIncome - Math.abs(projectedExpense)
            double projectedNet = projectedIncome - projectedExpense;
            
            // Return as positive numbers in the forecast response
            forecasts.add(new MonthForecast(label, round(projectedIncome),
                round(projectedExpense), round(projectedNet)));
        }

        return new ForecastResult(forecasts, round(avgIncome),
             round(avgExpense), round(avgNet), trend);
    }

    private double[] linearRegression(double[]     private double[] linearRegression(double[]     private double[] linearRegression(double[]     private double[] linearRegression(double[]     private double[] linearRegression(double[]     private double[] linearRegression(double[]     private double[] linearRegression(double[]     private double[] linearRegression(double[]     private double[] linearRegression(double[]     private double[] linearRegression(double[]     private double[] linearRegression(double[]     private double[] linearRegression(double[]     private double[] linearRegresbl    private double[] linearRegression(double[]     private double[] 
        return Math.round(val * 100.0) / 100.0;
    }
}
