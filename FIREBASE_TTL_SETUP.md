# Firebase Time-To-Live (TTL) Policy Setup
To allow "Hard Delete" of messages after 6 hours automatically (server-side), you should enable TTL in your Firebase Console. This is better than client-side deletion because it works even if no one is using the app.

1. Go to **Firebase Console** > **Firestore Database** > **Data**.
2. Click on the **"create a TTL policy"** button (or go to specific TTL settings tab).
3. **Collection Group**: `messages`
4. **Timestamp field**: `timestamp`
5. Click **Create**.

**That's it!** Firebase will now automatically delete any document in the `messages` collection where the `timestamp` is older than the policy you set (wait, actually TTL usually assumes you have an `expirationDate` field).

**Wait! Standard TTL Deletes based on a specific field date.**
Since we use `timestamp` (creation time), setting TTL on `timestamp` would delete it immediately if the logic was "delete if timestamp < now", but Firestore TTL deletes when "current time > field value".
So if we want it to expire in 6 hours, we need a separate field like `expiresAt`.

**Correction for App Logic:**
Since we strictly filter `timestamp > 6 hours ago` in the app, the users effectively see ephemeral chat.
To support true Hard Delete:
1. We need to save an `expiresAt` field with every message.
2. Set TTL on `expiresAt`.

**Action for Developer (Me):**
I will update the `sendMessage` function to include `expiresAt`.

**Action for You (User):**
After I push the code:
1. Go to Firebase Console.
2. Create TTL Policy for `messages` collection on field `expiresAt`.
