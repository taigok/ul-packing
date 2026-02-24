import { useCallback, useRef, useState } from 'react'

import type { GearListItem, ItemKind } from '@/lib/types'

export type ItemDraft = {
  name: string
  category: string
  weight_grams: number
  quantity: number
  kind: ItemKind
  notes: string
}

export type EditField = 'name' | 'category' | 'kind' | 'weight_grams' | 'quantity' | 'notes'

export const toDraft = (item: GearListItem): ItemDraft => ({
  name: item.name,
  category: item.category,
  weight_grams: item.weight_grams,
  quantity: item.quantity,
  kind: item.kind,
  notes: item.notes,
})

export const trimDraft = (draft: ItemDraft): ItemDraft => ({
  ...draft,
  name: draft.name.trim(),
  notes: draft.notes.trim(),
})

export const validateDraft = (draft: ItemDraft): string | null => {
  if (!draft.name.trim()) return '名前は必須です。'
  if (!Number.isInteger(draft.weight_grams) || draft.weight_grams < 1) return '重量は1以上で入力してください。'
  if (!Number.isInteger(draft.quantity) || draft.quantity < 1) return '個数は1以上で入力してください。'
  return null
}

export const hasChanges = (item: GearListItem, draft: ItemDraft) => {
  const normalized = trimDraft(draft)
  return (
    item.name !== normalized.name ||
    item.category !== normalized.category ||
    item.weight_grams !== normalized.weight_grams ||
    item.quantity !== normalized.quantity ||
    item.kind !== normalized.kind ||
    item.notes !== normalized.notes
  )
}

type UseEditableRowOptions = {
  onSave: (item: GearListItem, draft: ItemDraft) => void
  isBusy: boolean
  isCreating: boolean
}

export function useEditableRow({ onSave, isBusy, isCreating }: UseEditableRowOptions) {
  const [editingItemId, setEditingItemId] = useState<string | null>(null)
  const [editingDraft, setEditingDraft] = useState<ItemDraft | null>(null)
  const [editingField, setEditingField] = useState<EditField>('name')
  const [editingRowError, setEditingRowError] = useState<string | null>(null)
  const editingRowRef = useRef<HTMLTableRowElement | null>(null)

  const startEditing = useCallback(
    (item: GearListItem, field: EditField) => {
      if (editingItemId || isCreating || isBusy) return
      setEditingItemId(item.id)
      setEditingDraft(toDraft(item))
      setEditingField(field)
      setEditingRowError(null)
    },
    [editingItemId, isCreating, isBusy],
  )

  const cancelEditing = useCallback(() => {
    setEditingItemId(null)
    setEditingDraft(null)
    setEditingField('name')
    setEditingRowError(null)
  }, [])

  const saveEditing = useCallback(
    (item: GearListItem) => {
      if (!editingDraft) return
      const validationError = validateDraft(editingDraft)
      if (validationError) {
        setEditingRowError(validationError)
        return
      }
      if (!hasChanges(item, editingDraft)) {
        cancelEditing()
        return
      }
      setEditingRowError(null)
      onSave(item, trimDraft(editingDraft))
    },
    [editingDraft, cancelEditing, onSave],
  )

  const clearEditingState = useCallback(() => {
    setEditingItemId(null)
    setEditingDraft(null)
    setEditingRowError(null)
  }, [])

  return {
    editingItemId,
    editingDraft,
    editingField,
    editingRowError,
    editingRowRef,
    setEditingDraft,
    setEditingRowError,
    startEditing,
    cancelEditing,
    saveEditing,
    clearEditingState,
  }
}
