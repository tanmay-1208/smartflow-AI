package com.smartflow.demo.service;

import com.smartflow.demo.model.Transaction;
import com.smartflow.demo.model.User;
import com.smartflow.demo.repository.TransactionRepository;
import com.smartflow.demo.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Component
public class DataMigrationRunner implements CommandLineRunner {

    private final TransactionRepository transactionRepository;
    private final UserRepository userRepository;

    public DataMigrationRunner(TransactionRepository transactionRepository, UserRepository userRepository) {
        this.transactionRepository = transactionRepository;
        this.userRepository = userRepository;
    }

    @Override
    @Transactional
    public void run(String... args) {
        // Migration 1: Assign all unowned transactions to tanmay@gmail.com
        Optional<User> tanmay = userRepository.findByEmail("tanmay@gmail.com");
        if (tanmay.isPresent()) {
            int count = transactionRepository.assignUnownedTransactions(tanmay.get().getId());
            if (count > 0) {
                System.out.println("[Migration] Assigned " + count + " orphaned transactions to tanmay@gmail.com (ID: " + tanmay.get().getId() + ")");
            }
        }

        // Migration 2: Shift 2024 dates to 2025-2026 so dashboard shows current data
        List<Transaction> allTransactions = transactionRepository.findAll();
        int shifted = 0;
        for (Transaction t : allTransactions) {
            if (t.getDate() != null && t.getDate().getYear() == 2024) {
                // Shift forward by 2 years: Jan-Jun 2024 → Jan-Jun 2026
                // But to make it flow into current month, shift to Oct 2025 - Mar 2026
                LocalDate oldDate = t.getDate();
                // Map: Jan→Oct(-3), Feb→Nov(-3), Mar→Dec(-3), Apr→Jan(-3+1yr), May→Feb, Jun→Mar
                int newMonth = oldDate.getMonthValue() + 9; // shift +9 months
                int newYear = 2025;
                if (newMonth > 12) {
                    newMonth -= 12;
                    newYear = 2026;
                }
                int newDay = Math.min(oldDate.getDayOfMonth(), LocalDate.of(newYear, newMonth, 1).lengthOfMonth());
                LocalDate newDate = LocalDate.of(newYear, newMonth, newDay);
                t.setDate(newDate);
                transactionRepository.save(t);
                shifted++;
            }
        }
        if (shifted > 0) {
            System.out.println("[Migration] Shifted " + shifted + " transactions from 2024 to 2025-2026");
        }
    }
}
