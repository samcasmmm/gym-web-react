# IronTrack — Gym Tracker & Exercise Platform

A modern, high-performance **Gym & Workout Tracker** built with **React 19, Vite, TypeScript, Tailwind CSS v4, Dexie (IndexedDB), Recharts, and TanStack Query**.

---

## Key Features

1. **Dashboard & Hub (`/`)**:
   - Hero status, weekly workouts counter, total volume lifted, latest weigh-in, and recent PRs showcase.
   - Interactive training split quick launchers (Push, Pull, Legs, Upper).
   - Recharts weekly volume progression bar chart.
   - Live 1,500+ exercise directory powered by open-source ExerciseDB API.

2. **Active Workout Logger (`/workout`)**:
   - Live workout timer, set tables, and automatic previous weight/reps comparison.
   - **Progressive Overload Advisor**: Suggests weight and rep targets based on previous performance.
   - **Built-in Rest Timer**: Visual circular countdown (30s, 60s, 90s, 120s, 180s) with audio cues and floating widget.
   - **1RM Calculator**: Instant Epley formula estimation per set.
   - **PR Detection & Celebration**: Automatic detection of new Personal Records with celebratory confetti.

3. **Exercise Library (`/exercises`)**:
   - 1,500+ animated gym exercises with body part, muscle target, and equipment filters.
   - Step-by-step form cues and instructions.
   - Custom exercise creator with instant IndexedDB persistence.

4. **Workout History (`/history`)**:
   - Historical workout sessions with total volume, duration, and exercise set breakdowns.

5. **Progress & Analytics (`/progress`)**:
   - Body weight trend line chart (Recharts).
   - Exercise strength progression tracking (max weight lifted over time).
   - Personal Record (PR) trophy wall.
   - Body measurement logger (Weight, Chest, Waist, Arms).

6. **Training Plans & Routines (`/plans`)**:
   - Preset templates: Push/Pull/Legs (PPL), Upper/Lower, Full Body, Arnold Split.
   - 1-click routine launcher directly into the active tracker.
   - Custom routine creator.

7. **Settings & Offline Data Management (`/settings`)**:
   - Unit toggle (`kg` vs `lbs`).
   - JSON data backup export & restore.
   - Reset or reload sample workout history.

---

## Tech Stack

- **Framework**: React 19 + Vite 8
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **Database**: IndexedDB via Dexie.js (100% offline-first)
- **Data Fetching**: TanStack Query v5 + Axios
- **Charts**: Recharts
- **Icons**: Lucide React
- **Package Manager**: Bun

---

## Getting Started

```bash
# Install dependencies
bun install

# Start development server (http://localhost:3000)
bun run dev

# Build production bundle
bun run build
```
