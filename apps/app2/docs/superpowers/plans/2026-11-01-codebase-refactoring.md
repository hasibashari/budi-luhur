# Codebase Refactoring & Optimization Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans (or native execution) to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Clean up, optimize, modularize, and refactor the codebase of `apps/app2` (Pilluna) by eliminating dead code, decomposing monolithic components and services, reusing shared components, and eliminating duplicated logic without any regression to UI design or business functionality.

**Architecture:** 
- Frontend follows a modular, feature-based React 19 + Vite architecture (`src/features/*`, `src/shared/*`, `src/app/*`). Monolithic components (`VerificationDetailModal`, `SetupProfileView`, `DashboardView`) are broken down into cohesive sub-components with single responsibilities.
- Backend follows a modular Express.js domain architecture (`src/modules/*`, `src/config/*`, `src/middlewares/*`). The 1108-line `AdminService` monolith is decomposed into specialized domain sub-services (`adminUser`, `adminArticle`, `adminSchedule`, `adminVerification`, `adminReport`) behind a unified facade.
- Shared dialog components (`ConfirmDeleteDialog`) replace duplicate ad-hoc modals (`ScheduleDeleteDialog`). Dead and orphaned legacy files inherited from older templates are purged.

**Tech Stack:** React 19, TypeScript 5.8, Vite 6, Tailwind CSS 4, Express.js 4, Jest, Testing Library.

**Spec:** User request on codebase refactoring for App 2 (Pilluna) focusing on:
1. Dead Code Removal
2. Component Optimization & Modularization
3. Component Reuse
4. Code Efficiency & Deduplication
5. Architectural Consistency
6. Zero Regression & Functionality Preservation

## Global Constraints
- Preserve all existing UI design, styling, and visual appearance exactly.
- Preserve all business flows, API routes, contracts, and authentication behavior.
- Ensure all 28 test suites (105 tests) continue to pass at each task checkpoint.
- Ensure `npm run backend:build` and `npm run build` continue to succeed with 0 TypeScript errors.

## Review Focus
- Modal accessibility and event handlers (ensure ESC key, backdrop close, and focus behavior remain intact after modal refactoring).
- Props passing and state reactivity in decomposed sub-components (`VerificationDetailModal`, `SetupProfileView`, `DashboardView`).
- Backwards compatibility of `AdminService` exports and method signatures with controllers and existing integration tests.
- Verify that no dynamic route or index re-export is broken by dead file removals.

---

### Task 1: Dead Code & Unreferenced Files Removal

**Files to Delete:**
- `frontend/src/shared/components/Navbar.tsx` (295 lines, orphaned legacy navbar from Next.js template)
- `frontend/src/shared/components/domain/ConsumptionChart.tsx` (71 lines, superseded by `PillComplianceChart.tsx`)
- `frontend/src/shared/components/domain/ReminderCard.tsx` (78 lines, superseded by `DailyPrescriptionHeroCard.tsx`)
- `frontend/src/shared/components/domain/ScreenHeader.tsx` (57 lines, unused app1 header with hardcoded red color scheme)
- `frontend/src/shared/components/domain/StatusCard.tsx` (156 lines, unused with buggy state sync)
- `frontend/src/shared/components/domain/StreakProgressCard.tsx` (122 lines, unused with app1 pink colors)
- `frontend/src/shared/components/domain/BottomNav.tsx` (7 lines, redundant alias)
- `frontend/src/shared/constants/healthcare.ts` (102 lines, unused template file with generic vitamins)
- `frontend/src/features/education/components/SadariGuideSection.tsx` (284 lines, unused legacy component)
- `frontend/src/features/education/constants/education.constants.ts` (21 lines, unused fallback images)
- `frontend/src/features/admin/api/adminStatsRepository.ts` (1 line, unused re-export)
- `frontend/src/features/user/utils/scheduleHelpers.ts` (48 lines, unused in frontend)
- `frontend/src/features/auth/components/AuthTabbedContainer.tsx` (68 lines, unused component)

**Files to Modify:**
- `frontend/src/features/auth/index.ts` (remove re-export of `AuthTabbedContainer`)

- [ ] **Step 1: Delete identified dead code files**
- [ ] **Step 2: Update `frontend/src/features/auth/index.ts` to remove unused export**
- [ ] **Step 3: Run TypeScript build and tests to verify zero regressions**
  Run: `npm run backend:build && npm run build && npm run test`
  Expected: PASS

---

### Task 2: Clean Unused Imports & Unused Variables in Frontend

