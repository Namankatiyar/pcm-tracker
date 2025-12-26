# PCM-Tracker

## Project Overview
**PCM-Tracker** is a specialized progress tracking application designed for students preparing for the JEE (Joint Entrance Examination). It provides a comprehensive dashboard to monitor preparation across Physics, Chemistry, and Maths, with a focus on granular resource tracking and visual motivation.

## Core Features
- **Preparation Dashboard**: Visualizes overall completion percentage across all subjects using progress rings.
- **Exam Countdown**: A dynamic countdown timer to the JEE exam date. The counter changes color (Green → Yellow → Red) as the date approaches.
- **Dynamic Subject Management**: 
    - Track progress for individual chapters.
    - Add custom study material columns (e.g., specific coaching modules, YouTube channels) directly from the UI.
    - Remove or hide columns you don't use via a confirmation modal.
- **Visual Rewards**: Confetti celebrations (themed to your accent color) upon completing chapters.
- **Personalization**:
    - **Dynamic Accent Colors**: Change the primary UI color from a modern palette. The accent influences shadows, background tints, and progress indicators.
    - **Dark/Light Mode**: Full support for both themes.
- **Persistence**: All data (progress, exam date, custom columns, accent color) is saved locally in the browser's `localStorage`.

## Tech Stack
- **Frontend**: React 18, TypeScript, Vite
- **Utilities**: `papaparse` (CSV parsing), `canvas-confetti` (celebrations)
- **Styling**: CSS Variables for deep theming and responsiveness.

## Project Structure
- `src/App.tsx`: Root component managing global state (theme, accent, view).
- `src/components/Dashboard.tsx`: High-level stats and exam countdown.
- `src/components/SubjectPage.tsx`: Detailed chapter table with dynamic column management.
- `src/hooks/useLocalStorage.ts`: Custom hook for data persistence.
- `public/data/`: Contains the base syllabus CSVs for each subject.

---
*Created on Thursday, December 25, 2025*
