'use client'

import { useState, useCallback } from 'react'

export function useDeleteConfirm<T = string>() {
  const [open, setOpen] = useState(false)
  const [itemToDelete, setItemToDelete] = useState<T | null>(null)

  const requestDelete = useCallback((item: T) => {
    setItemToDelete(item)
    setOpen(true)
  }, [])

  const closeDelete = useCallback(() => {
    setOpen(false)
    setItemToDelete(null)
  }, [])

  return {
    open,
    itemToDelete,
    requestDelete,
    closeDelete,
  }
}

export default useDeleteConfirm
