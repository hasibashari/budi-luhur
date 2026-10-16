import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  CalendarCheck,
  TrendingUp,
  FileText,
  AlertTriangle,
  ChevronRight,
  ArrowUpRight,
  BellRing,
} from 'lucide-react';
import AdminHeader from '../components/AdminHeader';
import StatCard from '@/src/shared/components/StatCard';
import SendReminderModal from '../components/SendReminderModal';
import { ToastFeedback } from '@/src/shared/components/ToastFeedback';
import { Avatar } from '@/src/shared/components/ui/Avatar';
import {
  getAdminStatsAction,
  getComplianceReportsAction,
  getUsersAction,
} from '../api/adminRepository';
import {
  AdminStats,
  ManagedUser,
  ComplianceReport,
} from '../types/admin.types';
import { publishRealtimeEvent } from '@/src/shared/utils/realtimeSync';

export default function AdminDashboardView() {
  const [stats, setStats] = useState<AdminStats>({
    totalUsers: 0,
    activeSchedules: 0,
    adherenceRate: 0,
    publishedArticles: 0,
    activePrograms: 0,
  });

  const [reports, setReports] = useState<ComplianceReport[]>([]);
  const [highRiskUsers, setHighRiskUsers] = useState<ManagedUser[]>([]);

  // State for Send Reminder Modal
  const [reminderModalOpen, setReminderModalOpen] = useState(false);
  const [reminderData, setReminderData] = useState({
    userName: '',
    userPhone: '',
    userId: '',
    medicationName: 'Pil KB Kombinasi (28 Tablet)',
    dosage: '1 Tablet',
    timeSlot: '20:00',
  });

  // State for Toast
  const [toastOpen, setToastOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState('');

  useEffect(() => {
    let isMounted = true;
    async function fetchDashboard() {
      try {
        const [statsData, reportsData, allUsers] = await Promise.all([
          getAdminStatsAction(),
          getComplianceReportsAction(),
          getUsersAction(),
        ]);

        if (isMounted) {
          setStats(statsData);
          setReports(reportsData);
          const highRisk = allUsers.filter(
            u => u.riskLevel === 'Tinggi' || u.adherenceRate < 85,
          );
          setHighRiskUsers(highRisk.length > 0 ? highRisk : allUsers.slice(0, 4));
        }
      } catch (err) {
        console.error('Failed to load admin dashboard data:', err);
      }
    }

    fetchDashboard();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleOpenReminder = (name: string, phone: string, userId?: string) => {
    setReminderData({
      userName: name,
      userPhone: phone,
      userId: userId || '',
      medicationName: 'Pil KB Kombinasi (28 Tablet)',
      dosage: '1 Tablet',
      timeSlot: '20:00',
    });
    setReminderModalOpen(true);
  };

  const handleSendSuccess = (channel: 'whatsapp' | 'app', _messageText?: string) => {
    if (channel === 'app' && reminderData.userId) {
      publishRealtimeEvent('NUDGE_SENT', {
        patientId: reminderData.userId,
        senderName: 'Bidan / Tim Faskes',
      });
    }
    setToastMsg(
      channel === 'whatsapp'
        ? `Pengingat WhatsApp berhasil disiapkan untuk ${reminderData.userName}!`
        : `Pengingat realtime berhasil dikirimkan ke aplikasi ${reminderData.userName}!`,
    );
    setToastOpen(true);
  };

  return (
    <div className='animate-fade-in'>
      <AdminHeader
        title='Dashboard Utama Bidan & Faskes'
        subtitle='Pantau capaian kepatuhan minum Pil KB, aktivitas harian akseptor, dan edukasi kesehatan secara real-time.'
      />

      {/* Entry Portal Banner */}
      <div className='mb-6 p-4 sm:p-6 rounded-3xl border border-slate-200 bg-white shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4'>
        <div className='flex items-center gap-4'>
          <div className='w-12 h-12 rounded-2xl bg-teal-50 text-teal-700 flex items-center justify-center shrink-0 border border-teal-100'>
            <CalendarCheck size={26} />
          </div>
          <div>
            <h3 className='font-bold text-slate-800 text-sm sm:text-base leading-tight'>
              Pengelolaan Jadwal & Pengingat Pil KB
            </h3>
            <p className='text-xs sm:text-sm text-slate-500 mt-1 leading-relaxed'>
              Akses konfigurasi dosis, jam minum pil, dan pemantauan kepatuhan harian akseptor KB.
            </p>
          </div>
        </div>

        <Link
          to='/admin/schedules'
          className='inline-flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-xl bg-teal-600 text-white font-bold text-sm hover:bg-teal-700 shadow-xs transition-all cursor-pointer whitespace-nowrap'
        >
          <span>Buka Jadwal</span>
          <ChevronRight size={16} />
        </Link>
      </div>

      {/* KPI Cards Grid */}
      <div className='grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5 mb-6'>
        <StatCard
          title='Total Akseptor Terdaftar'
          value={stats.totalUsers}
          icon={Users}
          iconBgColor='#f0fdfa'
          iconColor='#0d9488'
          subtitle={
            <div className='flex items-center gap-1 mt-1'>
              <span className='px-2 py-0.5 rounded-full bg-teal-50 text-teal-800 text-[10px] font-extrabold border border-teal-100'>
                +12 bln ini
              </span>
            </div>
          }
        />

        <StatCard
          title='Jadwal Pengingat Aktif'
          value={stats.activeSchedules}
          icon={CalendarCheck}
          iconBgColor='#f0fdfa'
          iconColor='#0d9488'
          subtitle={`${stats.totalUsers} akseptor aktif`}
        />

        <StatCard
          title='Kepatuhan Rata-rata'
          value={`${stats.adherenceRate}%`}
          icon={TrendingUp}
          iconBgColor='#ecfdf5'
          iconColor='#10b981'
          subtitle={
            <span className='text-[#10b981] font-bold text-xs'>
              {stats.adherenceRate >= 90 ? 'Proteksi 99% Optimal' : 'Cukup Baik'}
            </span>
          }
        />

        <StatCard
          title='Artikel Edukasi Aktif'
          value={stats.publishedArticles}
          icon={FileText}
          iconBgColor='#f8fafc'
          iconColor='#475569'
          subtitle='Materi Pil KB & SADARI'
        />
      </div>

      {/* Analytics & Compliance Trends */}
      <div className='grid grid-cols-1 lg:grid-cols-12 gap-6'>
        {/* Compliance Trend Visualizer */}
        <div className='lg:col-span-7 xl:col-span-8 p-5 sm:p-6 rounded-3xl border border-slate-200 bg-white shadow-xs flex flex-col justify-between'>
          <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4'>
            <div>
              <h3 className='font-bold text-slate-800 text-base'>Tren Kepatuhan Minum Pil KB</h3>
              <p className='text-xs text-slate-500 mt-0.5'>
                Persentase jadwal pil KB yang diminum tepat waktu oleh akseptor
              </p>
            </div>
            <Link
              to='/admin/reports'
              className='inline-flex items-center gap-1 text-xs font-bold text-teal-700 hover:text-teal-800 transition-colors'
            >
              <span>Lihat Detail</span>
              <ArrowUpRight size={14} />
            </Link>
          </div>

          {/* Bar Chart Visualizer */}
          <div className='overflow-x-auto pb-2'>
            <div className='flex items-end justify-between h-48 min-w-[320px] pt-6 pb-2 px-2 sm:px-4'>
              {reports.map((report, idx) => {
                const dateLabel =
                  typeof report.date === 'string'
                    ? report.date
                    : report.date && typeof report.date === 'object'
                      ? new Date(String(report.date)).toLocaleDateString('id-ID', {
                          day: 'numeric',
                          month: 'short',
                        })
                      : String(report.date || '');

                return (
                  <div key={`${dateLabel}-${idx}`} className='flex flex-col items-center flex-1'>
                    <span className='font-bold text-[11px] text-slate-800 mb-1.5'>
                      {report.adherencePercentage.toFixed(0)}%
                    </span>
                    <div
                      className={`w-1/2 max-w-[28px] rounded-t-md transition-all duration-300 hover:opacity-85 ${
                        report.adherencePercentage >= 90 ? 'bg-teal-600' : 'bg-orange-400'
                      }`}
                      style={{ height: `${report.adherencePercentage * 1.3}px` }}
                    />
                    <span className='text-[11px] text-slate-500 font-medium mt-2 whitespace-nowrap'>
                      {dateLabel}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className='flex items-center justify-center gap-6 pt-4 mt-2 border-t border-slate-100 flex-wrap'>
            <div className='flex items-center gap-2'>
              <span className='w-2.5 h-2.5 rounded-full bg-teal-600' />
              <span className='text-xs font-semibold text-slate-600'>Proteksi Optimal (≥90%)</span>
            </div>
            <div className='flex items-center gap-2'>
              <span className='w-2.5 h-2.5 rounded-full bg-orange-400' />
              <span className='text-xs font-semibold text-slate-600'>
                Perlu Pendampingan (&lt;90%)
              </span>
            </div>
          </div>
        </div>

        {/* High Risk Users Alert Box */}
        <div className='lg:col-span-5 xl:col-span-4 p-5 sm:p-6 rounded-3xl border border-slate-200 bg-white shadow-xs flex flex-col justify-between'>
          <div>
            <div className='flex items-center justify-between mb-2'>
              <div className='flex items-center gap-2'>
                <AlertTriangle size={18} className='text-orange-500' />
                <h3 className='font-bold text-slate-800 text-base'>Akseptor Perlu Perhatian</h3>
              </div>
              <Link
                to='/admin/users'
                className='inline-flex items-center gap-1 text-xs font-bold text-teal-700 hover:text-teal-800 transition-colors'
              >
                <span>Semua</span>
                <ChevronRight size={14} />
              </Link>
            </div>

            <p className='text-xs text-slate-500 mb-4'>
              Akseptor dengan kepatuhan rendah atau membutuhkan dorongan pengingat minum pil:
            </p>

            <div className='space-y-3'>
              {highRiskUsers.slice(0, 4).map(user => (
                <div
                  key={user.id}
                  className='p-3.5 rounded-2xl border border-orange-200 bg-orange-50/60 flex items-center justify-between gap-3'
                >
                  <div className='flex items-center gap-3 min-w-0 flex-1'>
                    <Avatar
                      src={user.avatarUrl}
                      name={user.name}
                      size='md'
                      ringClassName='ring-1 ring-orange-200 shadow-2xs'
                    />
                    <div className='min-w-0 flex-1'>
                      <div className='font-bold text-xs sm:text-sm text-slate-900 truncate'>
                        {user.name}
                      </div>
                      <div className='text-[11px] text-slate-500 truncate'>
                        {user.age} th • {user.phone}
                      </div>
                    </div>
                  </div>

                  <div className='flex items-center gap-2 shrink-0'>
                    <span className='px-2.5 py-1 rounded-full bg-orange-100 text-orange-800 font-extrabold text-[11px]'>
                      {user.adherenceRate}%
                    </span>
                    <button
                      type='button'
                      title='Kirim Pengingat'
                      onClick={() => handleOpenReminder(user.name, user.phone, user.id)}
                      className='w-10 h-10 rounded-xl bg-orange-200/80 text-orange-900 hover:bg-orange-300 flex items-center justify-center transition-colors cursor-pointer'
                    >
                      <BellRing size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Send Reminder Modal */}
      <SendReminderModal
        open={reminderModalOpen}
        onClose={() => setReminderModalOpen(false)}
        userName={reminderData.userName}
        userPhone={reminderData.userPhone}
        userId={reminderData.userId}
        medicationName={reminderData.medicationName}
        dosage={reminderData.dosage}
        timeSlot={reminderData.timeSlot}
        onSendSuccess={handleSendSuccess}
      />

      {/* Toast Feedback */}
      <ToastFeedback
        open={toastOpen}
        message={toastMsg}
        severity='success'
        onClose={() => setToastOpen(false)}
      />
    </div>
  );
}
