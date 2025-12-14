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
    
    // Allow anyone to read messages
    match /messages/{messageId} {
      allow read: if true;
      
      // Strict validation for creating messages
      allow create: if request.resource.data.text is string
                    && request.resource.data.text.size() > 0
                    && request.resource.data.text.size() <= 300  // Max 300 chars prevents payload spam
                    && request.resource.data.user is string
                    && request.resource.data.user.size() <= 20   // Max 20 chars username
                    && request.resource.data.timestamp is timestamp
                    && request.resource.data.timestamp == request.time; // Prevent fake timestamps

      // No one can edit or delete messages once sent (tamper-proof)
      allow update, delete: if false; 
    }
    
    // Default deny for everything else (Best Practice)
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
