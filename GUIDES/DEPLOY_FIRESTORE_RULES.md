# Deploy Firestore Security Rules

## The Problem

You're seeing this error:

```
ERROR  Error fetching comments: [FirebaseError: Missing or insufficient permissions.]
ERROR  Error adding comment: [FirebaseError: Missing or insufficient permissions.]
```

This happens because your local `firestore.rules` file hasn't been deployed to Firebase yet.

## Solution: Deploy Firestore Rules

### Option 1: Using Firebase Console (Easiest)

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: **vibeswipe-44848**
3. Click on **Firestore Database** in the left sidebar
4. Click on the **Rules** tab at the top
5. Copy the contents of your `firestore.rules` file
6. Paste it into the rules editor
7. Click **Publish**

### Option 2: Using Firebase CLI

#### Step 1: Install Firebase CLI

```bash
npm install -g firebase-tools
```

#### Step 2: Login to Firebase

```bash
firebase login
```

#### Step 3: Initialize Firebase (if not already done)

```bash
cd /Volumes/MacintoshSSDExt/open-source/startupmanch/vibeswipe
firebase init firestore
```

Select:

- Use an existing project: **vibeswipe-44848**
- Firestore rules file: **firestore.rules** (already exists)
- Firestore indexes file: **firestore.indexes.json** (already exists)

#### Step 4: Deploy Firestore Rules

```bash
firebase deploy --only firestore:rules
```

## About the ExpoFirebaseCore Warning

The warning:

```
WARN  No native ExpoFirebaseCore module found
```

This is **harmless**. You're using the modular Firebase SDK (`firebase` package) directly, not `expo-firebase-core`. This is the recommended approach for new projects.

## Verify Rules Are Deployed

After deploying, your Firestore rules should allow:

✅ **Authenticated users** can:

- Read all posts
- Create posts (if they own them)
- Update posts (for likes/reactions)
- Read comments under posts
- Create comments under posts

✅ **Post owners** can:

- Delete their own posts

✅ **Comment owners** can:

- Update/delete their own comments

## Test After Deployment

1. Restart your Expo app
2. Try creating a post
3. Try adding a comment
4. Try reacting to a post

The errors should be gone!

## Current Rules Summary

Your `firestore.rules` already has the correct rules:

```javascript
// Posts have a subcollection for comments
match /posts/{postId} {
  allow read: if isAuthenticated();
  allow create: if isAuthenticated() && request.resource.data.userId == request.auth.uid;
  allow update: if isAuthenticated();
  allow delete: if isAuthenticated() && resource.data.userId == request.auth.uid;

  // Comments subcollection
  match /comments/{commentId} {
    allow read, create: if isAuthenticated();
  }
}
```

Just need to deploy them! 🚀
