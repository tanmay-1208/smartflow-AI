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
    public Map<String, Object> getSummary(@RequestHeader(value = "X-User-Id", required = false) Long userId) {
        return dashboardService.getSummary(userId);
    }

    // GET /api/dashboard/cashflow-chart
    @GetMapping("/cashflow-chart")
    public List<Map<String, Object>> getCashflowChart(@RequestHeader(value = "X-User-Id", required = false) Long userId) {
        return dashboardService.getCashflowChart(userId);
    }
}

