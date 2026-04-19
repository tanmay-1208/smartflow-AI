package com.smartflow.demo.service;

import com.smartflow.demo.model.Transaction;
import com.smartflow.demo.repository.TransactionRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Service
public class TransactionService {

    private final TransactionRepository transactionRepository;
    private final TeamService teamService;

    public TransactionService(TransactionRepository transactionRepository, TeamService teamService) {
        this.transactionRepository = transactionRepository;
        this.teamService = teamService;
    }

    public List<Transaction> getAllTransactions() {
        return transactionRepository.findAllByOrderByDateDesc();
    }

    public List<Transaction> getTransactionsByUser(Long userId) {
        // Get team-scoped user IDs (returns just [userId] if not in a team)
        List<Long> effectiveIds = teamService.getEffectiveUserIds(userId);
        if (effectiveIds.size() == 1) {
            return transactionRepository.findByUserIdOrderByDateDesc(effectiveIds.get(0));
        }
        return transactionRepository.findByUserIdInOrderByDateDesc(effectiveIds);
    }

    public List<Transaction> getTransactionsForTeam(Long userId) {
        List<Long> effectiveIds = teamService.getEffectiveUserIds(userId);
        if (effectiveIds.size() == 1) {
            return transactionRepository.findByUserId(effectiveIds.get(0));
        }
        return transactionRepository.findByUserIdIn(effectiveIds);
    }

    public Transaction addTransaction(Transaction transaction) {
        return transactionRepository.save(transaction);
    }

    public void deleteTransaction(Long id) {
        transactionRepository.deleteById(id);
    }

    @Transactional
    public int claimUnownedTransactions(Long userId) {
        return transactionRepository.assignUnownedTransactions(userId);
    }
}