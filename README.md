# Luqma 🍲

A simple mobile-style calorie tracker built with React + Vite (university project).

- Set a daily calorie goal and log meals (Breakfast / Lunch / Dinner / Snacks).
- Edit or delete meals; the calorie ring shows what's left (or how much you're over).
- **AI Logger:** describe a meal in Arabic or English and Gemini estimates calories and macros.
- Data is saved in the browser (localStorage). Only today's meals are shown.

## Run locally

```bash
npm install
```

Create a `.env` file in the project root (needed only for the AI Logger):

```
VITE_GEMINI_API_KEY=your_key_here
```

```bash
npm run dev
```

> The AI Logger works in local mode only. On the GitHub Pages build there is no key, so the AI button is disabled and the rest of the app works normally.
