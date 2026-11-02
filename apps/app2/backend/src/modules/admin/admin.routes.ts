import { Router } from 'express';
import { AdminController } from './admin.controller.js';
import { authMiddleware } from '../../middlewares/auth.middleware.js';
import { roleMiddleware } from '../../middlewares/role.middleware.js';

export const adminRoutes = Router();

// Protect all admin routes with auth and admin role
adminRoutes.use(authMiddleware as any);
adminRoutes.use(roleMiddleware(['admin']) as any);

adminRoutes.get('/stats', AdminController.getStats as any);
adminRoutes.get('/users', AdminController.getUsers as any);
adminRoutes.get('/users/:id', AdminController.getUserById as any);
adminRoutes.post('/users', AdminController.createUser as any);
adminRoutes.put('/users/:id', AdminController.updateUser as any);
adminRoutes.delete('/users/:id', AdminController.deleteUser as any);
adminRoutes.post('/reminders/send', AdminController.sendReminder as any);

adminRoutes.get('/articles', AdminController.getArticles as any);
adminRoutes.post('/articles', AdminController.createArticle as any);
adminRoutes.put('/articles/:id', AdminController.updateArticle as any);
adminRoutes.delete('/articles/:id', AdminController.deleteArticle as any);

// Read-only schedule monitoring for admin
adminRoutes.get('/schedules', AdminController.getSchedules as any);
adminRoutes.get('/schedules/:id', AdminController.getScheduleById as any);

adminRoutes.get('/compliance', AdminController.getComplianceReports as any);
adminRoutes.put('/profile', AdminController.updateProfile as any);

// ─── User Verifications ──────────────────────────────────────────────────────
adminRoutes.get('/verifications', AdminController.getVerifications as any);
adminRoutes.get('/verifications/:userId', AdminController.getVerificationDetail as any);
adminRoutes.get('/verifications/:userId/document', AdminController.getVerificationDocument as any);
adminRoutes.post('/verifications/:userId/approve', AdminController.approveVerification as any);
adminRoutes.post('/verifications/:userId/reject', AdminController.rejectVerification as any);
adminRoutes.get('/verifications/:userId/history', AdminController.getVerificationHistory as any);

export default adminRoutes;