**Files to Modify:**
- `frontend/src/app/App.tsx`
- `frontend/src/app/routes.tsx`
- `frontend/src/features/admin/components/AdminMobileBottomNav.tsx`
- `frontend/src/features/admin/components/ScheduleFormModal.tsx`
- `frontend/src/features/admin/components/SendReminderModal.tsx`
- `frontend/src/features/admin/components/UserFormModal.tsx`
- `frontend/src/features/admin/components/VerificationDetailModal.tsx`
- `frontend/src/features/admin/views/AdminDashboardView.tsx`
- `frontend/src/features/admin/views/AdminVerificationView.tsx`
- `frontend/src/features/auth/components/AuthCardLayout.tsx`
- `frontend/src/features/auth/context/AuthContext.tsx`
- `frontend/src/features/auth/view/LoginView.tsx`
- `frontend/src/features/auth/view/RegisterView.tsx`
- `frontend/src/features/consumption/components/ActiveDateActionCard.tsx`
- `frontend/src/features/consumption/components/ConsumptionLogList.tsx`
- `frontend/src/features/consumption/components/DateFilterBar.tsx`
- `frontend/src/features/consumption/views/HistoryView.tsx`
- `frontend/src/features/dashboard/views/DashboardView.tsx`
- `frontend/src/features/education/components/ArticleCard.tsx`
- `frontend/src/features/education/views/ArticleDetailView.tsx`
- `frontend/src/features/education/views/EducationView.tsx`
- `frontend/src/features/notes/views/NotesView.tsx`
- `frontend/src/features/onboarding/views/SplashView.tsx`
- `frontend/src/features/schedule/components/ScheduleCard.tsx`
- `frontend/src/features/schedule/components/ScheduleEmptyState.tsx`
- `frontend/src/features/schedule/components/ScheduleGuideCard.tsx`
- `frontend/src/features/schedule/views/ScheduleView.tsx`
- `frontend/src/features/user/components/ProofDocumentUploader.tsx`
- `frontend/src/features/user/components/UserSidebar.tsx`
- `frontend/src/features/user/views/ProfileView.tsx`
- `frontend/src/features/user/views/VerificationStatusView.tsx`
- `frontend/src/shared/components/ConfirmDeleteDialog.tsx`
- `frontend/src/shared/components/CrudModalDialog.tsx`
- `frontend/src/shared/components/DataTable.tsx`
- `frontend/src/shared/components/Footer.tsx`
- `frontend/src/shared/components/Pagination.tsx`
- `frontend/src/shared/components/ToastFeedback.tsx`
- `frontend/src/shared/components/domain/notes/NoteFormModal.tsx`
- `frontend/src/shared/components/feedback/SplashScreenView.tsx`
- `frontend/src/shared/components/markdown/MarkdownEditor.tsx`
- `frontend/src/shared/components/profile/ProfileContactCard.tsx`
- `frontend/src/shared/components/profile/ProfileHeaderCard.tsx`
- `frontend/src/shared/components/profile/ProfileMetricsGrid.tsx`
- `frontend/src/shared/components/profile/ProfileNotificationCard.tsx`
- `frontend/src/shared/components/profile/ProfileSecuritySection.tsx`
- `frontend/src/shared/components/ui/MobileFilterChips.tsx`

- [ ] **Step 1: Remove redundant `import React from 'react'` in React 19 JSX files and unused Lucide icon / type imports**
- [ ] **Step 2: Verify with `tsc --noUnusedLocals --noEmit` in frontend directory**
  Run: `cd frontend && npx tsc --noUnusedLocals --noEmit`
  Expected: Clean exit code 0 with 0 errors.
- [ ] **Step 3: Run all test suites**
  Run: `npm run test`
  Expected: PASS

---

### Task 3: Component Consolidation & Reuse (`ScheduleDeleteDialog` -> `ConfirmDeleteDialog`)

**Files to Modify:**
- `frontend/src/features/schedule/views/ScheduleView.tsx`
- `frontend/src/features/schedule/components/index.ts`
**Files to Delete:**
- `frontend/src/features/schedule/components/ScheduleDeleteDialog.tsx`

- [ ] **Step 1: Update `ScheduleView.tsx` to use `ConfirmDeleteDialog` from `@/src/shared/components/ConfirmDeleteDialog`**
- [ ] **Step 2: Remove `ScheduleDeleteDialog` export from `frontend/src/features/schedule/components/index.ts` and delete `ScheduleDeleteDialog.tsx`**
- [ ] **Step 3: Run frontend tests and build**
  Run: `npm run build && npm run test:frontend`
  Expected: PASS

---

### Task 4: Modularize & Decompose Monolithic `AdminService` (Backend)

