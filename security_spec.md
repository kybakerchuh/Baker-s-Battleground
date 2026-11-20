# Security Specification & Threat Model — Baker's Battleground

## 1. Data Invariants
1. **Single Owner Isolation:** Every `/users/{userId}` document and `/users/{userId}/games/{gameId}` subcollection document belongs strictly to `userId == request.auth.uid`, with `request.auth.token.email_verified == true`.
2. **No Blanket List / Cross-User Reads:** Users cannot list `/users` or read another player's save profile or game history.
3. **Immutable Identity & Timestamps:** `uid` and `createdAt` cannot be changed after creation. `createdAt`, `updatedAt`, and `playedAt` must equal `request.time`.
4. **Master Gate Integrity:** A `GameRunRecord` cannot be created in `/users/{userId}/games/{gameId}` unless the parent `/users/{userId}` document already exists.
5. **Strict Bounds & Schema:** Every string has bounded `.size()`, every ID matches `^[a-zA-Z0-9_\-]+$`, integer counters cannot be negative, rates stay in `[0, 100]`, and `totalCorrect <= totalAttempted` / `correct <= attempted` always holds.
6. **Immutable Game Logs:** Historical `games/{gameId}` records cannot be updated or deleted once recorded.

## 2. The "Dirty Dozen" Attack Payloads (All Must Return PERMISSION_DENIED)
1. **Unauthenticated Read/Write:** Reading or writing `/users/userA` with `request.auth == null`.
2. **Unverified Email Token:** Writing `/users/userA` when `request.auth.token.email_verified == false`.
3. **Cross-User Read (IDOR):** User B reading `/users/userA` or `/users/userA/games/g1`.
4. **Cross-User Collection List:** User A listing `/users` to enumerate all players.
5. **UID Spoofing on Create:** User A creating `/users/userA` with `uid: "userB"`.
6. **Shadow / Ghost Field Injection:** Creating or updating `/users/userA` with an unexpected field such as `isAdmin: true` or `unlockedAll: true`.
7. **Immutable Field Tampering (`uid` / `createdAt`):** Updating `/users/userA` to change `uid` or backdate `createdAt`.
8. **Fake Client Timestamp:** Creating `/users/userA` with `updatedAt` != `request.time`.
9. **Resource / ID Poisoning (>128 char ID):** Creating `/users/userA/games/` + `'a'.repeat(200)` or injecting a 2KB string into `displayName`.
10. **Negative / Invalid Counter Tampering:** Updating `totalCorrect: -5` or `totalCorrect: 500` when `totalAttempted: 10`, or `lastGameRate: 150`.
11. **Orphan Subcollection Create:** Creating `/users/userA/games/g1` when parent `/users/userA` does not exist.
12. **Game History Tampering / Deletion:** Attempting `update` or `delete` on `/users/userA/games/g1`.
