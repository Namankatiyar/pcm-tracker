# JEETracker

**JEETracker** is a specialized, offline-first progress tracking application designed for students preparing for the Joint Entrance Examination (JEE). It provides a comprehensive dashboard to monitor preparation across Physics, Chemistry, and Maths, with a focus on granular resource tracking, visual motivation, and persistent data storage.

## 🚀 Features

### 📊 Preparation Dashboard
*   **Visual Overview:** Tracks your overall completion percentage across all subjects using interactive progress rings.
*   **Motivational Quotes:** Fetches a new motivational quote every time you open the app to keep you inspired.
*   **Exam Countdown:** A dynamic countdown timer to your target JEE exam date. The counter visually shifts color (Green → Yellow → Red) as the date approaches to instill a sense of urgency.

### 📚 Dynamic Subject Management
*   **Granular Tracking:** Track progress for every individual chapter in Physics, Chemistry, and Maths.
*   **Custom Resources:** Add custom study material columns (e.g., specific coaching modules, YouTube channels, reference books) directly from the UI.
*   **Flexible Layout:** Remove or hide columns you don't use via a confirmation modal to keep your workspace clean.
*   **Status Indicators:** Mark chapters as completed, in-progress, or not started.

### 🎉 Visual Rewards
*   **Celebrations:** Experience a burst of confetti (themed to your selected accent color) whenever you mark a chapter as completed. A small but satisfying reward for your hard work!

### 🎨 Personalization
*   **Dynamic Theming:** Choose from a modern palette of accent colors. Your choice influences shadows, background tints, and progress indicators throughout the app.
*   **Dark/Light Mode:** Fully supported themes to reduce eye strain during late-night study sessions.

### 💾 Persistence
*   **Local Storage:** All your data—progress, exam date, custom columns, and theme preferences—is saved locally in your browser. No login or internet connection required (except for fetching quotes).

### 📱 Install as App (PWA)
**JEETracker** is a Progressive Web App. This means you can install it on your device for a native-like experience.
*   **Offline Access:** Works without an internet connection.
*   **No "Server" Required:** Once installed, you just click the icon to launch.
*   **How to Install:**
    1.  Open the app in Chrome or Edge.
    2.  Click the "Install" icon in the address bar (or look in the browser menu for "Install JEETracker").
    3.  Launch it from your Desktop or Start Menu like any other program.

## 🏗️ Architecture

JEETracker is built as a single-page application (SPA) focused on performance and user experience.

*   **Frontend Framework:** [React 18](https://react.dev/) with [TypeScript](https://www.typescriptlang.org/) for robust type safety and component-based architecture.
*   **Build Tool:** [Vite](https://vitejs.dev/) for lightning-fast development server and optimized production builds.
*   **Styling:** Custom CSS with CSS Variables for deep theming capabilities and responsiveness. `lucide-react` is used for modern, consistent iconography.
*   **Data Persistence:** A custom `useLocalStorage` hook abstracts the browser's `localStorage` API, ensuring state persists across sessions without a backend database.
*   **Utilities:**
    *   `papaparse`: For parsing the initial syllabus data from CSV files.
    *   `canvas-confetti`: For the visual celebration effects.

## 📂 Project Structure

```
src/
├── components/         # Reusable UI components
│   ├── Dashboard.tsx   # Main landing view with stats & quotes
│   ├── SubjectPage.tsx # Detailed chapter lists & tracking logic
│   ├── ...             # Modals, Headers, Progress Bars
├── hooks/              # Custom React hooks
│   └── useLocalStorage.ts # Manages persistent state
├── utils/              # Helper functions
│   ├── csvParser.ts    # Handles data import
│   └── confetti.ts     # Visual effects
├── App.tsx             # Root component & global state (Theme/View)
└── App.css             # Global styles & design system
public/
└── data/               # Base syllabus CSVs (physics.csv, etc.)
```

## 🛠️ Getting Started

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/your-username/JEETracker.git
    ```
2.  **Install dependencies:**
    ```bash
    npm install
    ```
3.  **Start the development server:**
    ```bash
    npm run dev
    ```
4.  **Build for production:**
    ```bash
    npm run build
    ```

---
*Created to help JEE aspirants stay focused and organized.*
