# Chat Safety & Retention Features

## Overview

Enhanced chat functionality with Instagram/Snapchat/WhatsApp-inspired features for user safety and message management.

## Features

### 1. 🚨 Report User in Chat

- Accessible via three-dot menu in chat header
- Same reporting flow as posts with 9 report categories
- Anonymous reporting to maintain privacy
- Reports stored in Firestore for moderation review

### 2. 🚫 Block User in Chat

- Block users directly from chat conversations
- Multi-step confirmation process with reason selection
- Automatic report submission when blocking
- Blocked users can't send messages or see your content
- Navigates back to chat list after blocking

### 3. ⏱️ Message Timer (Retention Settings)

Snapchat/WhatsApp-style disappearing messages with 4 options:

#### Retention Periods

- **24 Hours**: Messages auto-delete after 1 day
- **1 Week**: Messages auto-delete after 7 days
- **1 Month**: Messages auto-delete after 30 days
- **Forever**: Messages never auto-delete (default)

#### Implementation Details

- Setting stored in chat document: `messageRetention` field
- Applied to **future messages only** (doesn't affect existing messages)
- Clean UI with icons for each period
- Real-time updates when changed

## User Interface

### Chat Settings Bottom Sheet

**Access**: Tap three-dot menu (⋮) in chat header

**Main Menu**:

- 🕐 Message Timer → Opens retention period selector
- 🚩 Report User → Opens report flow
- 🚫 Block User → Opens block confirmation

**Platform-Specific Design**:

- iOS: Blur effect, 20px corners, compact spacing
- Android: Material 3 solid background, 16px corners
- Swipe down to dismiss
- Smooth slide-up animations

### Message Timer Screen

- Radio button selection
- Visual icons for each period
- Description of what each period does
- Footer note about future-only application

## Technical Implementation

### Database Structure

```typescript
// Chat document
{
  id: string;
  participants: string[];
  messageRetention?: "24h" | "1week" | "1month" | "forever";
  lastMessage: {...};
  createdAt: number;
  updatedAt: number;
}
```

### Components

#### ChatSettingsBottomSheet

**Location**: `components/bottomsheets/ChatSettingsBottomSheet.tsx`

- Two-tab interface: Settings → Retention
- Platform-specific styling
- Integrates with existing report/block flows

#### Message Retention Manager

**Location**: `utils/chatRetention.ts`

**Functions**:

- `cleanupChatMessages(chatId)`: Delete old messages for a chat
- `cleanupAllChats()`: Run cleanup across all chats
- `shouldDeleteMessage(chatId, timestamp)`: Check if message expired
- `getRetentionDescription(period)`: Human-readable description

### Integration Points

#### Chat Screen Updates

**File**: `app/chat/[id].tsx`

**Added**:

- Menu button in header (both iOS/Android)
- State management for bottom sheets
- Retention setting fetch/update
- Report and block handlers
- Integration with existing bottom sheets

**Imports**:

```typescript
import ChatSettingsBottomSheet from "@/components/bottomsheets/ChatSettingsBottomSheet";
import ReportBottomSheet from "@/components/bottomsheets/ReportBottomSheet";
import BlockUserBottomSheet from "@/components/bottomsheets/BlockUserBottomSheet";
```

## Background Cleanup

### Scheduled Job Setup

The message retention system requires a background job to delete expired messages.

**Recommended Implementation**:

1. **Firebase Cloud Functions** (Preferred):

```typescript
import * as functions from "firebase-functions";
import { cleanupAllChats } from "./utils/chatRetention";

export const cleanupExpiredMessages = functions.pubsub
  .schedule("every 6 hours")
  .onRun(async (context) => {
    const result = await cleanupAllChats();
    console.log(`Cleanup: ${result.deletedMessages} messages deleted`);
    return null;
  });
```

2. **Alternative: Client-side on app launch**:

```typescript
// In app initialization
import { cleanupChatMessages } from "@/utils/chatRetention";

// Clean current chat when opening
useEffect(() => {
  if (chatId) {
    cleanupChatMessages(chatId);
  }
}, [chatId]);
```

### Performance Considerations

- Cleanup runs asynchronously
- Uses Firestore batch operations
- Queries only expired messages (where clauses)
- Recommended frequency: Every 6-12 hours
- No impact on user experience

## Usage Example

### Setting Message Timer

```typescript
// In chat screen
const handleRetentionChange = async (period: ChatRetentionPeriod) => {
  const chatRef = doc(db, "chats", chatId);
  await updateDoc(chatRef, {
    messageRetention: period,
  });
};
```

### Reporting User

```typescript
const handleReport = async (reason: ReportReason, description: string) => {
  await addDoc(collection(db, "reports"), {
    reporterId: currentUserId,
    contentId: chatId,
    contentType: "chat",
    contentOwnerId: otherUserId,
    reason,
    description,
    status: "pending",
    createdAt: Date.now(),
  });
};
```

### Blocking User

```typescript
const handleBlock = async (reason: string) => {
  await setDoc(doc(db, "users", currentUserId, "blockedUsers", otherUserId), {
    blockedUserId: otherUserId,
    blockedAt: Date.now(),
    reason,
  });

  // Auto-report
  await addDoc(collection(db, "reports"), {
    reporterId: currentUserId,
    contentType: "chat",
    contentOwnerId: otherUserId,
    reason: "harassment",
    createdAt: Date.now(),
  });
};
```

## Firestore Security Rules

Add these rules to protect chat retention settings:

```javascript
match /chats/{chatId} {
  allow read: if request.auth != null &&
    request.auth.uid in resource.data.participants;

  allow update: if request.auth != null &&
    request.auth.uid in resource.data.participants &&
    // Only allow updating retention and lastMessage
    request.resource.data.diff(resource.data)
      .affectedKeys()
      .hasOnly(['messageRetention', 'lastMessage', 'lastMessageTimestamp']);

  match /messages/{messageId} {
    allow read: if request.auth != null &&
      request.auth.uid in get(/databases/$(database)/documents/chats/$(chatId)).data.participants;
    allow create: if request.auth != null &&
      request.auth.uid in get(/databases/$(database)/documents/chats/$(chatId)).data.participants;
  }
}
```

## Testing Checklist

- [ ] Open chat and tap three-dot menu
- [ ] Settings sheet appears with all options
- [ ] Change message timer setting
- [ ] Verify retention saved to Firestore
- [ ] Test report user flow from chat
- [ ] Test block user flow from chat
- [ ] Verify blocking navigates back to chat list
- [ ] Test swipe-to-dismiss on bottom sheets
- [ ] Verify platform-specific styling (iOS blur vs Android solid)
- [ ] Check that retention only affects new messages

## Future Enhancements

1. **Visual Indicators**: Show timer icon next to messages
2. **Countdown Display**: Show when message will disappear
3. **Read Receipts**: Show when message was read before deletion
4. **Bulk Retention**: Set default retention for all new chats
5. **Export Before Delete**: Allow exporting messages before expiration
6. **Retention Notifications**: Warn users before messages disappear

## Notes

- Message retention is **per-chat** setting (both users see same setting)
- Only chat participants can change retention
- Retention changes are immediate but only affect future messages
- Deleted messages cannot be recovered
- Report/block actions are logged for safety
- All bottom sheets follow app's platform-specific design system
