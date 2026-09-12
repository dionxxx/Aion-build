# AION — Autonomous Business Operating System

Milestone 1: AION Brain + AION Live.

## What this milestone actually does
- Genuine Gemini-powered reasoning, called through a secure Netlify Function (`netlify/functions/Aion.js`). The API key never reaches the browser.
- A real Brain/Governor loop: understand → interpret objective → propose a plan → report a truthful execution state.
- Truthful execution states only. Nothing is ever claimed as COMPLETED — no real tools, integrations, or specialist workforce exist yet (those are Milestones 3–4). Plan steps are always `PLANNED`.
- Conversational continuation using in-memory (per-tab) history. Cross-session memory is Milestone 2.
- Command-center UI: Home/AION Live is fully functional. Every other nav item is a truthfully labeled placeholder — no fake leads, analytics, or content, per the non-negotiable product rules.
- Fully responsive (mobile sidebar collapses behind a toggle).

## Setup
1. In Netlify → Site settings → Environment variables, set:
   - `GEMINI_API_KEY` — your Gemini API key
   - `GEMINI_MODEL` — optional, defaults to `gemini-2.5-flash`
2. Deploy. Netlify will build the static site and the function automatically (no build command needed — this is plain HTML/CSS/JS).

## Files
- `index.html`, `style.css` — UI shell
- `app.js` — navigation + composer wiring
- `brain.js` — client-side half of the Brain loop, talks to the Netlify function
- `mission.js` — lightweight in-session objective/plan display (not the full Mission Engine — that's M3)
- `workforce.js` — static specialist roster (display only — real activation is M3)
- `netlify/functions/Aion.js` — secure server-side Gemini connector, the actual Brain/Governor reasoning

## Not in this milestone (by design)
Persistent business memory (M2), real specialist execution (M3), real external integrations (M4), premium demo polish (M5).
