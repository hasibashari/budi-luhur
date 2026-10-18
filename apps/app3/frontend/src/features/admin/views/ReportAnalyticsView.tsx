import { useState, useEffect } from 'react';
import { Printer, TrendingUp, CheckCircle2, AlertCircle, FileSpreadsheet, ShieldCheck } from 'lucide-react';
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
      'data:text/csv;charset=utf-8,Hari,Layanan_Terlaksana,Tertunda,Persentase_Cakupan\n' +
      reports
        .map(r => `${r.date},${r.takenCount},${r.missedCount},${r.adherencePercentage}%`)
        .join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Laporan_Cakupan_Imunisasi_TT_PRELUNA_${period}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className='space-y-6'>
      <AdminHeader
        title='Laporan & Cakupan Imunisasi TT Catin'
        subtitle='Analisis statistik cakupan imunisasi Tetanus Toxoid catin, kepatuhan jadwal faskes, serta rekapitulasi sertifikat KUA.'
      />

      {/* Control Bar */}
      <div className='bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-5 border border-[#eff4ff] shadow-xs'>
        <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-4'>
          <div className='flex items-center gap-3 flex-wrap'>
            <div className='flex items-center gap-2'>
              <label htmlFor='report-period' className='text-xs font-bold text-[#574144] uppercase tracking-wider hidden sm:inline'>
                Periode:
              </label>
              <select
                id='report-period'
                value={period}
                onChange={e => setPeriod(e.target.value)}
                className='px-3.5 py-2 bg-[#f8f9ff] border border-[#dee9fc] rounded-xl text-xs sm:text-sm font-semibold text-[#121c2a] focus:outline-none focus:ring-2 focus:ring-[#ffd9de] focus:border-[#aa294d] transition-all cursor-pointer'
              >
                <option value='7-hari'>7 Hari Terakhir</option>
                <option value='30-hari'>30 Hari Terakhir</option>
                <option value='3-bulan'>3 Bulan Terakhir</option>
              </select>
            </div>
            <span className='inline-flex items-center px-2.5 py-1 rounded-full text-xs font-extrabold bg-[#ffd9de]/60 text-[#8c0f39] border border-[#ffd9de]'>
              Data Real-Time Faskes
            </span>
          </div>

          <div className='flex items-center gap-2.5 flex-col sm:flex-row'>
            <button
              onClick={handleExportCSV}
              className='w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2 border border-[#dee9fc] hover:border-[#aa294d] hover:bg-[#eff4ff] text-[#574144] hover:text-[#aa294d] font-semibold rounded-xl text-xs sm:text-sm transition-all cursor-pointer'
            >
              <FileSpreadsheet size={17} className='text-[#aa294d]' />
              <span>Ekspor CSV</span>
            </button>
            <button
              onClick={() => window.print()}
              className='w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2 bg-[#aa294d] hover:bg-[#cb4364] text-white font-bold rounded-xl text-xs sm:text-sm shadow-md shadow-[#aa294d]/20 transition-all cursor-pointer'
            >
              <Printer size={17} />
              <span>Cetak Laporan PDF</span>
            </button>
          </div>
        </div>
      </div>

      {/* Summary KPI Row */}
      <div className='grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-5'>
        {/* Card 1 */}
        <div className='bg-white rounded-2xl p-4 sm:p-5 border border-[#eff4ff] shadow-xs'>
          <div className='flex items-center gap-2 mb-2'>
            <CheckCircle2 size={18} className='text-[#2a6950]' />
            <h3 className='text-xs sm:text-sm font-bold text-[#574144]'>
              Imunisasi TT Tepat Waktu
            </h3>
          </div>
          <div className='text-xl sm:text-2xl font-black text-[#121c2a] mb-1'>
            {totalTaken.toLocaleString('id-ID')} Layanan
          </div>
          <p className='text-xs font-bold text-[#2a6950]'>
            {overallRate}% Dari Total Layanan Terjadwal
          </p>
        </div>

        {/* Card 2 */}
        <div className='bg-white rounded-2xl p-4 sm:p-5 border border-[#eff4ff] shadow-xs'>
          <div className='flex items-center gap-2 mb-2'>
            <AlertCircle size={18} className='text-[#aa294d]' />
            <h3 className='text-xs sm:text-sm font-bold text-[#574144]'>
              Jadwal Vaksinasi Terlewat / Butuh Booster
            </h3>
          </div>
          <div className='text-xl sm:text-2xl font-black text-[#aa294d] mb-1'>
            {totalMissed.toLocaleString('id-ID')} Layanan
          </div>
          <p className='text-xs font-bold text-[#8c0f39]'>
            {(100 - parseFloat(overallRate)).toFixed(1)}% Butuh Tindak Lanjut Faskes
          </p>
        </div>

        {/* Card 3 */}
        <div className='bg-white rounded-2xl p-4 sm:p-5 border border-[#eff4ff] shadow-xs'>
          <div className='flex items-center gap-2 mb-2'>
            <TrendingUp size={18} className='text-[#2a6950]' />
            <h3 className='text-xs sm:text-sm font-bold text-[#574144]'>
              Cakupan Proteksi Pranikah
            </h3>
          </div>
          <div className='text-xl sm:text-2xl font-black text-[#2a6950] mb-1'>
            Sangat Baik (A)
          </div>
          <p className='text-xs font-medium text-[#8b7074]'>
            Berdasarkan Pedoman Imunisasi TT Kemenkes RI
          </p>
        </div>
      </div>

      {/* Detail Breakdown Grid */}
      <div className='grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6'>
        {/* Table breakdown */}
        <div className='lg:col-span-8 bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 border border-[#eff4ff] shadow-xs'>
          <h3 className='text-sm sm:text-base font-bold text-[#121c2a] mb-4'>
            Rincian Kepatuhan Imunisasi & Kunjungan Harian
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
                  className='pb-3.5 border-b border-[#eff4ff] last:border-0 last:pb-0'
                >
                  <div className='flex justify-between items-center mb-1.5 gap-2 flex-wrap'>
                    <span className='text-xs sm:text-sm font-semibold text-[#121c2a]'>
                      {dateLabel}
                    </span>
                    <span className='text-xs sm:text-sm font-bold text-[#574144]'>
                      {report.adherencePercentage}% ({report.takenCount} terlaksana,{' '}
                      {report.missedCount} tertunda)
                    </span>
                  </div>
                  <div className='w-full bg-[#dee9fc] rounded-full h-2.5 overflow-hidden'>
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${
                        isGood ? 'bg-[#2a6950]' : 'bg-[#aa294d]'
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
        <div className='lg:col-span-4 bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-5 border border-[#eff4ff] shadow-xs'>
          <div className='flex items-center gap-2 mb-4'>
            <ShieldCheck size={18} className='text-[#aa294d]' />
            <h3 className='text-sm sm:text-base font-bold text-[#121c2a]'>
              Cakupan Kepatuhan Calon Pengantin
            </h3>
          </div>
          <div className='space-y-2.5'>
            {users.slice(0, 5).map(u => {
              const isGood = u.adherenceRate >= 90;
              const org = u.schoolOrOrg || u.assignedDoctor || 'Puskesmas Gambir - KUA Gambir';
              return (
                <div
                  key={u.id}
                  className='flex justify-between items-center p-3 rounded-2xl bg-[#f8f9ff] border border-[#eff4ff] hover:bg-[#ffd9de]/20 transition-colors gap-2.5'
                >
                  <div className='flex items-center gap-2.5 min-w-0 flex-1'>
                    <Avatar
                      src={u.avatarUrl}
                      name={u.name}
                      size='sm'
                      ringClassName='ring-1 ring-[#ffd9de] shadow-2xs'
                    />
                    <div className='min-w-0 flex-1'>
                      <p className='text-xs sm:text-sm font-bold text-[#121c2a] truncate'>
                        {u.name}
                      </p>
                      <p className='text-[11px] text-[#8b7074] truncate'>
                        {u.partnerName ? `Pasangan: ${u.partnerName}` : org.split(',')[0]}
                      </p>
                    </div>
                  </div>
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-extrabold flex-shrink-0 border ${
                      isGood
                        ? 'bg-[#aff1d0] text-[#0a5139] border-[#6ee7b7]'
                        : 'bg-[#ffd9de] text-[#8c0f39] border-[#fca5a5]'
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
