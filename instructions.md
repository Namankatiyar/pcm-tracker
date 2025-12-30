# Planner Feature Implementation Prompt

 All changes must strictly adhere to the established design language, component patterns, and interaction logic already present in the application.

The web application supports a **global accent color customization feature**. Any new UI components introduced must integrate with and respect this existing color logic without introducing hard-coded colors.

---

## 1. Add a New Page: Planner

- Add a new page named **“Planner”** to the header navigation, alongside **Dashboard** and **Chapter** pages.
- The label should include a **calendar emoji (📅)**.
- The Planner page must visually and structurally match the rest of the application.

---

## 2. Planner Page Structure

- At the top of the Planner page, add two toggle buttons:
  - **Weekly**
  - **Monthly**
- The **Weekly** view must be selected by default.
- Monthly view can be a placeholder unless functionality already exists.

---

## 3. Weekly Planner Layout

- Display a planner for all 7 days of the week, starting from **Monday**.
- Layout rules:
  - First 4 days in the top row.
  - Remaining 3 days in a second row below.
- Under each day, display a task list with empty slots initially.

---

## 4. Task Capabilities

Each task must support:
- Add
- Edit
- Delete
- Mark as completed

---

## 5. Task Creation Flow

When adding a new task, the user must first choose one of two options:
- **Add Chapter**
- **Add Other**

### A. Add Chapter Flow

1. Prompt the user to select one of the **three existing subjects**.
2. After selecting a subject, show the list of available chapters for that subject.
3. After selecting a chapter, prompt the user to select the **study material**.
4. Add the task to the planner:
   - Chapter name as the main task title
   - Study material displayed as subscript/subtext

### B. Add Other Flow

- Allow the user to freely type a task name.
- Add it directly to the planner task list.

### Common Finalization Step (Mandatory)

- Before creating the task, prompt the user with:  
  **“Till when?”**
- The user must select a time (deadline) by which the task should be completed.

---

## 6. Data Synchronization Rules

- Tasks created via **Add Chapter** must be synchronized with the **Chapter Table**.
- If a chapter task is marked as completed in the Planner, the corresponding chapter must be marked completed in the Chapter Table.
- Maintain bidirectional consistency wherever applicable.

---

## 7. Dashboard Enhancement: Today’s Agenda

- On the **Dashboard**, in the same horizontal row as:
  - Total Progress
  - Days Left Counter
- Insert a **new block between the two existing elements** titled:  
  **“Today’s Agenda”**

### Today’s Agenda Behavior

- List all tasks scheduled for **today** (from Planner).
- Tasks must be ordered by their **“till when” time** (earliest first).
- Tasks can be marked as **done directly from the Dashboard**.
- Editing or adding tasks must only be possible from the **Planner page**.
- If the task list exceeds the available horizontal space, the list must be **scrollable**.

---

## 8. UI / UX Constraints

- Maintain consistency with existing spacing, typography, animations, and component behavior.
- Do not introduce new visual styles unless already present in the application.
- Ensure accessibility and responsiveness match current standards.

---

If any ambiguity exists, ask targeted clarification questions **before implementation**.
```
