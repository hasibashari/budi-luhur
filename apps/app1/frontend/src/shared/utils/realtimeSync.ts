'use client'

export type RealtimeEventType =
  | 'NUDGE_SENT'
  | 'MEDICATION_TAKEN'
  | 'SCHEDULE_UPDATED'
  | 'NUDGE_DISMISSED'
  | 'GROUP_MESSAGE_SENT'
  | 'GROUP_MEMBER_ADDED'
  | 'GROUP_UPDATED'
  | 'GROUP_CREATED'
  | 'GROUP_DELETED'

export interface RealtimeEventPayload {
  type: RealtimeEventType
  userId?: string
  patientId?: string
  scheduleId?: string
  nudgeId?: string
  groupId?: string
  messageId?: string
  senderName?: string
  timestamp: number
}

const CHANNEL_NAME = 'medicore_realtime_sync'
const STORAGE_EVENT_KEY = 'medicore_sync_event_pulse'

let channelInstance: BroadcastChannel | null = null

function getChannel(): BroadcastChannel | null {
  if (typeof window === 'undefined') return null
  if (!('BroadcastChannel' in window)) return null

  if (!channelInstance) {
    try {
      channelInstance = new BroadcastChannel(CHANNEL_NAME)
    } catch {
      channelInstance = null
    }
  }
  return channelInstance
}

/**
 * Publish an event to all open tabs and windows
 */
export function publishRealtimeEvent(type: RealtimeEventType, data?: Partial<RealtimeEventPayload>) {
  if (typeof window === 'undefined') return

  const payload: RealtimeEventPayload = {
    type,
    timestamp: Date.now(),
    ...data,
  }

  // 1. Try BroadcastChannel (0 ms instant cross-tab communication)
  const ch = getChannel()
  if (ch) {
    try {
      ch.postMessage(payload)
    } catch (e) {
      console.warn('BroadcastChannel postMessage error:', e)
    }
  }

  // 2. Storage event fallback for older environments
  try {
    localStorage.setItem(STORAGE_EVENT_KEY, JSON.stringify(payload))
  } catch {
    // ignore
  }
}

/**
 * Subscribe to realtime events across tabs
 */
export function subscribeRealtimeEvent(
  callback: (event: RealtimeEventPayload) => void
): () => void {
  if (typeof window === 'undefined') return () => {}

  const ch = getChannel()

  const handleMessage = (event: MessageEvent<RealtimeEventPayload>) => {
    if (event.data && event.data.type) {
      callback(event.data)
    }
  }

  const handleStorage = (event: StorageEvent) => {
    if (event.key === STORAGE_EVENT_KEY && event.newValue) {
      try {
        const parsed: RealtimeEventPayload = JSON.parse(event.newValue)
        if (parsed && parsed.type) {
          callback(parsed)
        }
      } catch {
        // ignore
      }
    }
  }

  if (ch) {
    ch.addEventListener('message', handleMessage)
  }
  window.addEventListener('storage', handleStorage)

  return () => {
    if (ch) {
      ch.removeEventListener('message', handleMessage)
    }
    window.removeEventListener('storage', handleStorage)
  }
}
