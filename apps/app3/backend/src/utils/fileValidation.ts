/**
 * Validasi berkas bukti imunisasi.
 *
 * Keamanan: tipe berkas ditentukan dari *magic bytes*, bukan dari header
 * `Content-Type` yang dikirim klien (header mudah dipalsukan).
 */

export const MAX_ATTACHMENT_BYTES = 3 * 1024 * 1024; // 3 MB

export const ALLOWED_ATTACHMENT_MIME = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'application/pdf',
] as const;

export type AllowedAttachmentMime = (typeof ALLOWED_ATTACHMENT_MIME)[number];

function startsWith(buffer: Buffer, bytes: number[], offset = 0): boolean {
  if (buffer.length < offset + bytes.length) return false;
  return bytes.every((byte, index) => buffer[offset + index] === byte);
}

/** Deteksi tipe berkas dari isi, kembalikan null bila tidak diizinkan. */
export function detectAttachmentMime(buffer: Buffer): AllowedAttachmentMime | null {
  if (startsWith(buffer, [0xff, 0xd8, 0xff])) return 'image/jpeg';
  if (startsWith(buffer, [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])) return 'image/png';
  // RIFF....WEBP
  if (startsWith(buffer, [0x52, 0x49, 0x46, 0x46]) && startsWith(buffer, [0x57, 0x45, 0x42, 0x50], 8)) {
    return 'image/webp';
  }
  if (startsWith(buffer, [0x25, 0x50, 0x44, 0x46])) return 'application/pdf';
  return null;
}

export function isAllowedAttachmentSize(size: number): boolean {
  return size > 0 && size <= MAX_ATTACHMENT_BYTES;
}
