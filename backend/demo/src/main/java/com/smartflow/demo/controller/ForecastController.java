package com.smartflow.demo.controller;

import com.smartflow.demo.model.ForecastResult;
import com.smartflow.demo.service.ForecastService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/forecast")
@RequiredArgsConstructor
public class ForecastController {

    private final ForecastService forecastService;

    @GetMapping
    public ResponseEntity<ForecastResult> getForecast(
            @RequestParam(defaultValue = "3") int months) {
        return ResponseEntity.ok(forecastService.forecast(months));
    }
}
