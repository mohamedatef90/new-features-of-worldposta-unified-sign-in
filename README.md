# New Features of WorldPosta Unified Sign-In

A front-end simulation of a unified sign-in portal and account console, used to explore UX for multiple solutions: sign-in and sign-up, a customer console, admin and reseller areas, billing, support, and an email admin suite. It runs on sample data in the browser; authentication is simulated.

It was created in Google AI Studio and can be viewed there: https://ai.studio/apps/drive/1tQ4hfgvepdF3gHAVWs8TLsBch1UNoaWS

## Features

- **Auth screens:** landing page, login, signup, and email verification, with a simulated sign-in against sample users (`context.tsx`).
- **Three user types** (`customer`, `admin`, `reseller`, from `types.ts`) with their own areas under `/app`: dashboard, profile, billing (email subscriptions, email configurations, CloudEdge configurations), invoices, action logs, team management, support, and notifications; admin pages for users, staff, and support; reseller customers and program.
- **Service consoles:** CloudEdge views (for example kubernetes, networking, storage, monitoring, and backup) and an email admin suite (organizations and domains, mailboxes, distribution lists, shared contacts, bulk module, running tasks, mailbox plans, SMTP and PST logs, rules, account statistics).
- **Shared UI kit** in `components/ui/` (charts, dialogs, pagination, stepper, tree view, and more), with light and dark themes through a theme provider.
- **AI chatbot widget:** a Gemini (`gemini-2.5-flash`) chat in `components/ui/Chatbot.tsx`.
- **Design documentation:** `DESIGN_SYSTEM.md` and `DESIGN_SYSTEM.json`.

## Tech stack

- React 19 and TypeScript
- React Router 7
- Vite 6
- Tailwind CSS and Font Awesome (both loaded from CDNs in `index.html`)
- Google Gemini through `@google/genai`

## Getting started

Prerequisites: Node.js and npm.

```bash
npm install
npm run dev       # Vite dev server
npm run build     # production build
npm run preview   # preview the production build
```

### Environment variable

`GEMINI_API_KEY`, read by `vite.config.ts` (put it in `.env.local`). It is inlined into the client bundle, so use it only for local demos. It is only needed for the chatbot.

## Project structure

```
App.tsx, index.tsx   Routes and entry point
context.tsx          Simulated auth and theme providers
data.ts, types.ts    Sample data and types
pages/               Auth, admin, billing, and console pages
components/ui/       Shared UI components and the chatbot
.kiro/steering/      Notes for AI coding assistants
```
