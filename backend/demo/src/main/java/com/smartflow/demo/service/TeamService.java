package com.smartflow.demo.service;

import com.smartflow.demo.model.Team;
import com.smartflow.demo.model.User;
import com.smartflow.demo.repository.TeamRepository;
import com.smartflow.demo.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class TeamService {

    private final TeamRepository teamRepository;
    private final UserRepository userRepository;

    public TeamService(TeamRepository teamRepository, UserRepository userRepository) {
        this.teamRepository = teamRepository;
        this.userRepository = userRepository;
    }

    @Transactional
    public Map<String, Object> createTeam(String name, Long ownerId) {
        User owner = userRepository.findById(ownerId)
            .orElseThrow(() -> new RuntimeException("User not found"));

        // Generate unique 6-char invite code
        String inviteCode = generateInviteCode();

        Team team = new Team();
        team.setName(name);
        team.setInviteCode(inviteCode);
        team.setOwnerId(ownerId);
        team = teamRepository.save(team);

        // Auto-join the owner
        owner.setTeamId(team.getId());
        userRepository.save(owner);

        return Map.of(
            "teamId", team.getId(),
            "name", team.getName(),
            "inviteCode", team.getInviteCode(),
            "message", "Team created! Share the invite code: " + inviteCode
        );
    }

    @Transactional
    public Map<String, Object> joinTeam(String inviteCode, Long userId) {
        Team team = teamRepository.findByInviteCode(inviteCode.toUpperCase().trim())
            .orElseThrow(() -> new RuntimeException("Invalid invite code"));

        User user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found"));

        if (user.getTeamId() != null) {
            throw new RuntimeException("You are already in a team. Leave first to join a new one.");
        }

        user.setTeamId(team.getId());
        userRepository.save(user);

        return Map.of(
            "teamId", team.getId(),
            "teamName", team.getName(),
            "message", "Successfully joined team: " + team.getName()
        );
    }

    @Transactional
    public Map<String, Object> leaveTeam(Long userId) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found"));

        if (user.getTeamId() == null) {
            throw new RuntimeException("You are not in a team");
        }

        user.setTeamId(null);
        userRepository.save(user);

        return Map.of("message", "Left the team successfully");
    }

    public Map<String, Object> getTeamInfo(Long userId) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found"));

        if (user.getTeamId() == null) {
            return Map.of("hasTeam", false);
        }

        Team team = teamRepository.findById(user.getTeamId())
            .orElseThrow(() -> new RuntimeException("Team not found"));

        List<User> members = userRepository.findByTeamId(team.getId());
        List<Map<String, Object>> memberList = members.stream()
            .map(m -> {
                Map<String, Object> map = new HashMap<>();
                map.put("id", m.getId());
                map.put("name", m.getName());
                map.put("email", m.getEmail());
                map.put("businessName", m.getBusinessName());
                map.put("isOwner", m.getId().equals(team.getOwnerId()));
                return map;
            })
            .collect(Collectors.toList());

        Map<String, Object> result = new HashMap<>();
        result.put("hasTeam", true);
        result.put("teamId", team.getId());
        result.put("teamName", team.getName());
        result.put("inviteCode", team.getInviteCode());
        result.put("isOwner", userId.equals(team.getOwnerId()));
        result.put("members", memberList);
        return result;
    }

    /**
     * Get all user IDs that should be included in data queries.
     * If user is in a team, returns ALL team member IDs.
     * If solo, returns just this user's ID.
     */
    public List<Long> getEffectiveUserIds(Long userId) {
        User user = userRepository.findById(userId).orElse(null);
        if (user == null || user.getTeamId() == null) {
            return List.of(userId);
        }

        return userRepository.findByTeamId(user.getTeamId())
            .stream()
            .map(User::getId)
            .collect(Collectors.toList());
    }

    private String generateInviteCode() {
        String chars = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
        Random random = new Random();
        StringBuilder code = new StringBuilder();
        for (int i = 0; i < 6; i++) {
            code.append(chars.charAt(random.nextInt(chars.length())));
        }
        // Ensure uniqueness
        while (teamRepository.findByInviteCode(code.toString()).isPresent()) {
            code = new StringBuilder();
            for (int i = 0; i < 6; i++) {
                code.append(chars.charAt(random.nextInt(chars.length())));
            }
        }
        return code.toString();
    }
}
