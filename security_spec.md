# Firestore Security Specification (`rankings` + Web Platform Data)

## 1. Data Invariants
1. **Student Classment (`/rankings/{rankingId}`)**: First-name-only leaderboard record (`firstName`, `name`, `grade`, `points`, `avatar`, `badge`, `testsCompleted`, `ownerUid`, `createdAt`, `updatedAt`). `ownerUid == request.auth.uid`, `grade in ['1AM','2AM','3AM','4AM']`, `0 <= points <= 1000000`.
2. **Curriculum Web Content (`/lessons/{lessonId}`, `/exercises/{exerciseId}`, `/videos/{videoId}`, `/custom_tests/{testId}`)**:
   - Readable (`get`, `list`) only by authenticated users (`isSignedIn()`), with query constraints enforced on `resource.data`.
   - Writable (`create`, `update`, `delete`) strictly by verified teacher administrators (`isAdmin()`).
   - Every list array (`keyConcepts`, `steps`, `scientificTerms`, `learningOutcomes`, `checkpoints`, `scenes`, `questions`) is strictly bounded in size and attachment `dataUrl` is capped at `<= 750000` chars to remain within Firestore's 1MB document limit.
3. **Educational Resources (`/resources/{resourceId}`)**:
   - Readable by authenticated users with `downloadsCount >= 0`.
   - Creatable by verified signed-in users with `ownerUid == request.auth.uid`; updatable/deletable by owner or admin (or verified download counter increment).
4. **Forum Topics (`/forum_topics/{topicId}`)**:
   - Readable by authenticated users with `upvotes >= 0`.
   - Creatable by verified signed-in users (`ownerUid == request.auth.uid`); community interactions allow strictly allowlisted fields (`upvotes`, `replies`, `isReported`, `updatedAt`); deletion limited to owner or admin.
5. **Direct Student-Teacher Messages (`/direct_messages/{messageId}`)**:
   - Private Q&A isolation: `get` and `list` restricted strictly to `existing().ownerUid == request.auth.uid || isAdmin()`.
   - Creation enforces `status == 'pending'` and `ownerUid == request.auth.uid`. Only `isAdmin()` can update `status` to `'answered'` with `replyText`.
6. **Global Rules**: Default deny catch-all `/{document=**}`, `isValidId()` regex guard on all document paths, strict `hasAll` + `hasOnly` schema helpers, immutable `ownerUid`/`createdAt`, and server-timestamp enforcement (`request.time`).

## 2. Dirty Dozen Adversarial Payloads (All Must Return PERMISSION_DENIED)
1. Unauthenticated read/list on `/lessons`, `/exercises`, `/videos`, `/custom_tests`, `/resources`, `/forum_topics`, `/direct_messages`, or `/rankings`.
2. Non-admin student attempting to create, overwrite, or delete `/lessons/{id}`, `/exercises/{id}`, `/videos/{id}`, or `/custom_tests/{id}`.
3. Student attempting to read or list another student's `/direct_messages/{otherId}`.
4. Student creating a `/direct_messages/{id}` pre-marked `status: 'answered'` or forged `ownerUid`.
5. Unverified email token (`email_verified: false`) attempting any write operation.
6. Oversized document ID (`> 128` chars or invalid characters) on any collection (ID poisoning).
7. Shadow/ghost field injection (`{ ..., isAdmin: true }`) blocked by `hasOnly(...)`.
8. Unbounded array or oversized `attachment.dataUrl` (`> 750000` bytes) on `/lessons/{id}`.
9. Invalid `grade` (`"5AM"`) outside allowed enum values.
10. Client-forged timestamps (`createdAt` or `updatedAt != request.time`).
11. Mutating immutable `ownerUid` or `createdAt` on update.
12. Non-owner attempting to delete another user's `/resources/{id}`, `/forum_topics/{id}`, or `/rankings/{id}`.
