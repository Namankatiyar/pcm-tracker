# JEETracker: Technical Project Overview

This documentation provides an exhaustive technical analysis of the JEETracker project. It is designed to empower LLM-based agents with the full context required for complex coding tasks, including feature implementation, bug fixing, and UI/UX enhancements.

---

## 1. Project Essence & Objective

**JEETracker** is a high-performance, offline-first progress tracking application specifically optimized for JEE (Joint Entrance Examination) preparation. It solves the problem of tracking granular completion across multiple subjects (Physics, Chemistry, Maths) and diverse study materials (NCERT, PyQs, Modules, etc.).

### Key Philosophies:
- **Visual-First Progress**: Immediate feedback through rings, bars, and confetti.
- **Extreme Flexibility**: Users can modify the syllabus, add/remove resource columns, and reorder content.
- **Deep Persistence**: Leveraging `localStorage` for a zero-server, instant-load experience.
- **Integrated Toolset**: Combines syllabus tracking with a daily planner and a dedicated study clock.

---

## 2. Technical Architecture

### Core Stack:
- **Framework**: React 18 with TypeScript.
- **Build System**: Vite (optimized for fast HMR and PWA builds).
- **Styling**: Vanilla CSS with a robust **CSS Variables Design System**.
- **Icons**: Lucide-React.
- **Animations**: Canvas-Confetti (for completion celebrations).
- **Data Handling**: PapaParse for CSV parsing of initial syllabus data.

### Project Structure:
```text
/src
  /components     # Atomic and composite UI components
  /hooks          # Custom hooks (useLocalStorage, useProgress)
  /types          # TypeScript interfaces/types (centralized index.ts)
  /utils          # Helper functions (CSV, Date, Confetti)
  App.tsx         # Root component, global state hub
  App.css         # Design system & global styles
  quotes.json     # Curated database for motivational quotes
/public
  /data           # Default syllabus CSVs (physics.csv, etc.)
```

---

## 3. Core Features & Functional Logic

### 3.1 Syllabus & Progress Tracking (`SubjectPage.tsx`, `ChapterRow.tsx`)
- **Dynamic Columns**: The application starts with default materials (NCERT, PyQs, etc.) but allows users to add custom columns or hide default ones.
- **Priority System**: Chapters can be assigned priorities (`high`, `medium`, `low`, `none`), which visually tints the rows for quick recognition.
- **Completion Logic**: A chapter is "Completed" (triggering confetti) only when ALL columns for that row are checked.

### 3.2 Daily Planner & Task Engine (`Planner.tsx`, `TaskModal.tsx`)
- **Weekly View**: A grid-based schedule for the current week.
- **Task Linking**: Tasks can be "General" (custom text) or "Chapter-linked" (linked to a specific subject, chapter, and material).
- **Auto-Shifting**: A key feature in `App.tsx` that identifies incomplete tasks from past days and automatically moves them to "Today" with a "Pending" indicator.
- **Drag & Drop**: Native HTML5 Drag and Drop allows moving tasks between day columns.

### 3.3 Study Clock (`StudyClock.tsx`)
- **Stateful Timer**: A multi-mode timer (`idle`, `running`, `paused`) that persists across browser refreshes using `PAUSED_TIMER_STORAGE_KEY`.
- **Engagement Modes**:
    - **Syllabus**: Select directly from the subject tree.
    - **Tasks**: Start a timer for an existing planner task.
    - **Custom**: Free-form session naming.
- **Analysis**: Real-time breakdown of study distribution (e.g., "40% Physics, 30% Maths") visualized via custom progress bars.
- **Fullscreen Mode**: A minimalist, distraction-free view triggered by the 'F' key or clicking the timer.

---

## 4. State Management & Data Persistence

### Global Domain State (`App.tsx`):
The application uses a "Single Source of Truth" pattern in `App.tsx`.
- `progress`: Maps `Subject -> ChapterSerial -> MaterialName -> Boolean`.
- `plannerTasks`: Array of `PlannerTask` objects.
- `subjectData`: The structure of the syllabus itself (can be customized by user).
- `studySessions`: Log of all completed timer sessions.

### LocalStorage Schema:
- `jee-tracker-progress`: The completion matrix.
- `jee-tracker-planner-tasks`: Saved schedule.
- `jee-tracker-subject-data`: Users' modified version of the syllabus chapters.
- `jee-tracker-accent`: Custom hex color for the UI.
- `jee-tracker-view`: Current active page.

### The `useLocalStorage` Hook:
A custom hook that transparently syncs React state with browser storage, ensuring data durability without manual `useEffect` calls in components.

---

## 5. Design System & Theming (`App.css`)

The UI is built on a "Glow-Minimalist" aesthetic.

