# Firestore Security Specification (`rankings` Classment)

## 1. Data Invariants
1. Every document in `/rankings/{rankingId}` represents a single authenticated student's leaderboard (`classment`) record using first-name-only non-PII fields (`firstName`, `name`, `grade`, `points`, `avatar`, `badge`, `testsCompleted`, `ownerUid`, `createdAt`, `updatedAt`).
2. `rankingId` and `ownerUid` must match `^[a-zA-Z0-9_\-]+$` (<= 128 chars).
3. On creation, `ownerUid` MUST equal `request.auth.uid`, `email_verified` MUST be `true`, and `createdAt == request.time` and `updatedAt == request.time`.
4. On update, `ownerUid` and `createdAt` are immutable; only `firstName`, `name`, `grade`, `points`, `avatar`, `badge`, `testsCompleted`, and `updatedAt` may change (`updatedAt == request.time`), unless executed by a verified admin (`isAdmin()`).
5. `grade` is strictly restricted to `['1AM', '2AM', '3AM', '4AM']`.
6. `points` must be an integer/number between `0` and `1000000`; `testsCompleted` between `0` and `10000`.

## 2. Dirty Dozen Adversarial Payloads (All Must Return PERMISSION_DENIED)
1. Unauthenticated read/list on `/rankings`.
2. Unauthenticated write to `/rankings/user1`.
3. Spoofed `ownerUid` (`ownerUid != request.auth.uid`) on create.
4. Unverified email token (`email_verified: false`) attempting create/update.
5. Oversized document ID (`1500` chars) on `/rankings/{rankingId}` (ID poisoning).
6. Shadow/ghost field injection (`{ ..., isAdmin: true }`) blocked by `hasOnly(...)`.
7. Invalid `grade` (`"5AM"` or `"BEM"`) outside `['1AM', '2AM', '3AM', '4AM']`.
8. Negative or astronomical `points` (`points: -50` or `points: 999999999`).
9. Oversized `firstName` (`> 60` chars) or empty `firstName` (`""`).
10. Client-forged timestamps (`createdAt` or `updatedAt != request.time`).
11. Mutating immutable `ownerUid` or `createdAt` on update.
12. Non-owner student trying to delete or overwrite another student's `/rankings/{otherUid}` entry.
