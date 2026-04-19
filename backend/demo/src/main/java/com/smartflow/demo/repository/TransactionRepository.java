package com.smartflow.demo.repository;

import com.smartflow.demo.model.Transaction;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface TransactionRepository extends JpaRepository<Transaction, Long> {
    List<Transaction> findAllByOrderByDateDesc();
    List<Transaction> findByUserIdOrderByDateDesc(Long userId);
    List<Transaction> findByUserId(Long userId);
}
