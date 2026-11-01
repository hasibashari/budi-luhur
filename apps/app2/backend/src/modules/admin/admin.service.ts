import { AdminReportService, AdminStats, ComplianceReport } from './services/adminReport.service.js';
import { AdminUserService, ManagedUser } from './services/adminUser.service.js';
import { AdminArticleService, HealthArticle } from './services/adminArticle.service.js';
import { AdminScheduleService, MedicationSchedule } from './services/adminSchedule.service.js';
import { AdminVerificationService } from './services/adminVerification.service.js';

export type { AdminStats, ComplianceReport, ManagedUser, HealthArticle, MedicationSchedule };

/**
 * AdminService Facade
 * Provides unified access to modular admin domain services.
 */
export class AdminService {
  // ─── REPORT & OVERVIEW ─────────────────────────────────────────────────────
  static getOverviewStats() {
    return AdminReportService.getOverviewStats();
  }

  static getComplianceReports() {
    return AdminReportService.getComplianceReports();
  }

  // ─── USER MANAGEMENT ───────────────────────────────────────────────────────
  static getManagedUsers() {
    return AdminUserService.getManagedUsers();
  }

  static getManagedUserById(userId: string) {
    return AdminUserService.getManagedUserById(userId);
  }

  static createUser(data: {
    name: string;
    email: string;
    phone: string;
    gender?: string;
    riskLevel?: string;
    schoolOrOrg?: string;
    medicalNotes?: string;
  }) {
    return AdminUserService.createUser(data);
  }

  static updateUser(userId: string, data: any) {
    return AdminUserService.updateUser(userId, data);
  }

  static deleteUser(userId: string) {
    return AdminUserService.deleteUser(userId);
  }

  static sendUserReminder(userId: string, message?: string, channel: string = 'app') {
    return AdminUserService.sendUserReminder(userId, message, channel);
  }

  // ─── ARTICLE MANAGEMENT ───────────────────────────────────────────────────
  static resolveCategory(client: { query: Function }, category: string, articleId?: string) {
    return AdminArticleService.resolveCategory(client, category, articleId);
  }

  static normalizeStoredCategories(client: { query: Function }) {
    return AdminArticleService.normalizeStoredCategories(client);
  }

  static getAdminArticles() {
    return AdminArticleService.getAdminArticles();
  }

  static createAdminArticle(data: {
    title: string;
    category: string;
    summary: string;
    readTime?: string;
    status?: 'Terbit' | 'Draf';
    author?: string;
    imageUrl?: string;
    content?: string;
  }) {
    return AdminArticleService.createAdminArticle(data);
  }

  static updateAdminArticle(articleId: string, data: any) {
    return AdminArticleService.updateAdminArticle(articleId, data);
  }

  static deleteAdminArticle(articleId: string) {
    return AdminArticleService.deleteAdminArticle(articleId);
  }

  // ─── SCHEDULE MANAGEMENT ──────────────────────────────────────────────────
  static getSchedules() {
    return AdminScheduleService.getSchedules();
  }

  static getScheduleById(scheduleId: string) {
    return AdminScheduleService.getScheduleById(scheduleId);
  }

  static createSchedule(data: {
    userId?: string;
    patientId?: string;
    medicationName: string;
    dosage: string;
    frequency: string;
    dayOfWeek?: string;
    timeSlots: string[];
    category?: 'Pil KB Kombinasi' | 'Pil KB Progestin' | 'Suplemen Tambahan';
    instructions?: string;
  }) {
    return AdminScheduleService.createSchedule(data);
  }

  static updateSchedule(scheduleId: string, data: any) {
    return AdminScheduleService.updateSchedule(scheduleId, data);
  }

  static deleteSchedule(scheduleId: string) {
    return AdminScheduleService.deleteSchedule(scheduleId);
  }

  // ─── USER VERIFICATION MANAGEMENT ──────────────────────────────────────────
  static getVerifications(filters?: { status?: string; search?: string }) {
    return AdminVerificationService.getVerifications(filters);
  }

  static getVerificationDetail(userId: string) {
    return AdminVerificationService.getVerificationDetail(userId);
  }

  static getVerificationDocument(userId: string) {
    return AdminVerificationService.getVerificationDocument(userId);
  }

  static approveVerification(userId: string, adminId: string) {
    return AdminVerificationService.approveVerification(userId, adminId);
  }

  static rejectVerification(userId: string, adminId: string, reason: string) {
    return AdminVerificationService.rejectVerification(userId, adminId, reason);
  }

  static getVerificationHistory(userId: string) {
    return AdminVerificationService.getVerificationHistory(userId);
  }
}
