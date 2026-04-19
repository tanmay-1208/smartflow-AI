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

    // Smoothing parameters for Holt's method
    private static final double ALPHA = 0.3;  // level smoothing
    private static final double BETA  = 0.1;  // trend smoothing

    public ForecastResult forecast(int months, Long userId) {
        List<Transaction> all = userId != null
            ? transactionRepository.findByUserId(userId)
            : transactionRepository.findAll();

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

        Set<String> allMonthKeys = new TreeSet<>();
        allMonthKeys.addAll(incomeByMonth.keySet());
        allMonthKeys.addAll(expenseByMonth.keySet());

        List<String> sortedMonths = new ArrayList<>(allMonthKeys);
        int n = sortedMonths.size();

        if (n == 0) {
            // No data — return empty forecast
            List<MonthForecast> empty = new ArrayList<>();
            DateTimeFormatter fmt = DateTimeFormatter.ofPattern("MMM yyyy");
            LocalDate now = LocalDate.now();
            for (int i = 0; i < months; i++) {
                String label = now.plusMonths(i + 1).format(fmt);
                empty.add(new MonthForecast(label, 0.0, 0.0, 0.0, 0.0, 0.0));
            }
            return new ForecastResult(empty, 0.0, 0.0, 0.0, "STABLE", 0.0, "No Data");
        }

        double[] incomes = new double[n];
        double[] expenses = new double[n];

        for (int i = 0; i < n; i++) {
            incomes[i] = incomeByMonth.getOrDefault(sortedMonths.get(i), 0.0);
            expenses[i] = Math.abs(expenseByMonth.getOrDefault(sortedMonths.get(i), 0.0));
        }

        // ---------- Double Exponential Smoothing (Holt's Method) ----------
        double[] incomeForecast = holtForecast(incomes, months);
        double[] expenseForecast = holtForecast(expenses, months);

        // ---------- Compute standard deviation for confidence bands ----------
        double incomeStdDev = stdDev(incomes);
        double expenseStdDev = stdDev(expenses);
        double netStdDev = Math.sqrt(incomeStdDev * incomeStdDev + expenseStdDev * expenseStdDev);

        // ---------- Compute averages ----------
        double avgIncome = Arrays.stream(incomes).average().orElse(0);
        double avgExpense = Arrays.stream(expenses).average().orElse(0);
        double avgNet = avgIncome - avgExpense;

        // ---------- Trend detection using slope of Holt's method ----------
        double lastIncome = n >= 2 ? incomeForecast[months - 1] - incomeForecast[0] : 0;
        double lastExpense = n >= 2 ? expenseForecast[months - 1] - expenseForecast[0] : 0;
        double netTrendDelta = lastIncome - lastExpense;
        String trend;
        if (netTrendDelta > avgNet * 0.05) {
            trend = "IMPROVING";
        } else if (netTrendDelta < -avgNet * 0.05) {
            trend = "DECLINING";
        } else {
            trend = "STABLE";
        }

        // ---------- Confidence score based on coefficient of variation ----------
        double cv = avgNet != 0 ? (netStdDev / Math.abs(avgNet)) : 1.0;
        double confidenceScore = round(Math.max(0, Math.min(100, (1 - cv) * 100)));

        // ---------- Build forecast results ----------
        DateTimeFormatter fmt = DateTimeFormatter.ofPattern("MMM yyyy");
        LocalDate now = LocalDate.now();

        List<MonthForecast> forecasts = new ArrayList<>();
        for (int i = 0; i < months; i++) {
            LocalDate futureMonth = now.plusMonths(i + 1);
            String label = futureMonth.format(fmt);

            double projIncome = Math.max(0, incomeForecast[i]);
            double projExpense = Math.max(0, expenseForecast[i]);
            double projNet = projIncome - projExpense;

            // Confidence bands widen further into the future
            double spread = netStdDev * (1 + 0.3 * i);
            double upper = projNet + spread;
            double lower = projNet - spread;

            forecasts.add(new MonthForecast(
                label,
                round(projIncome),
                round(projExpense),
                round(projNet),
                round(upper),
                round(lower)
            ));
        }

        return new ForecastResult(
            forecasts,
            round(avgIncome),
            round(avgExpense),
            round(avgNet),
            trend,
            confidenceScore,
            "Holt's Double Exponential Smoothing"
        );
    }

    /**
     * Holt's Double Exponential Smoothing.
     * Captures both level and trend from historical data.
     */
    private double[] holtForecast(double[] data, int horizonMonths) {
        int n = data.length;
        if (n == 0) return new double[horizonMonths];
        if (n == 1) {
            double[] result = new double[horizonMonths];
            Arrays.fill(result, data[0]);
            return result;
        }

        // Initialize
        double level = data[0];
        double trendVal = data[1] - data[0];

        // Iterate through historical data to train
        for (int i = 1; i < n; i++) {
            double newLevel = ALPHA * data[i] + (1 - ALPHA) * (level + trendVal);
            double newTrend = BETA * (newLevel - level) + (1 - BETA) * trendVal;
            level = newLevel;
            trendVal = newTrend;
        }

        // Project forward
        double[] forecast = new double[horizonMonths];
        for (int i = 0; i < horizonMonths; i++) {
            forecast[i] = level + trendVal * (i + 1);
        }

        return forecast;
    }

    private double stdDev(double[] data) {
        int n = data.length;
        if (n < 2) return 0;
        double mean = Arrays.stream(data).average().orElse(0);
        double variance = 0;
        for (double d : data) {
            variance += (d - mean) * (d - mean);
        }
        return Math.sqrt(variance / (n - 1));
    }

    private double round(double val) {
        return Math.round(val * 100.0) / 100.0;
    }
}
