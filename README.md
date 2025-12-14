# Curry & BurgerNow FC 26 - Tournament System

A web-based tournament management tool for weekly FIFA/FC tournaments.

## 🚀 Getting Started

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Run the development server**:
   ```bash
   npm run dev
   ```

3. **Open the app**:
   Visit [http://localhost:3000](http://localhost:3000)

## 📱 Features

- **Live Bracket**: Auto-updating view for spectators (Round of 16 -> Final).
- **Registration**: Mobile-friendly sign-up with photo upload.
- **Admin Panel**: Secure area (`admin123`) to manage matches and bracket.
- **Hall of Fame**: Gallery of past champions.

## ⚠️ Important Notes

- **Data Storage**: This MVP uses `localStorage`. Data is stored **on the device/browser** where it is accessed.
  - If you run the Admin Panel on a laptop, the Live Bracket must be viewed on the **same laptop** (e.g. connected to a TV via HDMI) for updates to appear instantly.
  - If you open the site on a new phone, it will have empty data.
  - To sync across devices, a backend (Database) is required (Future V2 feature).

- **Deployment**:
  - Deployable to Vercel or Netlify.
  - Remember the `localStorage` limitation applies even when deployed.

## 🛠️ Tech Stack

- Next.js
- Tailwind CSS (Dark Mode + Amber/Zinc Theme)
- Lucide React (Icons)
- Canvas Confetti
