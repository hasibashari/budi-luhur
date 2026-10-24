import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  CalendarCheck,
  TrendingUp,
  AlertTriangle,
  ArrowUpRight,
  ChevronRight,
  BellRing,
} from 'lucide-react';
import AdminHeader from '../components/AdminHeader';
import StatCard from '@/src/shared/components/StatCard';
import SendReminderModal from '../components/SendReminderModal';
import { ToastFeedback } from '@/src/shared/components/ToastFeedback';
import { Avatar } from '@/src/shared/components/ui/Avatar';
import { getAdminStatsAction } from '../api/adminStatsRepository';
import { getUsersAction, sendUserReminderAction } from '../api/userManagementRepository';
import { getComplianceReportsAction } from '../api/complianceRepository';
import { publishRealtimeEvent } from '@/src/shared/utils/realtimeSync';
import { AdminStats, ManagedUser, ComplianceReport } from '../types/admin.types';

export default function AdminDashboardView() {
  const [stats, setStats] = useState<AdminStats>({
    totalUsers: 0,
    activeSchedules: 0,
    adherenceRate: 0,
    publishedArticles: 0,
    activePrograms: 0,
  });
  const [users, setUsers] = useState<ManagedUser[]>([]);
  const [reports, setReports] = useState<ComplianceReport[]>([]);

  React.useEffect(() => {
    let isMounted = true;
    const fetchData = async () => {
      const [s, u, r] = await Promise.all([
        getAdminStatsAction(),
        getUsersAction(),
        getComplianceReportsAction(),
      ]);
      if (isMounted) {
        setStats(s);
        setUsers(u);
        setReports(r);
      }
    };
    fetchData();
    return () => {
      isMounted = false;
    };
  }, []);

  const highRiskUsers = users.filter(u => u.riskLevel === 'Tinggi');

  // Reminder Modal State
  const [reminderModalOpen, setReminderModalOpen] = useState(false);
  const [reminderData, setReminderData] = useState<{
    userId?: string;
    userName: string;
    userPhone?: string;
    medicationName?: string;
    dosage?: string;
    timeSlot?: string;
  }>({
    userName: '',
  });

  // Toast Notification State
  const [toastOpen, setToastOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState('');

  const handleOpenReminder = (
    name: string,
    phone?: string,
    userId?: string,
    medicationName?: string,
    dosage?: string,
    timeSlot?: string,
  ) => {
    setReminderData({
      userId: userId || '',
      userName: name,
      userPhone: phone || '',
      medicationName: medicationName || 'Imunisasi Tetanus Toxoid (TT)',
      dosage: dosage || '1 Dosis (0.5 mL)',
      timeSlot: timeSlot || '09:00 WIB',
    });
    setReminderModalOpen(true);
  };

  const handleSendSuccess = async (channel: 'app' | 'whatsapp', messageSent: string) => {
    if (reminderData.userId) {
      await sendUserReminderAction(reminderData.userId, messageSent, channel);
      publishRealtimeEvent('NUDGE_SENT', {
        userId: reminderData.userId,
        patientId: reminderData.userId,
      });
    }
    const channelName = channel === 'whatsapp' ? 'WhatsApp' : 'Notifikasi App';
    setToastMsg(
      `Pengingat imunisasi TT berhasil dikirimkan ke ${reminderData.userName} via ${channelName}!`,
    );
    setToastOpen(true);
  };

  return (
    <div>
      <AdminHeader
        title='Dashboard Petugas Faskes & KUA'
        subtitle='Pantau cakupan imunisasi Tetanus Toxoid (TT), jadwal vaksinasi catin, dan bimbingan pranikah secara terpadu.'
      />

      {/* Entry Portal Banner */}
      <div className='mb-6 p-4 sm:p-6 rounded-3xl border border-[#ffd9de]/80 bg-linear-to-r from-white via-[#eff4ff] to-[#ffd9de]/30 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4'>
        <div className='flex items-center gap-4'>
          <div className='w-12 h-12 rounded-2xl bg-[#ffd9de]/60 text-[#aa294d] flex items-center justify-center shrink-0 border border-[#ffd9de]'>
            <CalendarCheck size={26} />
          </div>
          <div>
            <h3 className='font-bold text-[#121c2a] text-sm sm:text-base leading-tight'>
              Pengelolaan Jadwal Imunisasi TT & Skrining Pranikah
            </h3>
            <p className='text-xs sm:text-sm text-[#574144] mt-1 leading-relaxed'>
              Akses konfigurasi dosis vaksin TT1–TT5, jadwal kunjungan faskes, dan pemantauan
              kepatuhan catin.
            </p>
          </div>
        </div>

        <Link
          to='/admin/schedules'
          className='inline-flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-xl bg-[#aa294d] text-white font-bold text-sm hover:bg-[#cb4364] shadow-md shadow-[#aa294d]/20 transition-all cursor-pointer whitespace-nowrap'
        >
          <span>Buka Jadwal</span>
          <ChevronRight size={16} />
        </Link>
      </div>

      {/* KPI Cards Grid */}
      <div className='grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5 mb-6'>
        <StatCard
          title='Total Calon Pengantin'
          value={stats.totalUsers}
          icon={Users}
          iconBgColor='#ffd9de'
          iconColor='#aa294d'
          subtitle={
            <div className='flex items-center gap-1 mt-1'>
              <span className='px-2 py-0.5 rounded-full bg-[#ffd9de]/60 text-[#8c0f39] text-[10px] font-extrabold'>
                +12 bln ini
              </span>
            </div>
          }
        />

        <StatCard
          title='Jadwal Imunisasi Aktif'
          value={stats.activeSchedules}
          icon={CalendarCheck}
          iconBgColor='#aff1d0'
          iconColor='#2a6950'
          subtitle={`${stats.totalUsers} catin terdaftar`}
        />

        <StatCard
          title='Kepatuhan Rata-rata'
          value={`${stats.adherenceRate}%`}
          icon={TrendingUp}
          iconBgColor='#eff4ff'
          iconColor='#aa294d'
          subtitle={
            <div className='w-full bg-[#dee9fc] h-1.5 rounded-full overflow-hidden mt-1.5'>
              <div
                className='bg-[#2a6950] h-full rounded-full transition-all duration-500'
                style={{ width: `${stats.adherenceRate}%` }}
              />
            </div>
          }
        />

        <StatCard
          title='Risiko Tinggi'
          value={highRiskUsers.length.toString()}
          icon={AlertTriangle}
          iconBgColor='#ffd9de'
          iconColor='#cb4364'
          valueColor='#aa294d'
          subtitle='Perlu tindak lanjut'
        />
      </div>

      {/* Main Content Grid: Compliance Chart & High Risk Users */}
      <div className='grid grid-cols-1 lg:grid-cols-12 gap-6'>
        {/* Compliance Trend Visualizer */}
        <div className='lg:col-span-7 xl:col-span-8 p-5 sm:p-6 rounded-3xl border border-[#eff4ff] bg-white shadow-xs flex flex-col justify-between'>
          <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4'>
            <div>
              <h3 className='font-bold text-[#121c2a] text-base'>
                Tren Kepatuhan Vaksinasi & Konseling TT
              </h3>
              <p className='text-xs text-[#574144] mt-0.5'>
                Persentase pemenuhan jadwal imunisasi TT calon pengantin tepat waktu
              </p>
            </div>
            <Link
              to='/admin/reports'
              className='inline-flex items-center gap-1 text-xs font-bold text-[#aa294d] hover:text-[#cb4364] transition-colors'
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
                    <span className='font-bold text-[11px] text-[#121c2a] mb-1.5'>
                      {report.adherencePercentage.toFixed(0)}%
                    </span>
                    <div
                      className={`w-1/2 max-w-[28px] rounded-t-md transition-all duration-300 hover:opacity-85 ${
                        report.adherencePercentage >= 90 ? 'bg-[#2a6950]' : 'bg-[#aa294d]'
                      }`}
                      style={{ height: `${report.adherencePercentage * 1.3}px` }}
                    />
                    <span className='text-[11px] text-[#8b7074] font-medium mt-2 whitespace-nowrap'>
                      {dateLabel}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className='flex items-center justify-center gap-6 pt-4 mt-2 border-t border-[#eff4ff] flex-wrap'>
            <div className='flex items-center gap-2'>
              <span className='w-2.5 h-2.5 rounded-full bg-[#2a6950]' />
              <span className='text-xs font-semibold text-[#121c2a]'>Kepatuhan Optimal (≥90%)</span>
            </div>
            <div className='flex items-center gap-2'>
              <span className='w-2.5 h-2.5 rounded-full bg-[#aa294d]' />
              <span className='text-xs font-semibold text-[#121c2a]'>
                Perlu Perhatian (&lt;90%)
              </span>
            </div>
          </div>
        </div>

        {/* High Risk Users Alert Box */}
        <div className='lg:col-span-5 xl:col-span-4 p-5 sm:p-6 rounded-3xl border border-[#eff4ff] bg-white shadow-xs flex flex-col justify-between'>
          <div>
            <div className='flex items-center justify-between mb-2'>
              <div className='flex items-center gap-2'>
                <AlertTriangle size={18} className='text-[#aa294d]' />
                <h3 className='font-bold text-[#121c2a] text-base'>Catin Perlu Perhatian</h3>
              </div>
              <Link
                to='/admin/users'
                className='inline-flex items-center gap-1 text-xs font-bold text-[#aa294d] hover:text-[#cb4364] transition-colors'
              >
                <span>Semua</span>
                <ChevronRight size={14} />
              </Link>
            </div>

            <p className='text-xs text-[#574144] mb-4'>
              Calon pengantin dengan kepatuhan rendah atau membutuhkan pengingat jadwal TT:
            </p>

            <div className='space-y-3'>
              {highRiskUsers.slice(0, 4).map(user => (
                <div
                  key={user.id}
                  className='p-3.5 rounded-2xl border border-[#ffd9de]/80 bg-[#ffd9de]/20 flex items-center justify-between gap-3'
                >
                  <div className='flex items-center gap-3 min-w-0 flex-1'>
                    <Avatar
                      src={user.avatarUrl}
                      name={user.name}
                      size='md'
                      ringClassName='ring-1 ring-[#ffd9de] shadow-2xs'
                    />
                    <div className='min-w-0 flex-1'>
                      <div className='font-bold text-xs sm:text-sm text-[#121c2a] truncate'>
                        {user.name}
                      </div>
                      <div className='text-[11px] text-[#574144] truncate'>
                        {user.age} th • {user.phone}
                      </div>
                    </div>
                  </div>

                  <div className='flex items-center gap-2 shrink-0'>
                    <span className='px-2.5 py-1 rounded-full bg-[#ffd9de] text-[#8c0f39] font-extrabold text-[11px]'>
                      {user.adherenceRate === null ? '—' : `${user.adherenceRate}%`}
                    </span>
                    <button
                      type='button'
                      title='Kirim Pengingat'
                      onClick={() =>
                        handleOpenReminder(user.name, user.phone || undefined, user.id)
                      }
                      className='w-10 h-10 rounded-xl bg-[#aa294d] text-white hover:bg-[#cb4364] flex items-center justify-center transition-colors shadow-xs cursor-pointer'
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
