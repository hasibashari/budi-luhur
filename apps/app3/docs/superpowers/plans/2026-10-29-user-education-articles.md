# User Education Articles Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Enable standard users to create, view, edit, and manage their own health education articles with automatic 'Draf' status, while reserving publishing and full management authority to admins, ensuring draft articles are strictly protected from public access.

**Architecture:** 
- PostgreSQL schema adds `author_id` referencing `users(id)` to the `articles` table with index.
- Express backend provides authenticated endpoints for users to manage their own articles (`/api/v1/articles/my-articles`, `POST /api/v1/articles`, `PUT /api/v1/articles/:id`, `DELETE /api/v1/articles/:id`) and secure presigned image uploads.
- Route protection: public endpoints `GET /api/v1/articles` and `GET /api/v1/articles/:id` ensure draft articles are never accessible to the public or unauthorized users.
- Admin portal adds a status filter (Semua, Draf, Terbit) and one-click publishing capability.
- User education view introduces tabs ("Jelajahi Edukasi" & "Artikel Saya") with "+ Tulis Artikel" and full modal editing capabilities.

**Tech Stack:** TypeScript, Node.js, Express.js, PostgreSQL (pg), React, Vite, Tailwind CSS, Lucide icons.

## Global Constraints
- Database status values are `'Terbit'` and `'Draf'`, enforced by PostgreSQL CHECK constraint.
- Standard users can NEVER publish directly (`status` forced to `'Draf'` on creation and updates).
- Only the author or an admin can view/edit/delete an article that is in 'Draf' status.
- Public views and APIs only return articles where `status = 'Terbit'`.
- Codebase guidelines: Modular Express architecture in backend, feature-based React+Vite architecture in frontend.

## Review Focus
- Unauthenticated or non-author access to draft article via direct ID lookup returns 404/403.
- Normal user attempting to send `status: 'Terbit'` in POST or PUT must have the status overridden or locked to `'Draf'`.
- Normal user attempting to edit or delete another user's article must be blocked (403 Forbidden).
- Admin can review, edit, and change status of user-created drafts to `'Terbit'`.
- Frontend displays distinct status badges and prevents broken image uploads or empty markdown content.

---

### Task 1: Database Migration & Schema Update
**Files:**
- Modify: `backend/src/db/schema.sql`
- Modify: `backend/src/db/migrate.ts`

**Steps:**
- [ ] Add `author_id VARCHAR(255) REFERENCES users(id) ON DELETE SET NULL` to `articles` definition in `backend/src/db/schema.sql`.
- [ ] Add `idx_articles_author_id` index on `articles(author_id)` in `schema.sql`.
- [ ] Update `backend/src/db/migrate.ts` to add `author_id` column if not exists, create index `idx_articles_author_id`, and remove the legacy drop column statement.

---

### Task 2: Backend Article Service & Controller Access Control
**Files:**
- Modify: `backend/src/modules/articles/article.service.ts`
- Modify: `backend/src/modules/articles/article.controller.ts`
- Modify: `backend/src/modules/articles/article.routes.ts`
- Modify: `backend/src/modules/admin/admin.service.ts`

**Steps:**
- [ ] In `article.service.ts`, add `getUserArticles(userId: string)`, `createUserArticle(userId, userName, data)`, `updateUserArticle(userId, userRole, articleId, data)`, and `deleteUserArticle(userId, userRole, articleId)`.
- [ ] In `article.service.ts`, update `getArticleById` to check `status === 'Draf'`: if draft, require `currentUser` to be an admin or `currentUser.id === row.author_id`; otherwise return null (404).
- [ ] In `article.controller.ts`, implement `getUserArticles`, `createArticle`, `updateArticle`, `deleteArticle`, and `presignArticleUpload`.
- [ ] In `article.routes.ts`, register the user routes protected by `authMiddleware`.
- [ ] In `admin.service.ts`, ensure `getAdminArticles` returns `author_id` and author details, and `updateAdminArticle` can change article status to `'Terbit'`.

---

### Task 3: Backend Unit & Integration Tests
**Files:**
- Create: `backend/src/modules/articles/__tests__/articles.user-workflow.test.ts`

**Steps:**
- [ ] Write tests verifying:
  - Public cannot retrieve draft articles via list or detail.
  - User creates article -> saved with `status = 'Draf'` and `author_id = user.id`.
  - User cannot force `status = 'Terbit'`.
  - User can view, edit, and delete their own draft.
  - User B cannot edit or delete User A's draft.
  - Admin can update user draft status to `'Terbit'`.
- [ ] Run `npm --prefix backend test` and verify all tests pass.

---

### Task 4: Frontend API & Shared Repository Updates
**Files:**
- Modify: `frontend/src/features/education/api/educationRepository.ts`
- Modify: `frontend/src/features/education/types/index.ts`
- Modify: `frontend/src/features/admin/types/admin.types.ts`
- Modify: `frontend/src/features/admin/api/articleRepository.ts`

**Steps:**
- [ ] Add types: `authorId?: string; status?: 'Terbit' | 'Draf';` in `Article` interface.
- [ ] Add `getUserArticlesAction`, `createUserArticleAction`, `updateUserArticleAction`, `deleteUserArticleAction`, and `getArticlePresignedUrlAction` in `educationRepository.ts`.
- [ ] In `admin/api/articleRepository.ts`, add helper to publish an article (`publishAdminArticleAction` or update status).

---

### Task 5: User Education Interface with Tabs and Article Management
**Files:**
- Create: `frontend/src/features/education/components/UserArticleFormModal.tsx` (or adapt `ArticleFormModal`)
- Modify: `frontend/src/features/education/views/EducationView.tsx`

**Steps:**
- [ ] Support reusable `ArticleFormModal` with an `isUserMode?: boolean` prop (or create specialized `UserArticleFormModal`).
  - When `isUserMode`: status is locked to `'Draf'`, modal title is "Tulis Artikel Edukasi Baru", submit button says "Simpan Draf Artikel", helper explains admin review process.
- [ ] In `EducationView.tsx`:
  - Add active tab state: `'explore' | 'my-articles'`.
  - Show "Artikel Saya" tab if user is authenticated.
  - In "Artikel Saya" view, render:
    - Information banner: "Artikel yang Anda tulis akan berstatus Draf dan akan ditinjau oleh Admin Faskes sebelum tayang ke publik."
    - Button "+ Tulis Artikel Baru" opening the form modal.
    - List of user articles with status badge (`Draf` vs `Terbit`), preview link, edit button, and delete button.
    - Empty state when user hasn't written any articles yet.

---

### Task 6: Admin Article Management Enhancement (Filter & Quick Publish)
**Files:**
- Modify: `frontend/src/features/admin/views/ArticleManagementView.tsx`

**Steps:**
- [ ] Add Status Filter selector: `Semua Status`, `Draf`, `Terbit`.
- [ ] In table rows, add quick "Terbitkan" (Publish) button for articles that are currently in `'Draf'` status.
- [ ] Add confirmation before publishing: upon clicking "Terbitkan", admin confirms and the article status is updated to `'Terbit'`.
- [ ] Add author badge / attribution distinguishing user-submitted articles vs admin articles.

---

### Task 7: End-to-End Verification & Build
**Steps:**
- [ ] Run backend tests: `npm --prefix backend test`.
- [ ] Run frontend production build: `npm --prefix frontend run build`.
- [ ] Verify there are no TypeScript, lint, or runtime errors.

