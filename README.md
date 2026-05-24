# Analyse Me!

A static GitHub Pages app for daily check-ins using a 14-day pre-episode pattern.

## What it does

- Daily tick-box symptom check-in
- Risk banding: GREEN / AMBER / RED / CRISIS
- Shows a 14-day pattern timeline
- Saves entries locally in the browser only
- Exports saved check-ins as CSV
- Works as a simple PWA/offline app after first load

## Important safety note

This app does not diagnose, prescribe, or replace clinical advice.

Medication prompts are deliberately worded as reminders to follow a written plan agreed with the clinical team. The app should not decide medication dose.

## How to publish on GitHub Pages

1. Create a new GitHub repository, e.g. `analyse-me`
2. Upload these files:
   - `index.html`
   - `style.css`
   - `app.js`
   - `manifest.json`
   - `sw.js`
   - `README.md`
3. Go to **Settings → Pages**
4. Under **Build and deployment**, choose:
   - Source: `Deploy from a branch`
   - Branch: `main`
   - Folder: `/root`
5. Save.
6. Your app will appear at:
   `https://YOURUSERNAME.github.io/analyse-me/`

## How to adjust risk scoring

Open `app.js`.

Each check item has a `weight`. Higher weights increase the risk score.

The current scoring is intentionally cautious:
- AMBER: score >= 12 or sleep + activation
- RED: score >= 24 or sleep + activation + mixed features
- CRISIS: safety marker selected

Ask your clinician to review the thresholds and wording.
