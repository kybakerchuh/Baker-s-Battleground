# Baker's Battleground — Algebra 1 OST Playbook Roguelite

An interactive Algebra 1 OST Playbook combat roguelite featuring **330 Playbook problems across 11 topics**, **Google Sign-In single cloud save** (tracking **per-game** and **lifetime** correct rates), and **24 playable operatives** (**16 starter operatives + 8 progressively stronger Ascended Legends** unlocked every 50 correct answers up to 400).

## Features

- **11 OST Playbook Topics (330 Questions Total):** Switch topics before a run or mid-game without repeating until the deck finishes.
- **Single-Save Google Sign-In + Cloud Accuracy Sync:** Automatically tracks both **per-game correct rate** (saved run-by-run history) and **lifetime correct rate** across sessions via Firebase Authentication and Cloud Firestore.
- **8 Unlockable Ascended Legends (50 → 400 Correct Answers):**
  - **50 Correct:** Vanguard Orion
  - **100 Correct:** Tempest Kestrel
  - **150 Correct:** Crimson Ronin Ren
  - **200 Correct:** Archon Helios
  - **250 Correct:** Wraith Selene
  - **300 Correct:** Colossus Atlas
  - **350 Correct:** Seraphina Flux
  - **400 Correct:** Grandmaster Baker Prime

## Hosting & Sharing a Live Link via GitHub Pages

1. Push this repository to GitHub (default branch `main`).
2. In your GitHub repository, go to **Settings → Pages** and set **Source** to **GitHub Actions**.
3. The included `.github/workflows/deploy.yml` workflow will build `dist/` and publish your live link at:
   `https://<your-github-username>.github.io/<your-repo-name>/`
4. **Enable Google Sign-In for your GitHub Pages domain (Required once):**
   - Open [Firebase Console](https://console.firebase.google.com/) → select project `gen-lang-client-0363503334`
   - Go to **Authentication → Settings → Authorized domains → Add domain**
   - Add `<your-github-username>.github.io` (without `https://` or the repo path).

## Local Development

```bash
npm install
npm run dev
```

Build for production:

```bash
npm run build
```
