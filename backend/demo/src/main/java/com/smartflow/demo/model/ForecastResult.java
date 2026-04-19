package com.smartflow.demo.model;
import lombok.AllArgsConstructor;
import lombok.Data;
import java.util.List;

@Data
@AllArgsConstructor
public class ForecastResult {
    private List<MonthForecast> forecasts;
    private Double averageMonthlyIncome;
    private Double averageMonthlyExpense;
    private Double averageNetCashFlow;
    private String trend;
    private Double confidenceScore;       // 0-100% model confidence
    private String modelType;             // algorithm used

    @Data
    @AllArgsConstructor
    public static class MonthForecast {
        private String month;
        private Double predictedIncome;
        private Double predictedExpense;
        private Double predictedNetCashFlow;
        private Double upperBoundNet;     // optimistic scenario
        private Double lowerBoundNet;     // pessimistic scenario
    }
}
