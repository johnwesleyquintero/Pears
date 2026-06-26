# Security Specification for Pears Firestore Architecture

## 1. Data Invariants
- A user profile (`User`) cannot exist without matching document ID and `UserID`.
- A post (`Post`) must reference a valid author `UserID` and have visibility set to `public`, `followers`, or `private`.
- A like (`Like`), comment (`Comment`), or bookmark (`Bookmark`) must have a valid `PostID` and actor `UserID`.
- Terminal fields like `PostID`, `UserID`, and `CreatedAt` are strictly immutable after creation.
- Only authenticated users can perform mutations on their own entities (`request.auth.uid == incoming().UserID`).

## 2. The "Dirty Dozen" Payloads (Adversarial Testing)
1. **ID Poisoning**: Attempting to create a post with a 2KB junk string as `PostID`.
2. **Identity Spoofing**: User A attempting to create a post or comment with `UserID` set to User B.
3. **Shadow Field Injection**: Attempting to inject unrequested admin/role properties during post creation (`isAdmin: true`).
4. **Immutability Violation**: Attempting to modify `CreatedAt` or `UserID` on an existing post.
5. **Unauthorized Deletion**: User A attempting to delete User B's post or comment.
6. **Unauthenticated Write**: Anonymous/unauthenticated user attempting to create a post or like.
7. **Type Tampering**: Attempting to update `likesCount` with a string `"lots"` instead of a number.
8. **Size Flooding**: Attempting to write a 100KB caption string to exhaust storage/bandwidth.
9. **Private Post Scraping**: Unauthenticated user querying list of private posts.
10. **Bookmark Snooping**: User A querying bookmarks owned by User B.
11. **Notification Hijacking**: User A attempting to read or mark notifications belonging to User B.
12. **Status Shortcutting**: Attempting to alter media visibility directly without ownership verification.
