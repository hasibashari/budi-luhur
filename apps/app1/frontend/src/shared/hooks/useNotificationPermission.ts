'use client'

import { useState, useCallback, useSyncExternalStore } from 'react'
import {
  isNotificationSupported,
  getNotificationPermission,
  requestNotificationPermission,
  showSystemNotification,
  SystemNotificationOptions,
} from '../utils/notifications'

function subscribePermission(callback: () => void) {
  if (typeof window === 'undefined') return () => {}
  // Check permission changes via permissions API if supported
  if ('permissions' in navigator) {
    let statusObj: PermissionStatus | null = null
    navigator.permissions.query({ name: 'notifications' as PermissionName }).then((status) => {
      statusObj = status
      status.addEventListener('change', callback)
    }).catch(() => {})

    return () => {
      if (statusObj) {
        statusObj.removeEventListener('change', callback)
      }
    }
  }
  return () => {}
}

function getPermissionSnapshot() {
  return getNotificationPermission()
}

function getPermissionServerSnapshot() {
  return 'unsupported' as const
}

export function useNotificationPermission() {
  const permission = useSyncExternalStore(
    subscribePermission,
    getPermissionSnapshot,
    getPermissionServerSnapshot
  )
  const [requesting, setRequesting] = useState(false)

  const isSupported = isNotificationSupported()
  const isGranted = permission === 'granted'
  const isDenied = permission === 'denied'
  const isDefault = permission === 'default'

  const request = useCallback(async (sendWelcome: boolean = true): Promise<boolean> => {
    setRequesting(true)
    try {
      const result = await requestNotificationPermission()
      if (result === 'granted') {
        if (sendWelcome) {
          await showSystemNotification('Pengingat MediCore Aktif! 🔔', {
            body: 'Anda akan menerima notifikasi suara dan getar saat jadwal minum obat tiba.',
            tag: 'welcome-notification',
            url: '/user/dashboard',
          })
        }
        return true
      }
      return false
    } finally {
      setRequesting(false)
    }
  }, [])

  const notify = useCallback(
    async (title: string, options?: SystemNotificationOptions) => {
      return showSystemNotification(title, options)
    },
    []
  )

  return {
    permission,
    isSupported,
    isGranted,
    isDenied,
    isDefault,
    requesting,
    request,
    notify,
  }
}

export default useNotificationPermission
