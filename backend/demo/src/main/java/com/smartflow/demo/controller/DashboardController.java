package com.smartflow.demo.controller;

import com.smartflow.demo.service.DashboardService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/dashboard")
@CrossOrigin(origins = "*")
public class DashboardController {

    @Autowired
    private DashboardService dashboardService;

    // GET /api/dashboard/summary
    @GetMapping("/summary")
    public Map<String, Object> getSummary() {
        return dashboardService.getSummary();
    }

    // GET /api/dashboard/cashflow-chart
    @GetMapping("/cashflow-chart")
    public List<Map<String, Object>> getCashflowChart() {
        return dashboardService.getCashflowChart();
    }
}

