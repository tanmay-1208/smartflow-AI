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

    // Include transactions that belong to this user OR have no owner (legacy data)
    @Query("SELECT t FROM Transaction t WHERE t.userId = :userId OR t.userId IS NULL ORDER BY t.date DESC")
    List<Transaction> findByUserIdOrUnassignedOrderByDateDesc(@Param("userId") Long userId);

    @Query("SELECT t FROM Transaction t WHERE t.userId = :userId OR t.userId IS NULL")
    List<Transaction> findByUserIdOrUnassigned(@Param("userId") Long userId);

    // Assign all unowned transactions to a user
    @Modifying
    @Query("UPDATE Transaction t SET t.userId = :userId WHERE t.userId IS NULL")
    int assignUnownedTransactions(@Param("userId") Long userId);
}
