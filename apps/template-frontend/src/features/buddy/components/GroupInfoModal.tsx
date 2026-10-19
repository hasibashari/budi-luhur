import React, { useState } from 'react';
import {
  X,
  Users,
  Copy,
  Check,
  Flame,
  UserPlus,
  LogOut,
  Crown,
  CheckCircle2,
  Clock,
  Sparkles,
  ShieldCheck,
  Edit3,
  Trash2,
} from 'lucide-react';
import { Button } from '@/src/shared/components/ui/Button';
import { BuddyGroupItem, BuddyGroupMember } from '../types';

interface GroupInfoModalProps {
  open: boolean;
  group: BuddyGroupItem;
  members: BuddyGroupMember[];
  currentUserId: string;
  onClose: () => void;
  onAddMember: (friendCode: string) => Promise<boolean>;
  onLeaveGroup: () => Promise<void>;
  onOpenEditGroup: () => void;
  onDeleteGroup: () => Promise<void>;
}

export default function GroupInfoModal({
  open,
  group,
  members = [],
  currentUserId,
  onClose,
  onAddMember,
  onLeaveGroup,
  onOpenEditGroup,
  onDeleteGroup,
}: GroupInfoModalProps) {
  const [friendCodeInput, setFriendCodeInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasCopiedCode, setHasCopiedCode] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<{ text: string; isError: boolean } | null>(null);

  if (!open) return null;

  const memberList: BuddyGroupMember[] =
    Array.isArray(members) && members.length > 0 ? members : (group as any)?.members || [];
  const currentMember = memberList.find((m: BuddyGroupMember) => m.userId === currentUserId);
  const isAdmin = group.isCreator || group.creatorId === currentUserId || currentMember?.role === 'admin';

  const handleCopyCode = () => {
    navigator.clipboard.writeText(group.groupCode);
    setHasCopiedCode(true);
    setTimeout(() => setHasCopiedCode(false), 2500);
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!friendCodeInput.trim() || isSubmitting) return;

    setIsSubmitting(true);
    setFeedbackMsg(null);
    try {
      const ok = await onAddMember(friendCodeInput.trim());
      if (ok) {
        setFriendCodeInput('');
        setFeedbackMsg({ text: 'Teman berhasil ditambahkan ke grup! 🎉', isError: false });
      } else {
        setFeedbackMsg({ text: 'Gagal menambahkan teman. Pastikan kode valid.', isError: true });
      }
    } catch {
      setFeedbackMsg({ text: 'Terjadi kesalahan sistem.', isError: true });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmLeave = async () => {
    setIsLeaving(true);
    try {
      await onLeaveGroup();
      onClose();
    } catch {
      setIsLeaving(false);
      setShowLeaveConfirm(false);
    }
  };

  const handleConfirmDelete = async () => {
    setIsDeleting(true);
    try {
      await onDeleteGroup();
      onClose();
    } catch {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  const completedCount = memberList.filter((m: BuddyGroupMember) => m.statusThisWeek === 'recorded').length;
  const totalCount = memberList.length;

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/40 backdrop-blur-xs animate-fade-in'>
      {/* Backdrop */}
      <div className='absolute inset-0' onClick={onClose} />

      {/* Modal Dialog */}
      <div className='relative z-10 w-full max-w-lg bg-white rounded-2xl sm:rounded-3xl shadow-2xl border border-[#fce7f3] overflow-hidden flex flex-col max-h-[90vh] animate-scale-up'>
        {/* Header (Shrink-0) */}
        <div className='shrink-0 bg-white border-b border-[#fce7f3] px-5 py-3.5 flex items-center justify-between'>
          <div className='flex items-center gap-2.5'>
            <div className='w-8 h-8 rounded-xl bg-[#e11d48] text-white flex items-center justify-center shadow-xs'>
              <Users size={16} />
            </div>
            <div>
              <h3 className='text-sm sm:text-base font-bold text-[#1e293b]'>Detail Grup</h3>
              <p className='text-[11px] text-[#64748b]'>{totalCount} anggota</p>
            </div>
          </div>

          <button
            type='button'
            onClick={onClose}
            className='w-7 h-7 rounded-full bg-slate-100 text-[#64748b] hover:text-[#e11d48] flex items-center justify-center cursor-pointer transition-colors'
          >
            <X size={15} />
          </button>
        </div>

        {/* Scrollable Content Body */}
        <div className='flex-1 min-h-0 overflow-y-auto p-4 sm:p-5 space-y-3.5'>
          {/* Group Identity Card */}
          <div className='flex items-start gap-3 p-3 bg-slate-50/70 rounded-xl border border-slate-100'>
            <div className='relative w-12 h-12 rounded-xl overflow-hidden shrink-0 ring-1 ring-rose-200 bg-rose-50'>
              {group.avatarUrl ? (
                <img
                  src={group.avatarUrl}
                  alt={group.name}
                  className='w-full h-full object-cover'
                />
              ) : (
                <div className='w-full h-full flex items-center justify-center bg-rose-100 text-rose-600 font-bold'>
                  <Users size={20} />
                </div>
              )}
            </div>

            <div className='min-w-0 flex-1'>
              <div className='flex items-center justify-between gap-1'>
                <h4 className='text-sm sm:text-base font-bold text-[#1e293b] truncate'>
                  {group.name}
                </h4>
                {isAdmin && (
                  <button
                    type='button'
                    onClick={onOpenEditGroup}
                    className='inline-flex items-center gap-1 text-[11px] font-semibold text-[#e11d48] hover:text-[#be123c] bg-white px-2 py-0.5 rounded-lg border border-rose-200 transition-colors shrink-0 cursor-pointer shadow-2xs'
                  >
                    <Edit3 size={11} />
                    <span>Edit</span>
                  </button>
                )}
              </div>

              {group.description && (
                <p className='text-xs text-[#64748b] mt-0.5 leading-relaxed'>
                  {group.description}
                </p>
              )}
            </div>
          </div>

          {/* Group Code Share Box */}
          <div className='p-3 bg-rose-50/50 rounded-xl border border-rose-100 flex items-center justify-between gap-2'>
            <div>
              <span className='text-[10px] font-bold text-[#64748b] uppercase tracking-wider block'>
                Kode Undangan
              </span>
              <span className='text-sm sm:text-base font-bold text-[#e11d48] font-mono'>
                {group.groupCode}
              </span>
            </div>
            <Button
              type='button'
              variant='soft'
              size='sm'
              shape='pill'
              icon={
                hasCopiedCode ? (
                  <Check size={12} className='text-emerald-600' />
                ) : (
                  <Copy size={12} />
                )
              }
              onClick={handleCopyCode}
              className='text-xs font-semibold'
            >
              {hasCopiedCode ? 'Tersalin' : 'Salin'}
            </Button>
          </div>

          {/* Group Streak & Compliance Summary */}
          <div className='grid grid-cols-2 gap-2.5'>
            <div className='p-2.5 bg-rose-50/40 rounded-xl border border-rose-100 flex items-center gap-2.5'>
              <div className='w-8 h-8 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center shrink-0'>
                <Flame size={16} className='fill-orange-500' />
              </div>
              <div>
                <div className='text-sm sm:text-base font-bold text-[#1e293b] leading-none'>
                  {group.streakCount} <span className='text-[10px] font-normal text-[#64748b]'>Minggu</span>
                </div>
                <span className='text-[10px] text-[#64748b]'>Streak Kompak</span>
              </div>
            </div>

            <div className='p-2.5 bg-emerald-50/50 rounded-xl border border-emerald-100 flex items-center gap-2.5'>
              <div className='w-8 h-8 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0'>
                <Sparkles size={15} />
              </div>
              <div>
                <div className='text-sm sm:text-base font-bold text-emerald-800 leading-none'>
                  {completedCount}/{totalCount} <span className='text-[10px] font-normal text-emerald-600'>({group.weeklyCompletionRate}%)</span>
                </div>
                <span className='text-[10px] text-[#64748b]'>Minum Pekan Ini</span>
              </div>
            </div>
          </div>

          {/* Member List */}
          <div>
            <div className='flex items-center justify-between mb-2'>
              <h5 className='text-xs font-bold text-[#1e293b] uppercase tracking-wider flex items-center gap-1.5'>
                <ShieldCheck size={13} className='text-[#e11d48]' />
                <span>Anggota ({memberList.length})</span>
              </h5>
            </div>

            <div className='divide-y divide-slate-100 bg-white rounded-xl border border-slate-100 px-3 shadow-2xs'>
              {memberList.map((member: BuddyGroupMember) => {
                const isUser = member.userId === currentUserId;
                const isRecorded = member.statusThisWeek === 'recorded';

                return (
                  <div
                    key={member.id}
                    className='py-2 flex items-center justify-between gap-2'
                  >
                    {/* Member Info */}
                    <div className='flex items-center gap-2.5 min-w-0'>
                      <div className='relative w-8 h-8 rounded-full overflow-hidden shrink-0 ring-1 ring-slate-200'>
                        <img
                          src={member.avatarUrl}
                          alt={member.name}
                          className='w-full h-full object-cover'
                        />
                      </div>

                      <div className='min-w-0'>
                        <div className='flex items-center gap-1.5'>
                          <span className='text-xs font-semibold text-[#1e293b] truncate'>
                            {member.name} {isUser && '(Kamu)'}
                          </span>
                          {member.role === 'admin' && (
                            <span className='text-[9px] font-bold text-amber-700 bg-amber-50 px-1 py-0.2 rounded flex items-center gap-0.5 shrink-0'>
                              <Crown size={9} /> Admin
                            </span>
                          )}
                        </div>
                        <span className='text-[10px] text-[#94a3b8] font-mono block'>
                          {member.friendCode}
                        </span>
                      </div>
                    </div>

                    {/* Member Streak & Weekly Status Badge */}
                    <div className='flex items-center gap-1.5 shrink-0'>
                      {member.streakCount > 0 && (
                        <span
                          className='inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200/80'
                          title={`Streak Personal: ${member.streakCount} Pekan`}
                        >
                          <Flame size={10} className='fill-amber-500 text-amber-500' />
                          <span>{member.streakCount}</span>
                        </span>
                      )}
                      {isRecorded ? (
                        <span className='inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200'>
                          <CheckCircle2 size={10} /> Sudah
                        </span>
                      ) : (
                        <span className='inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-50 text-amber-700 border border-amber-200'>
                          <Clock size={10} /> Belum
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Add Member Form */}
          <div className='p-3 bg-slate-50/80 rounded-xl border border-slate-100'>
            <h5 className='text-xs font-bold text-[#1e293b] mb-1 flex items-center gap-1.5'>
              <UserPlus size={13} className='text-[#e11d48]' />
              <span>Undang Teman</span>
            </h5>
            <p className='text-[11px] text-[#64748b] mb-2'>
              Masukkan Friend Code teman untuk menambahkannya ke grup.
            </p>

            <form onSubmit={handleAddSubmit} className='flex items-center gap-2'>
              <input
                type='text'
                placeholder='FE-XXXX-XXXX'
                value={friendCodeInput}
                onChange={e => setFriendCodeInput(e.target.value)}
                className='flex-1 bg-white text-[#1e293b] text-xs font-mono uppercase rounded-lg border border-slate-200 focus:border-[#e11d48] px-3 py-1.5 outline-none'
                required
              />
              <Button
                type='submit'
                variant='primary'
                size='sm'
                shape='pill'
                disabled={isSubmitting || !friendCodeInput.trim()}
              >
                {isSubmitting ? '...' : 'Tambah'}
              </Button>
            </form>

            {feedbackMsg && (
              <p
                className={`text-[11px] font-medium mt-1.5 ${
                  feedbackMsg.isError ? 'text-rose-600' : 'text-emerald-600'
                }`}
              >
                {feedbackMsg.text}
              </p>
            )}
          </div>
        </div>

        {/* Footer Actions (Shrink-0) */}
        <div className='shrink-0 p-4 border-t border-[#fce7f3] bg-[#fffdfd] flex items-center justify-between gap-3'>
          {/* Delete Confirm Alert */}
          {showDeleteConfirm ? (
            <div className='w-full flex items-center justify-between gap-2 p-2.5 bg-rose-50 rounded-xl border border-rose-200 animate-fade-in'>
              <span className='text-xs font-bold text-rose-700'>Hapus grup ini permanen?</span>
              <div className='flex items-center gap-2'>
                <Button
                  type='button'
                  variant='outline'
                  size='sm'
                  shape='pill'
                  onClick={() => setShowDeleteConfirm(false)}
                  disabled={isDeleting}
                >
                  Batal
                </Button>
                <Button
                  type='button'
                  variant='primary'
                  size='sm'
                  shape='pill'
                  className='bg-[#e11d48] hover:bg-[#be123c]'
                  onClick={handleConfirmDelete}
                  disabled={isDeleting}
                >
                  {isDeleting ? 'Menghapus...' : 'Ya, Hapus'}
                </Button>
              </div>
            </div>
          ) : showLeaveConfirm ? (
            /* Leave Confirm Alert */
            <div className='w-full flex items-center justify-between gap-2 p-2.5 bg-rose-50 rounded-xl border border-rose-200 animate-fade-in'>
              <span className='text-xs font-bold text-rose-700'>Yakin ingin keluar?</span>
              <div className='flex items-center gap-2'>
                <Button
                  type='button'
                  variant='outline'
                  size='sm'
                  shape='pill'
                  onClick={() => setShowLeaveConfirm(false)}
                  disabled={isLeaving}
                >
                  Batal
                </Button>
                <Button
                  type='button'
                  variant='primary'
                  size='sm'
                  shape='pill'
                  className='bg-[#e11d48] hover:bg-[#be123c]'
                  onClick={handleConfirmLeave}
                  disabled={isLeaving}
                >
                  {isLeaving ? 'Keluar...' : 'Ya, Keluar'}
                </Button>
              </div>
            </div>
          ) : (
            /* Normal Actions */
            <div className='flex items-center gap-3'>
              {isAdmin ? (
                <button
                  type='button'
                  onClick={() => setShowDeleteConfirm(true)}
                  className='text-xs font-bold text-rose-600 hover:text-rose-800 transition-colors flex items-center gap-1.5 cursor-pointer py-1'
                  title='Hapus grup secara permanen'
                >
                  <Trash2 size={14} />
                  <span>Hapus Grup</span>
                </button>
              ) : (
                <button
                  type='button'
                  onClick={() => setShowLeaveConfirm(true)}
                  className='text-xs font-bold text-[#94a3b8] hover:text-[#e11d48] transition-colors flex items-center gap-1.5 cursor-pointer py-1'
                >
                  <LogOut size={14} />
                  <span>Keluar dari Grup</span>
                </button>
              )}
            </div>
          )}

          {!showDeleteConfirm && !showLeaveConfirm && (
            <Button
              type='button'
              variant='soft'
              size='sm'
              shape='pill'
              onClick={onClose}
            >
              Tutup
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