**Files to Create:**
- `backend/src/modules/admin/services/adminUser.service.ts` (User listing, creation, updates, deletion, reminder nudges)
- `backend/src/modules/admin/services/adminArticle.service.ts` (Article CRUD, category normalization, cache clearing)
- `backend/src/modules/admin/services/adminSchedule.service.ts` (Schedule CRUD, query formatting)
- `backend/src/modules/admin/services/adminVerification.service.ts` (Verifications list, detail, approve, reject, document retrieval)
- `backend/src/modules/admin/services/adminReport.service.ts` (Compliance reports & aggregations)

**Files to Modify:**
- `backend/src/modules/admin/admin.service.ts` (Refactor to facade that delegates to sub-services, retaining all types and method signatures)

- [ ] **Step 1: Extract domain sub-services into `backend/src/modules/admin/services/`**
- [ ] **Step 2: Refactor `AdminService` to delegate all static methods to sub-services, preserving existing signatures and types**
- [ ] **Step 3: Run backend build and all backend unit/integration tests**
  Run: `npm run backend:build && npm run test:backend`
  Expected: All 12 backend test suites pass with 0 errors.

---

### Task 5: Modularize Bloated Frontend Components

#### 5A: `VerificationDetailModal.tsx` (616 lines -> modular sub-components)
**Files to Create:**
- `frontend/src/features/admin/components/verification/VerificationBioCard.tsx`
- `frontend/src/features/admin/components/verification/VerificationScreeningList.tsx`
- `frontend/src/features/admin/components/verification/VerificationDocumentCard.tsx`
- `frontend/src/features/admin/components/verification/VerificationAuditHistory.tsx`
**Files to Modify:**
- `frontend/src/features/admin/components/VerificationDetailModal.tsx` (Lean orchestrator component)

- [ ] **Step 1: Extract sub-components for VerificationDetailModal**
- [ ] **Step 2: Update `VerificationDetailModal.tsx` to compose the sub-components**
- [ ] **Step 3: Run tests in `AdminVerificationView.test.tsx` and build**
  Run: `npm run test:frontend -t "AdminVerification"`
  Expected: PASS

#### 5B: `SetupProfileView.tsx` (611 lines -> modular sub-components)
**Files to Create:**
- `frontend/src/features/user/components/PillTypeCardSelector.tsx`
- `frontend/src/features/user/components/BasicProfileFormFields.tsx`
**Files to Modify:**
- `frontend/src/features/user/views/SetupProfileView.tsx`

- [ ] **Step 1: Extract `PillTypeCardSelector` and `BasicProfileFormFields`**
- [ ] **Step 2: Update `SetupProfileView.tsx` to compose them**
- [ ] **Step 3: Run tests in `SetupProfileView.test.tsx`**
  Run: `npm run test:frontend -t "SetupProfileView"`
  Expected: PASS

#### 5C: `DashboardView.tsx` (518 lines -> modular sub-components)
**Files to Create:**
- `frontend/src/features/dashboard/components/MobileHealthStatsBar.tsx`
- `frontend/src/features/dashboard/components/AdminNudgeBanner.tsx`
**Files to Modify:**
- `frontend/src/features/dashboard/views/DashboardView.tsx`

- [ ] **Step 1: Extract `MobileHealthStatsBar` and `AdminNudgeBanner`**
- [ ] **Step 2: Update `DashboardView.tsx` to compose them**
- [ ] **Step 3: Run tests in `DashboardView.test.tsx`**
  Run: `npm run test:frontend -t "DashboardView"`
  Expected: PASS

---

### Task 6: Architectural Consistency, Utility Deduplication & Code Efficiency

**Files to Modify:**
- `backend/src/utils/streakCalculator.ts` & `frontend/src/features/user/utils/streakCalculator.ts` (Ensure consistent comments, clean async/sync handling, and documentation)
- Remove dead `use client` directives in Vite React frontend files (`realtimeSync.ts`, `ConfirmDeleteDialog.tsx`, `LoginView.tsx`, `RegisterView.tsx`, `AuthTabbedContainer.tsx` if any remaining)

- [ ] **Step 1: Clean up redundant `'use client'` pragmas across frontend codebase**
- [ ] **Step 2: Verify consistency of utilities and types across frontend and backend**
- [ ] **Step 3: Run full build and test suite**
  Run: `npm run build && npm run test`
  Expected: PASS

---

### Task 7: Full Verification & Final Regression Testing

- [ ] **Step 1: Run TypeScript compiler check for backend and frontend**
  Run: `npm run backend:build && npm run build`
  Expected: Exit code 0, 0 TypeScript errors
- [ ] **Step 2: Run all backend tests**
  Run: `npm run test:backend`
  Expected: 100% passing tests
- [ ] **Step 3: Run all frontend tests**
  Run: `npm run test:frontend`
  Expected: 100% passing tests
- [ ] **Step 4: Check git status to verify clean directory and no accidental collateral changes**

