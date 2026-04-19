package com.smartflow.demo.controller;

import com.smartflow.demo.service.TeamService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequestMapping("/api/teams")
@CrossOrigin(origins = "*")
public class TeamController {

    private final TeamService teamService;

    public TeamController(TeamService teamService) {
        this.teamService = teamService;
    }

    @PostMapping
    public ResponseEntity<?> createTeam(
        @RequestHeader("X-User-Id") Long userId,
        @RequestBody Map<String, String> body
    ) {
        try {
            String name = body.getOrDefault("name", "My Team");
            return ResponseEntity.ok(teamService.createTeam(name, userId));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/join")
    public ResponseEntity<?> joinTeam(
        @RequestHeader("X-User-Id") Long userId,
        @RequestBody Map<String, String> body
    ) {
        try {
            String code = body.get("inviteCode");
            if (code == null || code.isBlank()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Invite code is required"));
            }
            return ResponseEntity.ok(teamService.joinTeam(code, userId));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/leave")
    public ResponseEntity<?> leaveTeam(@RequestHeader("X-User-Id") Long userId) {
        try {
            return ResponseEntity.ok(teamService.leaveTeam(userId));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/me")
    public ResponseEntity<?> getMyTeam(@RequestHeader("X-User-Id") Long userId) {
        try {
            return ResponseEntity.ok(teamService.getTeamInfo(userId));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}
