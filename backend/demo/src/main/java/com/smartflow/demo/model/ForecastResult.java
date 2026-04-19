package com.smartflow.demo.model;
import java.util.List;

public class ForecastResult {
    private List<MonthForecast> forecasts;
    private Double averageMonthlyIncome;
    private Double averageMonthlyExpense;
    private Double averageNetCashFlow;
    private String trend;
    private Double confidenceScore;
    private String modelType;

    public ForecastResult() {}

    public ForecastResult(List<MonthForecast> forecasts, Double averageMonthlyIncome, Double averageMonthlyExpense, 
                          Double averageNetCashFlow, String trend, Double confidenceScore, String modelType) {
        this.forecasts = forecasts;
        this.averageMonthlyIncome = averageMonthlyIncome;
        this.averageMonthlyExpense = averageMonthlyExpense;
        this.averageNetCashFlow = averageNetCashFlow;
        this.trend = trend;
        this.confidenceScore = confidenceScore;
        this.modelType = modelType;
    }

    // Getters and Setters
    public List<MonthForecast> getForecasts() { return forecasts; }
    public void setForecasts(List<MonthForecast> forecasts) { this.forecasts = forecasts; }
    public Double getAverageMonthlyIncome() { return averageMonthlyIncome; }
    public void setAverageMonthlyIncome(Double v) { this.averageMonthlyIncome = v; }
    public Double getAverageMonthlyExpense() { return averageMonthlyExpense; }
    public void setAverageMonthlyExpense(Double v) { this.averageMonthlyExpense = v; }
    public Double getAverageNetCashFlow() { return averageNetCashFlow; }
    public void setAverageNetCashFlow(Double v) { this.averageNetCashFlow = v; }
    public String getTrend() { return trend; }
    public void setTrend(String v) { this.trend = v; }
    public Double getConfidenceScore() { return confidenceScore; }
    public void setConfidenceScore(Double v) { this.confidenceScore = v; }
    public String getModelType() { return modelType; }
    public void setModelType(String v) { this.modelType = v; }

    public static class MonthForecast {
        private String month;
        private Double predictedIncome;
        private Double predictedExpense;
        private Double predictedNetCashFlow;
        private Double upperBoundNet;
        private Double lowerBoundNet;

        public MonthForecast() {}

        public MonthForecast(String month, Double predictedIncome, Double predictedExpense, 
                             Double predictedNetCashFlow, Double upperBoundNet, Double lowerBoundNet) {
            this.month = month;
            this.predictedIncome = predictedIncome;
            this.predictedExpense = predictedExpense;
            this.predictedNetCashFlow = predictedNetCashFlow;
            this.upperBoundNet = upperBoundNet;
            this.lowerBoundNet = lowerBoundNet;
        }

        // Getters and Setters
        public String getMonth() { return month; }
        public void setMonth(String v) { this.month = v; }
        public Double getPredictedIncome() { return predictedIncome; }
        public void setPredictedIncome(Double v) { this.predictedIncome = v; }
        public Double getPredictedExpense() { return predictedExpense; }
        public void setPredictedExpense(Double v) { this.predictedExpense = v; }
        public Double getPredictedNetCashFlow() { return predictedNetCashFlow; }
        public void setPredictedNetCashFlow(Double v) { this.predictedNetCashFlow = v; }
        public Double getUpperBoundNet() { return upperBoundNet; }
        public void setUpperBoundNet(Double v) { this.upperBoundNet = v; }
        public Double getLowerBoundNet() { return lowerBoundNet; }
        public void setLowerBoundNet(Double v) { this.lowerBoundNet = v; }
    }
}
