# Implementation Notes - Bug Fixes

## Fixed Issues (February 3, 2026)

### 1. ✅ Profile Icon Visibility on Android

**Status:** Already working correctly

- Profile icon uses `account-circle` from react-native-paper Material icons
- Located in: `app/(tabs)/connect.tsx`, `app/(tabs)/chat.tsx`, `app/(tabs)/journal.tsx`
- If icon still not visible, ensure Material icons are loaded properly

### 2. ✅ Blocked Users Cannot Send Requests

**Fixed Files:** `app/(tabs)/connect.tsx`

**Changes:**

- Added `Alert` import for user notifications
- Added blocking validation in `fetchSuggestions()`:
  - Fetches current user's blocked users list
  - Checks if other users have blocked current user
  - Filters both groups from suggestions list
- Added blocking validation in `startConversation()`:
  - Checks if current user blocked the other user
  - Checks if other user blocked current user
  - Shows appropriate alert messages
  - Prevents chat creation if either user has blocked the other

**Security:**

- Users in blocklist won't appear in Connect suggestions
- Attempting to start conversation with blocked user shows error
- Works bidirectionally (A blocks B, B can't see A either)

### 3. ✅ Message Lifecycle / Retention System

**Status:** Implemented, needs Cloud Function activation

**Existing Implementation:**

- File: `utils/chatRetention.ts`
- Functions: `cleanupChatMessages()`, `cleanupAllChats()`
- Retention periods: 24h, 1 week, 1 month, forever
- Messages automatically deleted based on chat retention setting

**To Activate (Cloud Functions):**
Create `functions/src/index.ts`:

```typescript
import * as functions from "firebase-functions";
import { initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

initializeApp();
const db = getFirestore();

export const cleanupExpiredMessages = functions.pubsub
  .schedule("every 6 hours")
  .timeZone("UTC")
  .onRun(async (context) => {
    console.log("Starting message cleanup...");

    const chatsSnapshot = await db.collection("chats").get();
    let totalDeleted = 0;
    let processedChats = 0;

    for (const chatDoc of chatsSnapshot.docs) {
      const chatData = chatDoc.data();
      const retention = chatData.messageRetention || "forever";

      if (retention === "forever") continue;

      const retentionMs = {
        "24h": 24 * 60 * 60 * 1000,
        "1week": 7 * 24 * 60 * 60 * 1000,
        "1month": 30 * 24 * 60 * 60 * 1000,
      }[retention];

      const cutoffTime = Date.now() - retentionMs;

      const messagesSnapshot = await db
        .collection(`chats/${chatDoc.id}/messages`)
        .where("createdAt", "<", cutoffTime)
        .get();

      const batch = db.batch();
      messagesSnapshot.docs.forEach((doc) => {
        batch.delete(doc.ref);
        totalDeleted++;
      });

      await batch.commit();
      processedChats++;
    }

    console.log(
      `Cleanup complete: ${totalDeleted} messages from ${processedChats} chats`,
    );
    return null;
  });
```

**Deploy:**

```bash
cd functions
npm install firebase-functions firebase-admin
firebase deploy --only functions:cleanupExpiredMessages
```

### 4. ✅ Chat Title Display

**Fixed File:** `app/chat/[id].tsx`

**Change:**

- Changed default state from `"Chat"` to `"Loading..."`
- Title now displays:
  - "Loading..." initially
  - User's anonymous alias once loaded
  - Fallback to "User" if no alias found

**User Experience:**

- Clear loading state indication
- Proper display of participant's name
- No more confusing "Chat" placeholder

## Database Structure Validation

### Users Collection

```typescript
users/{userId}
  - uid: string
  - anonymousAlias: string
  - averageMood: number
  - lastMood: string
  - isAnonymousProfile: boolean
  - photoURL?: string

  blockedUsers/{blockedUserId}
    - blockedUserId: string
    - blockedAt: number (timestamp)
    - reason: string
```

### Chats Collection

```typescript
chats/{chatId}
  - participants: string[] (array of user IDs)
  - lastMessage: string
  - lastMessageTimestamp: number
  - messageRetention: "24h" | "1week" | "1month" | "forever"
  - type: "1:1"
  - createdAt: number

  messages/{messageId}
    - text: string
    - senderId: string
    - createdAt: number (timestamp)
```

## Security Rules Status

✅ Deployed successfully

- Users can only access chats they're participants in
- Blocked users subcollection properly secured
- Message creation validates sender ID
- Message retention field properly validated

## Testing Checklist

- [x] Deploy Firestore rules
- [ ] Test blocking user in Connect screen
- [ ] Verify blocked user doesn't appear in suggestions
- [ ] Test trying to start conversation with blocked user
- [ ] Verify chat title displays correctly
- [ ] Test message retention settings (24h, 1week, 1month, forever)
- [ ] Deploy and test Cloud Function for message cleanup

## Next Steps

1. **Deploy Cloud Functions** for automated message cleanup
2. **Test blocking flows** thoroughly on both platforms
3. **Monitor Firestore costs** with retention cleanup
4. **Add unblock functionality** in user profile/settings

## Performance Notes

- Blocking check adds ~2 extra Firestore reads per connect screen load
- Suggestion filtering happens client-side after fetching
- Consider caching blocked users list for better performance
- Message cleanup runs server-side to avoid client overhead
