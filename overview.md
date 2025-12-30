# PCM-Tracker Project Overview

This project is a specialized, offline-first progress tracking application designed for JEE (Joint Entrance Examination) preparation. It allows students to track their progress across Physics, Chemistry, and Maths with granular control over study materials and personal goals.

## 🚀 Technical Architecture

- **Frontend**: React 18 with TypeScript.
- **Build Tool**: Vite.
- **Styling**: Vanilla CSS with CSS Variables for deep theming.
- **State Management**: React Hooks (`useState`, `useMemo`, `useCallback`) and custom hooks for persistence.
- **Persistence**: `localStorage` (offline-first). Data is synced with browser storage via the `useLocalStorage` hook.
- **Data Source**: Initial syllabus data is loaded from CSV files (`public/data/*.csv`) and parsed using `papaparse`.

## 📁 Key Project Structure

- `src/App.tsx`: The heart of the application. Manages global state including theme, accent color, current view, and subject progress.
- `src/App.css`: Contains the entire design system, including dark/light mode definitions and responsive layouts.
- `src/components/`:
    - `Dashboard.tsx`: Main overview with progress rings, motivational quotes, and exam countdown.
    - `SubjectPage.tsx`: Detailed tracking for individual subjects. Supports adding/removing materials (columns) and chapters.
    - `Planner.tsx` & `TaskModal.tsx`: Advanced planning system for scheduling and tracking specific study tasks.
    - `SettingsModal.tsx`: Global configuration for themes and data management.
- `src/hooks/useLocalStorage.ts`: Abstracted logic for persistent state.
- `src/utils/csvParser.ts`: Logic for fetching and parsing the initial CSV-based syllabus.
- `public/data/`: Contains `physics.csv`, `chemistry.csv`, and `maths.csv` which define the default chapter list and resources.

## ✨ Core Features

### 1. Progress Tracking
- **Granular Control**: Track completion for each chapter across multiple resources (e.g., NCERT, PyQs, Modules).
- **Dynamic Columns**: Users can add custom resource columns or hide/remove default ones.
- **Priority System**: Chapters can be marked with priority levels (Low, Medium, High).

### 2. Strategic Planning
- **Daily Planner**: A full-featured task management system integrated with the syllabus.
- **Exam Countdown**: A visual timer for the target exam date that changes color based on proximity (Urgency Indicator).

### 3. Personalization & UX
- **Theming**: Supports Dark/Light modes and custom accent colors that propagate through the UI.
- **Motivational Quotes**: Displays a new quote every session from a local JSON collection.
- **Visual Feedback**: Confetti celebrations (matching the accent color) upon chapter completion.
- **PWA Support**: Installable as a native app with offline capabilities.

## 🛠️ Data Schema & State

- **AppProgress**: A nested object mapping subjects and chapter serials to completion statuses and priorities.
- **SubjectData**: Parsed from CSVs, contains the chapter list and default material names.
- **PlannerTask**: Objects representing scheduled tasks, linked to specific chapters and materials where applicable.

## 📝 Performance Notes
- Most calculations (like progress percentages) are memoized using `useMemo` to ensure smooth performance even with 100+ chapters.
- The UI is built using a "Single Page App" philosophy, minimizing re-renders and providing a fluid experience.
