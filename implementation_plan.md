# Workspaces & Team Collaboration Implementation Plan

## Goal Description
Currently, every user has their own isolated data (`userId`). To support real-time team collaboration correctly, we need to introduce **Workspaces**. Instead of sharing data globally, users will have an `inviteCode`. When another user enters this code, they join the original user's workspace. All users in the same workspace will share the same `workspaceId` and interact with the same set of transactions, dashboard, and AI.

> [!IMPORTANT]  
> **Security & Isolation**: The Supabase realtime channels will also be partitioned by `workspaceId` so that teams only see their own members' online status and activity.

## Proposed Changes

---

### Backend Components

#### [MODIFY] `User` Entity (`User.java`)
- Add `String inviteCode` (unique 8-character string, e.g., "TEAM1234").
- Add `Long workspaceId` (points to the creator's `userId`).

#### [MODIFY] `AuthController` (`AuthController.java`)
- **Registration**: Generate an `inviteCode`. Set the user's `workspaceId` to their own `userId` initially.
- **Login**: Return `workspaceId` and `inviteCode` in the JSON response.
- **New Endpoint (`/api/auth/join`)**: Accepts an `inviteCode` and the current `userId`. Overwrites the current user's `workspaceId` to match the target workspace.

#### [MODIFY] `DataMigrationRunner` (`DataMigrationRunner.java`)
- Update existing users in the database to ensure they have an `inviteCode` and their `workspaceId = id`.

#### [MODIFY] `Controllers` (Dashboard, Transaction, Forecast, AI)
- Change `@RequestHeader("X-User-Id")` to `@RequestHeader("X-Workspace-Id")`.
- The database `Transaction.userId` column will seamlessly act as the `workspaceId` without requiring a slow database migration.

---

### Frontend Components

#### [MODIFY] `AuthContext` (`AuthContext.jsx`)
- Store and expose the `user.workspaceId` and `user.inviteCode`.
- Create a `joinWorkspace` function that calls the backend and updates the context.

#### [MODIFY] `API Clients` (e.g., `api/transactions.js` & Page fetches)
- Send `X-Workspace-Id: user.workspaceId` in headers instead of `X-User-Id: token`.

#### [MODIFY] `Collaboration Hook` (`useCollaboration.js`)
- Update the channel connection from `channel("collaboration")` to `channel("workspace-" + user.workspaceId)`. This guarantees team-level isolation for live activity and online presence.

#### [NEW] `WorkspacePanel` / Invite UI (`Sidebar` / `CollaborationPanel`)
- Add an **"Invite Team"** button showing the user's unique `inviteCode`.
- Add a **"Join Workspace"** input flow allowing a user to submit a peer's invite code. Upon success, the app reloads with the new team's shared data.

---

## Open Questions
- Do you want users who join someone else's workspace to "lose" their old private transactions, or is it okay if their transactions are effectively orphaned when they switch workspaces? (For a hackathon MVP, just overwriting the `workspaceId` to the team's is usually the easiest).

## Verification Plan
1. **Automated / Manual**: Create two accounts. Account A generates a transaction. Account B starts with zero.
2. **Action**: Account B clicks "Join Workspace" and enters Account A's invite code.
3. **Verify**: Account B's dashboard instantly loads Account A's transactions.
4. **Verify**: Account A and Account B see each other "Online" in the sidebar. Account C (in a different workspace) sees neither of them.