### CSS Variables (Tokens):
- **Themes**: `[data-theme="light"]` and `[data-theme="dark"]` redefine the color palette.
- **Colors**:
    - `--bg-base`, `--bg-secondary`, `--bg-tertiary`: Tiered background depths.
    - `--accent`: The primary brand color (dynamic).
    - `--accent-light`, `--accent-hover`, `--accent-border`: Derived from the accent color using `color-mix`.
- **Shadows**:
    - `--shadow-lg`: Deep elevation for cards.
    - `--shadow-glow`: A subtle glow effect using the current accent color.

### Key Layout Classes:
- `.dashboard-stats-row`: 3-column grid for top-level progress.
- `.chapter-table`: High-density data grid for tracking.
- `.modal-overlay`: Standard blurred backdrop for all dialogs.

---

## 6. Development Guidelines for Agents

### 1. Adding a New Component:
- Define the interface in `src/types/index.ts` if it involves new data.
- Use CSS variables for all colors to ensure theme/accent compatibility.
- Ensure any action that changes progress triggers the `triggerConfetti` or `triggerSmallConfetti` utils.

### 2. Modifying State:
- Always pass state-setters down from `App.tsx` or use the provided handlers (e.g., `handleToggleMaterial`).
- Avoid direct `localStorage` calls; use the existing hook architecture.

### 3. UI/UX Standards:
- All buttons should have `:hover` and `:active` states.
- Modals must be dismissible via overlay click and `Escape` key.
- Maintain the "Border & Glow" aesthetic for new panels.

### 4. Logic Sync:
- Remember that Planner Tasks and Syllabus Progress are bi-directionally linked. Completing a "Chapter Task" in the planner should check the box in the `SubjectPage`.

---

## 7. Type Definitions (Central Reference)

### `PlannerTask`
```typescript
{
    id: string;
    title: string;
    subtitle?: string; // Material name
    date: string; // YYYY-MM-DD
    time: string; // HH:mm
    completed: boolean;
    type: 'chapter' | 'custom';
    subject?: Subject;
    chapterSerial?: number;
    material?: string;
    wasShifted?: boolean;
}
```

### `StudySession`
```typescript
{
    id: string;
    duration: number; // seconds
    startTime: string; // ISO
    endTime: string; // ISO
    type: 'chapter' | 'custom' | 'task';
    // ... metadata
}
```

### `SubjectData`
```typescript
{
    chapters: Chapter[];
    materialNames: string[]; // Headers for columns
}
```

## 8. UI/UX Design Philosophy & Heuristics

The application is built on a foundation of modern design principles, focusing on high engagement, clarity, and user autonomy. **Every component in this project must adhere to Nielsen’s 10 Usability Heuristics** to ensure a premium user experience.

### 8.1 Key Design Principles:
- **Aesthetic & Minimalist Design**: The UI follows a "Glassmorphism" aesthetic with blurred backdrops (`backdrop-filter: blur`), subtle glows (`--shadow-glow`), and a curated color palette. Unnecessary elements are hidden to maintain focus (e.g., the Study Clock collapses its selector when active).
- **Recognition Over Recall**: We use distinct iconography (Physics: Atom, Chemistry: Flask, Maths: Calculator) and color-coding for priorities (Red/Yellow/Green) throughout the app to minimize the user's memory load.
- **Micro-interactions & Feedback**: Immediate visual validation is provided for every user action:
    - **Confetti**: High-impact feedback for major milestones (completing chapters/tasks).
    - **Progress Bars/Rings**: Real-time system status updates as the completion matrix changes.
    - **Hover States**: All interactive elements (buttons, cards, rows) have defined `:hover` transitions.

### 8.2 Heuristic Implementation Details:
1.  **Visibility of System Status**: Users always know their progress via the Dashboard rings and the "Pending" tags on overdue tasks.
2.  **Match Between System & Real World**: Terminology follows the student workflow ("Syllabus", "PyQs", "NCERT", "Planner").
3.  **User Control & Freedom**: Every destructive action is reversible or preceded by a confirmation (e.g., `ConfirmationModal` for deleting chapters). Users can easily "Discard" study sessions if they were started in error.
4.  **Consistency & Standards**: Component styling is strictly governed by `App.css`. Modals follow a uniform structure (Header, Scrollable Body, Footer).
5.  **Error Prevention**: Date pickers and subject selectors prevent invalid data entry.
6.  **Flexibility & Efficiency of Use**: Power users can use the 'F' shortcut for fullscreen clock mode and the 'Space' toggle for the timer.
7.  **Help Users Recover from Errors**: Shifted tasks in the planner allow students to reschedule missed work without friction.

**CRITICAL REQUIREMENT**: When adding or modifying UI components, developers (and agents) must ensure that the new interface does not violate these heuristics. If a component lacks visual feedback or user control, it is considered a bug.

---

*This document serves as the ground truth for agents. When in doubt, defer to the structures and behaviors defined here.*
