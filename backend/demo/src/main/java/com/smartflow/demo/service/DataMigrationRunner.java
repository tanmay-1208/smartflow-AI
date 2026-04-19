package com.smartflow.demo.service;

import com.smartflow.demo.model.User;
import com.smartflow.demo.repository.TransactionRepository;
import com.smartflow.demo.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

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
        // One-time migration: assign all unowned transactions to tanmay@gmail.com
        Optional<User> tanmay = userRepository.findByEmail("tanmay@gmail.com");
        if (tanmay.isPresent()) {
            int count = transactionRepository.assignUnownedTransactions(tanmay.get().getId());
            if (count > 0) {
                System.out.println("[Migration] Assigned " + count + " orphaned transactions to tanmay@gmail.com (ID: " + tanmay.get().getId() + ")");
            }
        }
    }
}
