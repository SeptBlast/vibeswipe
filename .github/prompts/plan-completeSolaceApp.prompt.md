# Plan: Complete Solace Social Media App

Building on your existing foundation (~70% complete), this plan will implement the 5 missing core features with mood-based filtering, full anonymity controls, media uploads, improved chat initiation, and GDPR compliance. The app already has solid journal tracking with streaks, basic feed/chat functionality, and partial anonymity support.

## Steps

1. **Implement mood-based feed filtering and connection discovery** — Add mood filter UI to [app/(tabs)/index.tsx](<app/(tabs)/index.tsx>), refine the matching algorithm in [app/(tabs)/connect.tsx](<app/(tabs)/connect.tsx>) to use last journal mood + weekly average, and enable chat initiation from connect screen by creating Firestore chat documents.

2. **Complete anonymity system across all features** — Wire up the anonymous toggle in [app/post/new.tsx](app/post/new.tsx) (currently hardcoded to false), update [components/PostCard.tsx](components/PostCard.tsx) to respect `showAlias` from user profiles, and add anonymous display for comments in [app/feed/[id].tsx](app/feed/[id].tsx).

3. **Add media upload functionality for posts** — Integrate Firebase Storage for images/videos, implement image picker in [app/post/new.tsx](app/post/new.tsx), update [components/PostCard.tsx](components/PostCard.tsx) to display media galleries, and modify Firestore security rules for the storage bucket.

4. **Enable functional theming and improve UI consistency** — Persist dark mode preference using AsyncStorage in [contexts/AuthContext.tsx](contexts/AuthContext.tsx), apply theme throughout all screens, and extend glassmorphism to profile and connection screens for cohesive soothing aesthetics.

5. **Implement GDPR compliance features** — Add data export functionality to [app/profile/index.tsx](app/profile/index.tsx), implement account deletion with Firestore cleanup, create consent management for analytics/tracking, and update [app/profile/legal.tsx](app/profile/legal.tsx) with functional privacy controls.

6. **Enhance chat system with groups and media** — Build group chat creation UI, add typing indicators and read receipts to [app/chat/[id].tsx](app/chat/[id].tsx), enable media sharing in messages, and implement push notifications for new messages using Expo Notifications.

## Further Considerations

1. **Mood filtering granularity?** Option A: Simple mood category filter (happy/sad/neutral). Option B: Advanced slider range for mood scores. Option C: Combination with "similar mood" and "opposite mood" toggles for diverse connections.

2. **Anonymous profile discovery restrictions?** Should fully anonymous users (permanent alias mode) be excluded from certain features like direct messaging, or should they have full access with just hidden identity?

3. **Media storage costs and limits?** Recommend setting per-post media limits (e.g., 10MB images, 100MB videos) and implementing client-side compression before upload to Firebase Storage.

4. **Onboarding and user education?** Consider adding a first-launch tutorial explaining the mood-based matching concept and anonymity toggle benefits to improve user adoption.
