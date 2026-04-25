# TempCheck

A facility management system for virus quarantine & treatment centers. Built as a prototype for the FactWise Technical Product Manager assessment.

## Features

- **Role-based access** for 4 user types: Nurse, Doctor, Admin, Head Doctor
- **Nurse workflow**: Temperature queue with pending/completed tabs, validation (95–108°F), duplicate-day warnings
- **Doctor workflow**: Visit queue that enforces "temperature first" rule, SVG fever trend chart, clinical notes, auto-validated discharge flagging (3 consecutive fever-free days)
- **Admin workflow**: Capacity tracking (74 beds), pending-discharge queue, room-collision prevention
- **Head Doctor dashboard**: Success rate vs 85% benchmark, mortality alerts, daily completion rates

## Tech Stack

- React 18 + Vite
- Tailwind CSS
- React Router v6
- Lucide icons
- All state managed in React Context (prototype uses in-memory seed data — no backend needed)

## Run Locally

```bash
npm install
npm run dev
```

App will be available at `http://localhost:5173`.

## Deploy to Vercel

### Option A: Via GitHub (recommended)

1. Push this folder to a new GitHub repository
2. Go to https://vercel.com/new
3. Import the repository
4. Vercel auto-detects Vite — just click **Deploy**
5. Your live URL appears in ~90 seconds

### Option B: Via Vercel CLI

```bash
npm install -g vercel
vercel
```

## Project Structure

```
src/
├── components/     # Reusable UI (Sidebar, Layout, Modal, PatientCard, TempChart, Toast)
├── pages/          # One file per screen
├── context/        # Global state (AppContext)
├── lib/            # Pure logic (clinical rules, constants, seed data)
├── App.jsx         # Router with role-gated routes
├── main.jsx        # Entry point
└── index.css       # Tailwind + component classes
```

## Design Decisions

- **Clinical palette**: Deep teal primary + warm neutrals. Professional and calm — reduces cognitive load for staff working under pressure.
- **Constraint enforcement in UI**: The "temperature must be recorded before doctor visit" rule is enforced at the button level, not just via backend validation. Prevents bad data at the source.
- **Seed data covers every state**: Patients in every clinical state (fresh admit, feverish, mid-streak, eligible, flagged, discharged, deceased) so reviewers can see the full workflow without creating data.
