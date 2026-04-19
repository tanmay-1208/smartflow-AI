package com.smartflow.demo.controller;

import com.smartflow.demo.model.Transaction;
import com.smartflow.demo.service.TransactionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/transactions")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class TransactionController {

    private final TransactionService transactionService;

    @GetMapping
    public List<Transaction> getAll(@RequestHeader(value = "X-User-Id", required = false) Long userId) {
        if (userId != null) {
            return transactionService.getTransactionsByUser(userId);
        }
        return transactionService.getAllTransactions();
    }

    @PostMapping
    public Transaction add(@RequestBody Transaction transaction) {
        return transactionService.addTransaction(transaction);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable Long id) {
        transactionService.deleteTransaction(id);
        return ResponseEntity.ok().build();
    }

    // One-time migration: assign unowned transactions to the requesting user
    @PostMapping("/claim")
    public ResponseEntity<?> claimUnowned(@RequestHeader(value = "X-User-Id") Long userId) {
        int count = transactionService.claimUnownedTransactions(userId);
        return ResponseEntity.ok(Map.of("claimed", count, "message", count + " transactions assigned to your account"));
    }
}