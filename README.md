# AI Travel Planner with Gemini

A small full-stack travel planner that keeps your Gemini API key on the backend and uses a simple browser frontend.

## Safety choices

- The frontend never receives the Gemini API key.
- The backend reads `GEMINI_API_KEY` from environment variables.
- Request size, trip length, traveler count, and text lengths are limited.
- A small in-memory rate limiter reduces accidental abuse.
- The prompt tells Gemini not to invent live facts such as prices, openings, visas, or availability.
- Model output is escaped before rendering in the browser.

## Run locally

1. Copy `.env.example` to `.env` and add your Gemini API key.
2. In PowerShell, load the key:

   ```powershell
   $env:GEMINI_API_KEY="your_gemini_api_key_here"
   $env:PORT="3000"
   ```

3. Start the app:

   ```powershell
   npm start
   ```

4. Open `http://localhost:3000`.

## Configuration

The default model is `gemini-3.1-flash-lite`. You can override it:

```powershell
$env:GEMINI_MODEL="gemini-3.1-flash-lite"
```

## Notes

This app uses Node 18+ built-in `fetch`, so there are no npm dependencies to install.

## Deploy on Vercel

This repo includes a Vercel serverless backend at `api/plan.js`, so Vercel is the
quickest safe deployment option.

1. Import `EnoshValooran/AI-TRAVEL-PLANNER` into Vercel.
2. Add an environment variable named `GEMINI_API_KEY`.
3. Deploy.

Do not deploy this as GitHub Pages only. GitHub Pages is static hosting and cannot run
the backend, so `/api/plan` will return a non-JSON 404 page.
