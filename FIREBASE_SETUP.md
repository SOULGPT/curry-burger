# Firebase Firestore Setup Guide

The "Permission Denied" error happens because your database is locked. You need to enable Firestore and set the **Security Rules** to allow the chat to work.

## 1. Create the Database (If you haven't)
1.  Go to your [Firebase Console](https://console.firebase.google.com/).
2.  Click on **Firestore Database** in the left menu.
3.  Click **Create Database**.
4.  Select a location (e.g., `nam5 (us-central)` or closest to you).
5.  Start in **Test mode** (or Production, we will change rules anyway).
6.  Click **Create**.

## 2. Update Security Rules
This is the most important step to fix the error.

1.  In the Firestore Database section, click the **Rules** tab.
2.  Delete everything there and paste this exact code:

```firestore
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Allow anyone to read and write chat messages
    // (Since we don't have user login for chat, this is required for it to work)
    match /messages/{messageId} {
      allow read, write: if true;
    }
    
    // Default deny for everything else for safety
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

3.  Click **Publish**.

## 3. Database Schema (For your reference)
You do **NOT** need to create these manually. The app will create them automatically when the first message is sent.

*   **Collection Name**: `messages`
    *   **Fields**:
        *   `user` (string): The username.
        *   `text` (string): The message content.
        *   `timestamp` (timestamp): When it was sent.

**That's it!** Refresh your app, and the chat will start working immediately.
