import { useState, useEffect } from 'react';
import { Printer, TrendingUp, CheckCircle2, AlertCircle, FileSpreadsheet } from 'lucide-react';
import AdminHeader from '../components/AdminHeader';
import { getComplianceReportsAction } from '../api/complianceRepository';
import { getUsersAction } from '../api/userManagementRepository';
import { ComplianceReport, ManagedUser } from '../types/admin.types';
import { Avatar } from '@/src/shared/components/ui/Avatar';

export default function ReportAnalyticsView() {
  const [period, setPeriod] = useState('7-hari');
  const [reports, setReports] = useState<ComplianceReport[]>([]);
  const [users, setUsers] = useState<ManagedUser[]>([]);

  useEffect(() => {
    let isMounted = true;
    const fetchReports = async () => {
      const [r, u] = await Promise.all([getComplianceReportsAction(), getUsersAction()]);
      if (isMounted) {
        setReports(r);
        setUsers(u);
      }
    };
    fetchReports();
    return () => {
      isMounted = false;
    };
  }, []);

  const totalTaken = reports.reduce((acc, curr) => acc + curr.takenCount, 0);
  const totalMissed = reports.reduce((acc, curr) => acc + curr.missedCount, 0);
  const totalSum = totalTaken + totalMissed;
  const overallRate = totalSum > 0 ? ((totalTaken / totalSum) * 100).toFixed(1) : '100.0';

  const handleExportCSV = () => {
    const csvContent =
      'data:text/csv;charset=utf-8,Hari,Diminum,Terlewat,Persentase Kepatuhan\n' +
      reports
        .map(r => `${r.date},${r.takenCount},${r.missedCount},${r.adherencePercentage}%`)
        .join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Laporan_Kepatuhan_Pil_KB_${period}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className='space-y-6 animate-fade-in'>
      <AdminHeader
        title='Laporan & Analitik Kepatuhan Pil KB'
        subtitle='Analisis statistik kepatuhan konsumsi pil KB akseptor, tren perlindungan berkala, serta ekspor data.'
      />

      {/* Control Bar */}
      <div className='bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-5 border border-slate-200 shadow-sm'>
        <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-4'>
          <div className='flex items-center gap-3 flex-wrap'>
            <div className='flex items-center gap-2'>
              <label htmlFor='report-period' className='text-xs font-semibold text-slate-500 uppercase tracking-wider hidden sm:inline'>
                Periode:
              </label>
              <select
                id='report-period'
                value={period}
                onChange={e => setPeriod(e.target.value)}
                className='px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-600 focus:bg-white transition-all cursor-pointer'
              >
                <option value='7-hari'>7 Hari Terakhir</option>
                <option value='30-hari'>30 Hari Terakhir</option>
                <option value='3-bulan'>3 Bulan Terakhir</option>
              </select>
            </div>
            <span className='inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-teal-50 text-teal-700 border border-teal-200'>
              Data Real-Time
            </span>
          </div>

          <div className='flex items-center gap-2.5 flex-col sm:flex-row'>
            <button
              onClick={handleExportCSV}
              className='w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2 border border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold rounded-xl text-xs sm:text-sm transition-all cursor-pointer'
            >
              <FileSpreadsheet size={17} className='text-teal-600' />
              <span>Ekspor CSV</span>
            </button>
            <button
              onClick={() => window.print()}
              className='w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-xl text-xs sm:text-sm shadow-sm transition-all cursor-pointer'
            >
              <Printer size={17} />
              <span>Cetak Laporan PDF</span>
            </button>
          </div>
        </div>
      </div>

      {/* Summary KPI row */}
      <div className='grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4'>
        {/* Card 1 */}
        <div className='bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-sm'>
          <div className='flex items-center gap-2 mb-2'>
            <CheckCircle2 size={18} className='text-teal-600' />
            <h3 className='text-xs sm:text-sm font-semibold text-slate-600'>
              Pil KB Diminum Tepat Waktu
            </h3>
          </div>
          <div className='text-xl sm:text-2xl font-bold text-slate-900 mb-1'>
            {totalTaken.toLocaleString('id-ID')} Pil
          </div>
          <p className='text-xs font-bold text-teal-700'>
            {overallRate}% Dari Total Jadwal Konsumsi
          </p>
        </div>

        {/* Card 2 */}
        <div className='bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-sm'>
          <div className='flex items-center gap-2 mb-2'>
            <AlertCircle size={18} className='text-amber-500' />
            <h3 className='text-xs sm:text-sm font-semibold text-slate-600'>
              Pil Terlewat / Lupa
            </h3>
          </div>
          <div className='text-xl sm:text-2xl font-bold text-amber-600 mb-1'>
            {totalMissed.toLocaleString('id-ID')} Pil
          </div>
          <p className='text-xs font-bold text-amber-600'>
            {(100 - parseFloat(overallRate)).toFixed(1)}% Butuh Tindak Lanjut
          </p>
        </div>

        {/* Card 3 */}
        <div className='bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-sm'>
          <div className='flex items-center gap-2 mb-2'>
            <TrendingUp size={18} className='text-teal-600' />
            <h3 className='text-xs sm:text-sm font-semibold text-slate-600'>
              Skor Efektivitas Proteksi
            </h3>
          </div>
          <div className='text-xl sm:text-2xl font-bold text-teal-700 mb-1'>
            Optimal (99%)
          </div>
          <p className='text-xs font-medium text-slate-500'>
            Berdasarkan Kepatuhan Rutin Akseptor
          </p>
        </div>
      </div>

      {/* Detail Breakdown Grid */}
      <div className='grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6'>
        {/* Table breakdown */}
        <div className='lg:col-span-8 bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 border border-slate-200 shadow-sm'>
          <h3 className='text-sm sm:text-base font-bold text-slate-900 mb-4'>
            Rincian Kepatuhan Konsumsi Harian Akseptor
          </h3>
          <div className='space-y-4'>
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

              const isGood = report.adherencePercentage >= 90;

              return (
                <div
                  key={`${dateLabel}-${idx}`}
                  className='pb-3.5 border-b border-slate-100 last:border-0 last:pb-0'
                >
                  <div className='flex justify-between items-center mb-1.5 gap-2 flex-wrap'>
                    <span className='text-xs sm:text-sm font-semibold text-slate-800'>
                      {dateLabel}
                    </span>
                    <span className='text-xs sm:text-sm font-bold text-slate-700'>
                      {report.adherencePercentage}% ({report.takenCount} diminum,{' '}
                      {report.missedCount} terlewat)
                    </span>
                  </div>
                  <div className='w-full bg-slate-100 rounded-full h-2.5 overflow-hidden'>
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${
                        isGood ? 'bg-teal-600' : 'bg-amber-400'
                      }`}
                      style={{
                        width: `${Math.min(100, Math.max(0, report.adherencePercentage))}%`,
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* User Adherence Leaderboard */}
        <div className='lg:col-span-4 bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-5 border border-slate-200 shadow-sm'>
          <h3 className='text-sm sm:text-base font-bold text-slate-900 mb-4'>
            Distribusi Kepatuhan Akseptor
          </h3>
          <div className='space-y-2.5'>
            {users.slice(0, 5).map(u => {
              const isGood = u.adherenceRate >= 90;
              const org = u.schoolOrOrg || u.assignedDoctor || 'Puskesmas / Bidan Terdaftar';
              return (
                <div
                  key={u.id}
                  className='flex justify-between items-center p-3 rounded-2xl bg-slate-50/70 border border-slate-200 hover:bg-slate-50 transition-colors gap-2.5'
                >
                  <div className='flex items-center gap-2.5 min-w-0 flex-1'>
                    <Avatar
                      src={u.avatarUrl}
                      name={u.name}
                      size='sm'
                      ringClassName='ring-1 ring-teal-100 shadow-2xs'
                    />
                    <div className='min-w-0 flex-1'>
                      <p className='text-xs sm:text-sm font-bold text-slate-900 truncate'>
                        {u.name}
                      </p>
                      <p className='text-[11px] text-slate-500 truncate'>
                        {org.split(',')[0]}
                      </p>
                    </div>
                  </div>
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold flex-shrink-0 ${
                      isGood
                        ? 'bg-teal-50 text-teal-700 border border-teal-200'
                        : 'bg-amber-50 text-amber-700 border border-amber-200'
                    }`}
                  >
                    {u.adherenceRate}%
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
