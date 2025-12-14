# Deploying "Curry&Burger fun"

Your application is ready for deployment! Here is how to push it to the world.

## 1. Push to GitHub

You need to push this local repository to your GitHub account.

1.  **Create a new repository** on [GitHub.com](https://github.com/new) named `curry-burger-tournament`.
2.  **Run these commands** in your terminal:

```bash
# Add your remote repository (replace YOUR_USERNAME)
git remote add origin https://github.com/YOUR_USERNAME/curry-burger-tournament.git

# Push the code
git branch -M main
git push -u origin main
```

## 2. Deploy to Vercel

Vercel is the best place to host Next.js apps.

1.  Go to [Vercel.com](https://vercel.com) and sign up/login.
2.  Click **"Add New..."** -> **"Project"**.
3.  Import your `curry-burger-tournament` repository.
4.  **Environment Variables**:
    *   In the "Environment Variables" section, you MUST add your Firebase keys (copy them from your `.env.local` file):
        *   `NEXT_PUBLIC_FIREBASE_API_KEY`
        *   `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
        *   `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
        *   `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
        *   `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
        *   `NEXT_PUBLIC_FIREBASE_APP_ID`
5.  Click **Deploy**.

## 3. Verify

Once deployed, Vercel will give you a URL (e.g., `curry-burger-fun.vercel.app`).
- Check the favicon and title are correct.
- Test the Admin Login (`admin123`).
- Test the Chat (requires the Env Vars to be correct).
