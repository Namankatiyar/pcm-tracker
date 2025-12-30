# PCM-Tracker Context

## Project Overview
**PCM-Tracker** is a React-based Progressive Web App (PWA) designed for JEE (Joint Entrance Examination) aspirants to track their preparation progress across Physics, Chemistry, and Mathematics. It features a dashboard for high-level stats, detailed chapter-wise tracking with customizable study material columns, and gamification elements like progress rings and celebrations.

## Tech Stack
- **Framework**: React 18
- **Build Tool**: Vite
- **Language**: TypeScript
- **Styling**: CSS Modules / Global CSS with CSS Variables (Theming)
- **State Management**: React `useState` + Custom Hooks (`useLocalStorage`)
- **Routing**: Conditional Rendering (Manual View State)
- **Key Libraries**:
    - `papaparse`: Parsing CSV syllabus data.
    - `canvas-confetti`: Visual rewards on completion.
    - `lucide-react`: UI Icons.
    - `vite-plugin-pwa`: PWA capabilities.

## Project Structure

```text
/
├── public/
│   ├── data/                 # Static CSV files defining the syllabus (physics.csv, etc.)
│   └── logo.png              # App Icon
├── src/
│   ├── components/           # UI Components
│   │   ├── ChapterRow.tsx    # Table row for a single chapter
│   │   ├── Dashboard.tsx     # Main landing view with stats & countdown
│   │   ├── Header.tsx        # Navigation and Theme toggles
│   │   ├── SubjectPage.tsx   # Detailed subject view (dynamic table)
│   │   ├── ProgressBar.tsx   # Reusable progress bar
│   │   └── ... (Modals)      # InputModal, ConfirmationModal, etc.
│   ├── hooks/
│   │   ├── useLocalStorage.ts # Generic hook for persisting state to browser storage
│   │   └── useProgress.ts     # Logic for calculating completion percentages
│   ├── types/
│   │   └── index.ts          # Core TypeScript interfaces
│   ├── utils/
│   │   ├── confetti.ts       # Celebration logic
│   │   └── csvParser.ts      # CSV fetching and parsing logic
│   ├── App.tsx               # Root component (State Holder & Router)
│   └── main.tsx              # Entry point
├── vite.config.ts            # Vite & PWA configuration
└── package.json              # Dependencies and scripts
```

## Architecture & Data Flow

### 1. State Management (`App.tsx`)
`App.tsx` serves as the single source of truth for the application state. It manages:
- **`progress`**: The user's completion status for every chapter and material.
- **`theme`**: 'light' or 'dark' mode.
- **`currentView`**: Controls navigation ('dashboard' | 'physics' | 'chemistry' | 'maths').
- **`customColumns`**: User-added study material columns (e.g., "YouTube", "Notes").
- **`excludedColumns`**: Standard columns the user has chosen to hide.
- **`subjectData`**: The raw syllabus data loaded from CSVs.

### 2. Data Persistence
The application relies entirely on `localStorage` via the `useLocalStorage` hook.
- **Keys**:
    - `jee-tracker-theme`
    - `jee-tracker-view`
    - `jee-tracker-progress`
    - `jee-tracker-accent`
    - `jee-tracker-custom-columns`
    - `jee-tracker-excluded-columns`

### 3. Logic & Computation
- **`useProgress`**: Takes the raw `progress` state and `subjectData` to compute percentage completion for each subject and the overall curriculum.
- **`csvParser`**: Fetches CSV files from `/public/data/`, parses them using `papaparse`, and returns a structured `SubjectData` object. It automatically extracts default material columns from CSV headers.

## Key Data Models (`src/types/index.ts`)

```typescript
export type Subject = 'physics' | 'chemistry' | 'maths';
export type Priority = 'high' | 'medium' | 'low' | 'none';

export interface Chapter {
    serial: number;
    name: string;
    materials: string[]; // List of available study materials for this chapter
}

// The stored progress for a single chapter
export interface ChapterProgress {
    completed: Record<string, boolean>; // Map of Material Name -> Is Completed
    priority: Priority;
}

// Map of Chapter Serial -> Progress
export interface SubjectProgress {
    [chapterSerial: number]: ChapterProgress;
}

// Root state object
export interface AppProgress {
    physics: SubjectProgress;
    chemistry: SubjectProgress;
    maths: SubjectProgress;
}
```

## Core Components

### `SubjectPage.tsx`
- **Responsibility**: Renders the detailed tracker for a specific subject.
- **Features**:
    - Displays chapters in a table.
    - Dynamic columns: Users can add custom columns (handled via `onAddMaterial`) or remove existing ones.
    - Priority management: Users can tag chapters as High/Medium/Low priority.
    - Integration with `ChapterRow` to render individual rows.

### `Dashboard.tsx`
- **Responsibility**: Home screen visualization.
- **Features**:
    - Circular progress rings for each subject.
    - "Days Left" countdown timer (color-coded based on urgency).
    - Daily Quote display.

### `ChapterRow.tsx`
- **Responsibility**: A single row in the subject table.
- **Features**:
    - Checkboxes for each study material.
    - Priority selector dropdown.
    - Visual feedback for completion.

## Development Workflows

- **Adding a new library**: Check `package.json` first. Use `npm install`.
- **Modifying Syllabus**: Edit the CSV files in `public/data/`. The app dynamically adapts to changes in CSV rows/columns (though existing progress is tied to chapter serials).
- **Theming**: Uses CSS variables (`--accent`, `--bg-primary`, etc.) defined in `App.css`. `App.tsx` handles updating these variables based on user preferences.
