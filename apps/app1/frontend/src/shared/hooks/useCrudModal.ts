'use client'

import { useState, useCallback } from 'react'

export function useCrudModal<TFormData>(initialFormData: TFormData) {
  const [openModal, setOpenModal] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState<TFormData>(initialFormData)

  const handleOpenAdd = useCallback(
    (customInitial?: Partial<TFormData>) => {
      setEditingId(null)
      setFormData(customInitial ? { ...initialFormData, ...customInitial } : initialFormData)
      setOpenModal(true)
    },
    [initialFormData]
  )

  const handleOpenEdit = useCallback((id: string, editData: TFormData) => {
    setEditingId(id)
    setFormData(editData)
    setOpenModal(true)
  }, [])

  const handleCloseModal = useCallback(() => {
    setOpenModal(false)
  }, [])

  const updateFormData = useCallback(
    (fields: Partial<TFormData> | ((prev: TFormData) => TFormData)) => {
      setFormData((prev) => (typeof fields === 'function' ? fields(prev) : { ...prev, ...fields }))
    },
    []
  )

  return {
    openModal,
    setOpenModal,
    editingId,
    setEditingId,
    formData,
    setFormData,
    updateFormData,
    isEditing: !!editingId,
    handleOpenAdd,
    handleOpenEdit,
    handleCloseModal,
  }
}

export default useCrudModal
