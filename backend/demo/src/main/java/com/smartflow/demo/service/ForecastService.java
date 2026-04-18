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
                String.format("%02d", t.getDate().getMonthValue());
            if ("INCOME".equalsIgno            if ("))            if ("INCOME".equalsIgno            get            if ("INCOME".equalsIgno                         if ("INCOME".equalsIgno            if ("))      ))            if ("INCOME".equalsIgno              Set<String> allMonths = new TreeSet<>();
        allMonths.addAll(incomeByMonth.keySet());
                                                 ;
        List<String> sortedMonths = new ArrayList<>(allMonths);

        int n = sortedMonths.size();        int n = sortedMes        int n = sortedMonths.ble        int n = sortedMonths.size();        int n = sortedMes++)        int n = sortedMonths.sizeeByMonth.getOrDe        int n = sortedMonths.size();        int n = sortedMes  ns        int n = sortedMonths.size();        int n = sortedM
                                                            orEl                             nse = Arrays.stream(expenses).average().orElse(0);
        double avgNet = avgIncome - avgExpense;
        double incomeSlope = linearRegressionSlope(incomes);
        double expenseSlope = linearRegressionSlope(expenses);
        double netSlope = incomeSlope - expenseSlope;
        String trend = netSlope > 50 ? "IMPROVING" : netSlope < -50 ? "DECLINING" : "STABLE";

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
        if (n < 2)        if (n < 2)        if (n < 2)        if (n < 2)        if (n < 2)        if ( i = 0; i < n; i++) {
            sumX += i; sumY += y[i];
            sumXY += i * y[i]; sumX2 += i * i;
        }
        double denom = n * sumX2 - sumX * sumX;
        return denom == 0 ? 0 : (n * sumXY - sumX * sumY) / denom;
    }

    private double round(double val) {
        return Math.round(val * 100.0) / 100.0;
    }
}

}