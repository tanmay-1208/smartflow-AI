package com.smartflow.demo.repository;

import com.smartflow.demo.model.Transaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;

public interface TransactionRepository extends JpaRepository<Transaction, Long> {
    List<Transaction> findAllByOrderByDateDesc();
    List<Transaction> findByUserIdOrderByDateDesc(Long userId);
    List<Transaction> findByUserId(Long userId);

    // Team-scoped queries: fetch transactions for multiple team members
    List<Transaction> findByUserIdInOrderByDateDesc(List<Long> userIds);
    List<Transaction> findByUserIdIn(List<Long> userIds);

    // Assign all unowned transactions to a user (used by migration)
    @Modifying
    @Query("UPDATE Transaction t SET t.userId = :userId WHERE t.userId IS NULL")
    int assignUnownedTransactions(@Param("userId") Long userId);
}
