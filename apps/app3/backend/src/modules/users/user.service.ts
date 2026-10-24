import { UserProfileService } from './services/user.profile.service.js';
import {
  ImmunizationService,
  ImmunizationInfoSource,
  ImmunizationDatePrecision,
  ImmunizationVaccineType,
  ImmunizationRecord,
  SaveImmunizationResult,
  syncTTStatusFromVerified,
  IMMUNIZATION_SELECT,
  IMMUNIZATION_SELECT_INSERT,
} from './services/immunization.service.js';
import { CertificateService } from './services/certificate.service.js';

export type {
  ImmunizationInfoSource,
  ImmunizationDatePrecision,
  ImmunizationVaccineType,
  ImmunizationRecord,
  SaveImmunizationResult,
};

export {
  UserProfileService,
  ImmunizationService,
  CertificateService,
  syncTTStatusFromVerified,
  IMMUNIZATION_SELECT,
  IMMUNIZATION_SELECT_INSERT,
};

/**
 * UserService Facade
 * Menyediakan antarmuka terpadu (backward-compatible) yang mendelegasikan
 * implementasi ke sub-service yang terspesialisasi:
 * - UserProfileService: Profil catin, onboarding, dashboard, dan streak
 * - ImmunizationService: Riwayat TT, validasi interval medis, lampiran bukti, dan verifikasi dosis
 * - CertificateService: Pengajuan dan verifikasi sertifikat imunisasi digital
 */
export class UserService {
  // ─── Profile & Dashboard ────────────────────────────────────────────────
  static calculateAndSyncUserStreak = UserProfileService.calculateAndSyncUserStreak.bind(UserProfileService);
  static getDashboardData = UserProfileService.getDashboardData.bind(UserProfileService);
  static getProfile = UserProfileService.getProfile.bind(UserProfileService);
  static updateProfile = UserProfileService.updateProfile.bind(UserProfileService);
  static saveInitialSetup = UserProfileService.saveInitialSetup.bind(UserProfileService);

  // ─── Immunization Records & Validation ───────────────────────────────────
  static getImmunizationRecords = ImmunizationService.getImmunizationRecords.bind(ImmunizationService);
  static validateImmunizationRecord = ImmunizationService.validateImmunizationRecord.bind(ImmunizationService);
  static saveImmunizationRecord = ImmunizationService.saveImmunizationRecord.bind(ImmunizationService);
  static updateImmunizationRecord = ImmunizationService.updateImmunizationRecord.bind(ImmunizationService);
  static deleteImmunizationRecord = ImmunizationService.deleteImmunizationRecord.bind(ImmunizationService);
  static verifyImmunizationRecord = ImmunizationService.verifyImmunizationRecord.bind(ImmunizationService);

  // ─── Immunization Attachments ───────────────────────────────────────────
  static saveImmunizationAttachment = ImmunizationService.saveImmunizationAttachment.bind(ImmunizationService);
  static getImmunizationAttachment = ImmunizationService.getImmunizationAttachment.bind(ImmunizationService);
  static deleteImmunizationAttachment = ImmunizationService.deleteImmunizationAttachment.bind(ImmunizationService);

  // ─── Certificate Verification ───────────────────────────────────────────
  static getCertificateVerification = CertificateService.getCertificateVerification.bind(CertificateService);
  static requestCertificateVerification = CertificateService.requestCertificateVerification.bind(CertificateService);
  static listCertificateVerifications = CertificateService.listCertificateVerifications.bind(CertificateService);
  static reviewCertificateVerification = CertificateService.reviewCertificateVerification.bind(CertificateService);
}
