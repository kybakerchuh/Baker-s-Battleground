# Security Specification & Threat Model — Baker's Battleground

## 1. Data Invariants
1. **Single Owner Isolation (`/users/{userId}`):** Every `/users/{userId}` document and `/users/{userId}/games/{gameId}` subcollection document belongs strictly to `userId == request.auth.uid`, with `request.auth.token.email_verified == true` for writes.
2. **No Blanket Private User Listing / Cross-User Reads:** Users cannot list `/users` or read another player's private save profile or game history.
3. **PII-Free Public Leaderboard Split Collection (`/leaderboard/{userId}`):** Public leaderboard documents store ONLY `uid`, `firstName` (`<= 40` chars), and integer counters (`totalKills`, `totalCorrect`, `totalAttempted`, `gamesPlayed`, `victories`, `updatedAt`). Full display names, emails, and photo URLs are never stored in `/leaderboard`.
4. **Owner-Verified Monotonic Leaderboard Writes:** Only verified owner `userId == request.auth.uid` can create or update `/leaderboard/{userId}`, atomically linked to `/users/{userId}` via `existsAfter`, with non-decreasing `totalKills`, `totalCorrect`, `totalAttempted`, `gamesPlayed`, and `victories`.
5. **Immutable Identity & Timestamps:** `uid` and `createdAt` cannot be changed after creation. `createdAt`, `updatedAt`, and `playedAt` must equal `request.time`.
6. **Strict Bounds & Schema:** Every string has bounded `.size()`, every ID matches `^[a-zA-Z0-9_\-]+$`, integer counters cannot be negative, rates stay in `[0, 100]`, and `totalCorrect <= totalAttempted` / `correct <= attempted` always holds.
7. **Immutable Game Logs:** Historical `games/{gameId}` records cannot be updated or deleted once recorded, and leaderboard records cannot be deleted by clients.

## 2. The "Dirty Dozen" Attack Payloads (All Must Return PERMISSION_DENIED)
1. **Unauthenticated Read/Write on Private User Data:** Reading or writing `/users/userA` with `request.auth == null`.
2. **Unverified Email Token:** Writing `/users/userA` or `/leaderboard/userA` when `request.auth.token.email_verified == false`.
3. **Cross-User Read (IDOR):** User B reading `/users/userA` or `/users/userA/games/g1`.
4. **Cross-User Private Collection List:** User A listing `/users` to enumerate all private user profiles.
5. **UID Spoofing on Create:** User A creating `/users/userA` or `/leaderboard/userA` with `uid: "userB"`, or writing `/leaderboard/userB`.
6. **Shadow / Ghost Field / PII Injection:** Creating or updating `/users/userA` or `/leaderboard/userA` with unexpected fields (`isAdmin: true`, `email: "..."`, `photoURL` in `/leaderboard`).
7. **Immutable Field Tampering (`uid` / `createdAt`):** Updating `/users/userA` or `/leaderboard/userA` to change `uid` or backdate `createdAt`.
8. **Fake Client Timestamp:** Creating or updating with `updatedAt != request.time`.
9. **Resource / ID Poisoning (>128 char ID / Oversized String):** Writing `/leaderboard/` + `'a'.repeat(200)` or injecting a 200-char string into `firstName` (`maxLength: 40`).
10. **Negative / Monotonic Counter Tampering:** Setting `totalKills: -5`, `totalCorrect > totalAttempted`, or decrementing `totalKills` / `totalCorrect` below existing values.
11. **Orphan Subcollection / Leaderboard Create:** Creating `/users/userA/games/g1` or `/leaderboard/userA` without `/users/userA` existing after the transaction.
12. **History / Leaderboard Deletion:** Attempting `update` or `delete` on `/users/userA/games/g1`, or `delete` on `/leaderboard/userA`.
