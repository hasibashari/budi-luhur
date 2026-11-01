import { useState, useEffect, useCallback } from 'react';
import {
  Search,
  Clock,
  CheckCircle2,
  XCircle,
  FileText,
  Eye,
  RefreshCw,
} from 'lucide-react';
import AdminHeader from '../components/AdminHeader';
import { VerificationDetailModal } from '../components/VerificationDetailModal';
import { DataTable, Column } from '@/src/shared/components/DataTable';
import { Avatar } from '@/src/shared/components/ui/Avatar';
import { Button } from '@/src/shared/components/ui/Button';
import { getAdminVerificationsAction } from '../api/adminRepository';
import { AdminVerificationListItem } from '../types/admin.types';

export function AdminVerificationView() {
  const [verifications, setVerifications] = useState<AdminVerificationListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('Semua');

  // Selected User Modal
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchVerifications = useCallback(async () => {
    setIsLoading(true);
    const data = await getAdminVerificationsAction(statusFilter, searchQuery);
    setVerifications(data);
    setIsLoading(false);
  }, [statusFilter, searchQuery]);

  useEffect(() => {
    fetchVerifications();
  }, [fetchVerifications]);

  const handleOpenDetail = (userId: string) => {
    setSelectedUserId(userId);
    setIsModalOpen(true);
  };

  const handleCloseDetail = () => {
    setIsModalOpen(false);
    setSelectedUserId(null);
  };

  // Metrics Count
  const countPending = verifications.filter(v => v.status === 'Pending').length;
  const countApproved = verifications.filter(v => v.status === 'Approved').length;
  const countRejected = verifications.filter(v => v.status === 'Rejected').length;

  const formatDate = (isoStr?: string | null) => {
    if (!isoStr) return '-';
    try {
      return new Date(isoStr).toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      });
    } catch {
      return isoStr;
    }
  };

  const columns: Column<AdminVerificationListItem>[] = [
    {
      id: 'user',
      label: 'Akseptor',
      renderCell: row => (
        <div className='flex items-center gap-3'>
          <Avatar src={row.userAvatar || undefined} name={row.userName} size='sm' />
          <div className='min-w-0'>
            <div className='font-bold text-xs text-slate-900 truncate'>{row.userName}</div>
            <div className='text-[11px] text-slate-500 truncate'>{row.userEmail}</div>
            <div className='text-[10px] text-slate-400'>{row.userPhone}</div>
          </div>
        </div>
      ),
    },
    {
      id: 'pillType',
      label: 'Pilihan Pil KB',
      renderCell: row => (
        <div>
          <span className='font-bold text-xs text-slate-800 block'>
            {row.pillType || 'Pil KB Kombinasi'}
          </span>
          <span className='text-[10px] text-slate-500 block truncate max-w-[150px]'>
            {row.schoolOrOrg || 'Puskesmas Rujukan'}
          </span>
        </div>
      ),
    },
    {
      id: 'document',
      label: 'Dokumen Bukti',
      renderCell: row => (
        <div className='flex items-center gap-2'>
          <div className='w-7 h-7 rounded-lg bg-orange-50 text-orange-600 flex items-center justify-center shrink-0'>
            <FileText size={15} />
          </div>
          <div className='min-w-0'>
            <span className='font-bold text-xs text-slate-900 block'>
              {row.documentType}
            </span>
            <span className='text-[10px] text-slate-400 block truncate max-w-[140px]'>
              {row.documentFileName}
            </span>
          </div>
        </div>
      ),
    },
    {
      id: 'submittedAt',
      label: 'Tgl. Pengajuan',
      renderCell: row => (
        <span className='text-xs text-slate-600 font-medium'>
          {formatDate(row.submittedAt)}
        </span>
      ),
    },
    {
      id: 'status',
      label: 'Status',
      renderCell: row => {
        if (row.status === 'Pending') {
          return (
            <span className='inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-200 text-[11px] font-bold'>
              <Clock size={12} className='text-amber-600' />
              <span>Menunggu</span>
            </span>
          );
        }
        if (row.status === 'Approved') {
          return (
            <span className='inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-teal-50 text-teal-800 border border-teal-200 text-[11px] font-bold'>
              <CheckCircle2 size={12} className='text-teal-600' />
              <span>Disetujui</span>
            </span>
          );
        }
        return (
          <span className='inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-50 text-rose-800 border border-rose-200 text-[11px] font-bold'>
            <XCircle size={12} className='text-rose-600' />
            <span>Ditolak</span>
          </span>
        );
      },
    },
    {
      id: 'action',
      label: 'Aksi',
      renderCell: row => (
        <Button
          type='button'
          variant='primary'
          size='sm'
          shape='pill'
          onClick={() => handleOpenDetail(row.userId)}
          icon={<Eye size={13} />}
          className='text-xs font-bold px-3 py-1.5 bg-teal-600 hover:bg-teal-700'
        >
          Tinjau Berkas
        </Button>
      ),
    },
  ];

  return (
    <div className='flex flex-col gap-5 p-4 sm:p-6 md:p-8 max-w-7xl mx-auto w-full box-border'>
      {/* Header */}
      <AdminHeader
        title='Verifikasi Akseptor Pil KB'
        subtitle='Pemeriksaan 9 pertanyaan skrining kontraindikasi medis dan bukti dokumen status pernikahan akseptor.'
        action={
          <Button
            type='button'
            variant='outline'
            size='sm'
            shape='pill'
            onClick={() => fetchVerifications()}
            icon={<RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />}
            className='text-xs font-bold'
          >
            Segarkan
          </Button>
        }
      />

      {/* Metrics Stat Cards */}
      <div className='grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4'>
        <div className='p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs flex flex-col gap-1'>
          <span className='text-xs font-semibold text-slate-500'>Total Berkas</span>
          <span className='text-xl sm:text-2xl font-black text-slate-900'>
            {verifications.length}
          </span>
          <span className='text-[10px] text-slate-400'>Seluruh pengajuan akseptor</span>
        </div>

        <div className='p-4 rounded-2xl bg-amber-50/60 border border-amber-200/80 shadow-2xs flex flex-col gap-1'>
          <div className='flex items-center justify-between'>
            <span className='text-xs font-bold text-amber-900'>Menunggu Verifikasi</span>
            <span className='w-2 h-2 rounded-full bg-amber-500 animate-ping' />
          </div>
          <span className='text-xl sm:text-2xl font-black text-amber-700'>{countPending}</span>
          <span className='text-[10px] text-amber-800 font-medium'>Perlu segera diperiksa</span>
        </div>

        <div className='p-4 rounded-2xl bg-teal-50/60 border border-teal-200/80 shadow-2xs flex flex-col gap-1'>
          <span className='text-xs font-bold text-teal-900'>Telah Disetujui</span>
          <span className='text-xl sm:text-2xl font-black text-teal-700'>{countApproved}</span>
          <span className='text-[10px] text-teal-800 font-medium'>Akses aplikasi aktif</span>
        </div>

        <div className='p-4 rounded-2xl bg-rose-50/60 border border-rose-200/80 shadow-2xs flex flex-col gap-1'>
          <span className='text-xs font-bold text-rose-900'>Ditolak</span>
          <span className='text-xl sm:text-2xl font-black text-rose-700'>{countRejected}</span>
          <span className='text-[10px] text-rose-800 font-medium'>Belum memenuhi syarat</span>
        </div>
      </div>

      {/* Search and Filters */}
      <div className='flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3.5 rounded-2xl bg-white border border-slate-200 shadow-2xs'>
        {/* Status Filter Tabs */}
        <div className='flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0'>
          {['Semua', 'Pending', 'Approved', 'Rejected'].map(st => (
            <button
              key={st}
              type='button'
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                statusFilter === st
                  ? 'bg-teal-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200/70'
              }`}
            >
              {st === 'Semua'
                ? 'Semua Status'
                : st === 'Pending'
                  ? 'Menunggu'
                  : st === 'Approved'
                    ? 'Disetujui'
                    : 'Ditolak'}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className='relative flex items-center min-w-[240px]'>
          <Search size={15} className='absolute left-3.5 text-slate-400' />
          <input
            type='text'
            placeholder='Cari nama, email, no. telp...'
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className='w-full pl-9 pr-3.5 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white text-xs outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-600/15 transition-all'
          />
        </div>
      </div>

      {/* Table of Verifications */}
      <div className='rounded-3xl bg-white border border-slate-200 shadow-xs overflow-hidden'>
        <DataTable
          columns={columns}
          data={verifications}
          emptyMessage={isLoading ? 'Memuat data verifikasi...' : 'Belum ada berkas pendaftaran akseptor yang perlu diverifikasi.'}
          renderMobileCard={row => (
            <div className='p-4 flex flex-col gap-3'>
              <div className='flex items-center justify-between'>
                <div className='flex items-center gap-2.5'>
                  <Avatar src={row.userAvatar || undefined} name={row.userName} size='sm' />
                  <div>
                    <span className='font-bold text-xs text-slate-900 block'>{row.userName}</span>
                    <span className='text-[10px] text-slate-500'>{row.userPhone}</span>
                  </div>
                </div>

                {row.status === 'Pending' ? (
                  <span className='px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200 text-[10px] font-bold'>
                    Menunggu
                  </span>
                ) : row.status === 'Approved' ? (
                  <span className='px-2 py-0.5 rounded-full bg-teal-50 text-teal-800 border border-teal-200 text-[10px] font-bold'>
                    Disetujui
                  </span>
                ) : (
                  <span className='px-2 py-0.5 rounded-full bg-rose-50 text-rose-800 border border-rose-200 text-[10px] font-bold'>
                    Ditolak
                  </span>
                )}
              </div>

              <div className='grid grid-cols-2 gap-2 text-[11px] bg-slate-50 p-2.5 rounded-xl border border-slate-100'>
                <div>
                  <span className='text-[10px] text-slate-400 block'>Pil KB</span>
                  <span className='font-semibold text-slate-800 truncate block'>
                    {row.pillType || 'Pil KB Kombinasi'}
                  </span>
                </div>
                <div>
                  <span className='text-[10px] text-slate-400 block'>Dokumen</span>
                  <span className='font-semibold text-slate-800 truncate block'>
                    {row.documentType} ({row.documentFileName})
                  </span>
                </div>
              </div>

              <div className='flex items-center justify-between pt-1'>
                <span className='text-[10px] text-slate-400'>
                  Diajukan: {formatDate(row.submittedAt)}
                </span>
                <Button
                  type='button'
                  variant='primary'
                  size='sm'
                  shape='pill'
                  onClick={() => handleOpenDetail(row.userId)}
                  icon={<Eye size={12} />}
                  className='text-xs font-bold px-3 py-1 bg-teal-600'
                >
                  Tinjau Berkas
                </Button>
              </div>
            </div>
          )}
        />
      </div>

      {/* Verification Detail Modal */}
      <VerificationDetailModal
        userId={selectedUserId}
        isOpen={isModalOpen}
        onClose={handleCloseDetail}
        onStatusUpdated={fetchVerifications}
      />
    </div>
  );
}

export default AdminVerificationView;
