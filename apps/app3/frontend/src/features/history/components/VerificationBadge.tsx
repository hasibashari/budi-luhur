import { CheckCircle2, Clock, ShieldCheck, XCircle } from 'lucide-react';
import type { TTVerificationStatus } from '@/src/features/user/types';

const VERIFICATION_CONFIG: Record<
  TTVerificationStatus,
  { label: string; className: string; Icon: typeof CheckCircle2; description: string }
> = {
  VERIFIED: {
    label: 'Terverifikasi',
    className: 'bg-[#aff1d0] text-[#0a5139]',
    Icon: ShieldCheck,
    description: 'Sudah dikonfirmasi oleh tenaga kesehatan.',
  },
  PENDING: {
    label: 'Menunggu Validasi',
    className: 'bg-[#fff3cd] text-[#8a5a00]',
    Icon: Clock,
    description: 'Dicatat mandiri dan belum diperiksa tenaga kesehatan.',
  },
  REJECTED: {
    label: 'Ditolak',
    className: 'bg-[#ffe1e6] text-[#a4163a]',
    Icon: XCircle,
    description: 'Data tidak dapat diverifikasi. Perbaiki lalu kirim ulang.',
  },
};

export function verificationLabel(status: TTVerificationStatus) {
  return VERIFICATION_CONFIG[status].label;
}

export function verificationDescription(status: TTVerificationStatus) {
  return VERIFICATION_CONFIG[status].description;
}

export function VerificationBadge({
  status,
  size = 'sm',
}: {
  status: TTVerificationStatus;
  size?: 'xs' | 'sm';
}) {
  const config = VERIFICATION_CONFIG[status];
  const Icon = config.Icon;
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full font-semibold whitespace-nowrap ${config.className} ${
        size === 'xs' ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-[10px] sm:text-[11px]'
      }`}
    >
      <Icon size={size === 'xs' ? 11 : 12} />
      <span>{config.label}</span>
    </span>
  );
}
