import { useCallback, useEffect, useRef, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Trash2Icon } from 'lucide-react'
import { toast } from 'sonner'

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { categoryOptions, itemKindOptions } from '@/lib/constants'
import { categoryLabel, kindLabel } from '@/lib/format'
import { api, apiErrorMessage } from '@/lib/api'
import type { GearListItem, ItemKind } from '@/lib/types'
import {
  type EditField,
  type ItemDraft,
  trimDraft,
  validateDraft,
  useEditableRow,
} from '@/hooks/use-editable-row'

type EditableGearRowProps = {
  item: GearListItem
  isEditing: boolean
  editingDraft: ItemDraft | null
  editingField: EditField
  editingRowRef: React.RefObject<HTMLTableRowElement | null>
  isSaving: boolean
  isEditDisabled: boolean
  onSetDraft: React.Dispatch<React.SetStateAction<ItemDraft | null>>
  onStartEditing: (item: GearListItem, field: EditField) => void
  onSave: (item: GearListItem) => void
  onCancel: () => void
  onDelete: (item: GearListItem) => void
}

function EditableGearRow({
  item,
  isEditing,
  editingDraft,
  editingField,
  editingRowRef,
  isSaving,
  isEditDisabled,
  onSetDraft,
  onStartEditing,
  onSave,
  onCancel,
  onDelete,
}: EditableGearRowProps) {
  const categoryTriggerRef = useRef<HTMLButtonElement | null>(null)
  const kindTriggerRef = useRef<HTMLButtonElement | null>(null)

  useEffect(() => {
    if (!isEditing) return
    if (editingField === 'category') categoryTriggerRef.current?.focus()
    if (editingField === 'kind') kindTriggerRef.current?.focus()
  }, [editingField, isEditing])

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault()
        onSave(item)
      } else if (event.key === 'Escape') {
        event.preventDefault()
        onCancel()
      }
    },
    [item, onSave, onCancel],
  )

  if (isEditing && editingDraft) {
    return (
      <TableRow
        ref={editingRowRef}
        className="bg-muted/50"
        onKeyDown={handleKeyDown}
        onBlurCapture={() => {
          if (isSaving) return
          setTimeout(() => {
            const activeElement = document.activeElement
            if (editingRowRef.current?.contains(activeElement)) return

            onSave(item)
          }, 0)
        }}
      >
        <TableCell>
          <Input
            aria-label="編集名前"
            autoFocus={editingField === 'name'}
            value={editingDraft.name}
            onChange={(event) =>
              onSetDraft((prev) => (prev ? { ...prev, name: event.target.value } : prev))
            }
          />
        </TableCell>
        <TableCell>
          <Select
            value={editingDraft.category}
            onValueChange={(value) =>
              onSetDraft((prev) => (prev ? { ...prev, category: value } : prev))
            }
          >
            <SelectTrigger aria-label="編集カテゴリ" className="w-full min-w-0" ref={categoryTriggerRef}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {categoryOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </TableCell>
        <TableCell>
          <Select
            value={editingDraft.kind}
            onValueChange={(value) =>
              onSetDraft((prev) => (prev ? { ...prev, kind: value as ItemKind } : prev))
            }
          >
            <SelectTrigger aria-label="編集種別" className="w-full min-w-0" ref={kindTriggerRef}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {itemKindOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </TableCell>
        <TableCell>
          <Input
            aria-label="編集重量"
            autoFocus={editingField === 'weight_grams'}
            type="number"
            min={1}
            value={editingDraft.weight_grams}
            onChange={(event) =>
              onSetDraft((prev) =>
                prev ? { ...prev, weight_grams: Number(event.target.value) } : prev,
              )
            }
          />
        </TableCell>
        <TableCell>
          <Input
            aria-label="編集個数"
            autoFocus={editingField === 'quantity'}
            type="number"
            min={1}
            value={editingDraft.quantity}
            onChange={(event) =>
              onSetDraft((prev) =>
                prev ? { ...prev, quantity: Number(event.target.value) } : prev,
              )
            }
          />
        </TableCell>
        <TableCell>
          <Textarea
            aria-label="編集メモ"
            autoFocus={editingField === 'notes'}
            className="min-h-9 h-9 w-full resize-none field-sizing-fixed"
            rows={1}
            value={editingDraft.notes}
            onChange={(event) =>
              onSetDraft((prev) => (prev ? { ...prev, notes: event.target.value } : prev))
            }
          />
        </TableCell>
        <TableCell className="space-x-2">
          <Button
            size="sm"
            variant="outline"
            disabled={isSaving}
            onClick={(event) => {
              event.stopPropagation()
              onCancel()
            }}
          >
            キャンセル
          </Button>
        </TableCell>
      </TableRow>
    )
  }

  return (
    <TableRow>
      <TableCell
        className="font-medium cursor-pointer"
        role="button"
        tabIndex={0}
        aria-label={`${item.name}の名前を編集`}
        onClick={() => onStartEditing(item, 'name')}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onStartEditing(item, 'name') } }}
      >
        {item.name}
      </TableCell>
      <TableCell
        className="cursor-pointer"
        role="button"
        tabIndex={0}
        aria-label={`${item.name}のカテゴリを編集`}
        onClick={() => onStartEditing(item, 'category')}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onStartEditing(item, 'category') } }}
      >
        <Badge variant="outline">{categoryLabel(item.category)}</Badge>
      </TableCell>
      <TableCell
        className="cursor-pointer"
        role="button"
        tabIndex={0}
        aria-label={`${item.name}の種別を編集`}
        onClick={() => onStartEditing(item, 'kind')}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onStartEditing(item, 'kind') } }}
      >
        {kindLabel(item.kind)}
      </TableCell>
      <TableCell
        className="cursor-pointer"
        role="button"
        tabIndex={0}
        aria-label={`${item.name}の重量を編集`}
        onClick={() => onStartEditing(item, 'weight_grams')}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onStartEditing(item, 'weight_grams') } }}
      >
        {item.weight_grams * item.quantity} g
      </TableCell>
      <TableCell
        className="cursor-pointer"
        role="button"
        tabIndex={0}
        aria-label={`${item.name}の個数を編集`}
        onClick={() => onStartEditing(item, 'quantity')}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onStartEditing(item, 'quantity') } }}
      >
        {item.quantity}
      </TableCell>
      <TableCell
        className="cursor-pointer"
        role="button"
        tabIndex={0}
        aria-label={`${item.name}のメモを編集`}
        onClick={() => onStartEditing(item, 'notes')}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onStartEditing(item, 'notes') } }}
      >
        {item.notes || '-'}
      </TableCell>
      <TableCell className="space-x-2">
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label={`${item.name}を削除`}
          className="text-muted-foreground hover:text-foreground"
          disabled={isEditDisabled}
          onClick={(event) => {
            event.stopPropagation()
            onDelete(item)
          }}
        >
          <Trash2Icon className="size-4" />
        </Button>
      </TableCell>
    </TableRow>
  )
}

export function GearPage() {
  const queryClient = useQueryClient()
  const [isCreating, setIsCreating] = useState(false)
  const [newDraft, setNewDraft] = useState<ItemDraft>({
    name: '',
    category: 'other',
    weight_grams: 1,
    quantity: 1,
    kind: 'base',
    notes: '',
  })
  const [newRowError, setNewRowError] = useState<string | null>(null)
  const [itemToDelete, setItemToDelete] = useState<GearListItem | null>(null)

  const gearItemsQuery = useQuery({ queryKey: ['gear-items'], queryFn: api.getGearItems })
  const invalidateQueries = async () => {
    await queryClient.invalidateQueries({ queryKey: ['gear-items'] })
    await queryClient.invalidateQueries({ queryKey: ['lists'] })
    await queryClient.invalidateQueries({ queryKey: ['list'] })
  }

  const createMutation = useMutation({
    mutationFn: api.createGearItem,
    onSuccess: async () => {
      await invalidateQueries()
      setIsCreating(false)
      setNewRowError(null)
      setNewDraft({
        name: '',
        category: 'other',
        weight_grams: 1,
        quantity: 1,
        kind: 'base',
        notes: '',
      })
      toast.success('ギアを追加しました')
    },
    onError: (error) => {
      const message = apiErrorMessage(error, 'ギアの追加に失敗しました')
      setNewRowError(message)
      toast.error(message)
    },
  })

  const clearEditingRef = useRef<() => void>(() => {})
  const setEditingRowErrorRef = useRef<(error: string | null) => void>(() => {})

  const updateMutation = useMutation({
    mutationFn: ({ itemId, listId, payload }: { itemId: string; listId: string; payload: ItemDraft }) =>
      api.updateItem(listId, itemId, payload),
    onSuccess: async () => {
      await invalidateQueries()
      clearEditingRef.current()
      toast.success('ギアを更新しました')
    },
    onError: (error) => {
      const message = apiErrorMessage(error, 'ギアの更新に失敗しました')
      setEditingRowErrorRef.current(message)
      toast.error(message)
    },
  })

  const deleteMutation = useMutation({
    mutationFn: ({ itemId, listId }: { itemId: string; listId: string }) => api.deleteItem(listId, itemId),
    onSuccess: async () => {
      await invalidateQueries()
      setItemToDelete(null)
      toast.success('ギアを削除しました')
    },
    onError: (error) => toast.error(apiErrorMessage(error, 'ギアの削除に失敗しました')),
  })

  const isBusy = createMutation.isPending || updateMutation.isPending || deleteMutation.isPending

  const handleSave = useCallback(
    (item: GearListItem, draft: ItemDraft) => {
      updateMutation.mutate({
        itemId: item.id,
        listId: item.list_id,
        payload: draft,
      })
    },
    [updateMutation],
  )

  const editing = useEditableRow({
    onSave: handleSave,
    isBusy,
    isCreating,
  })

  clearEditingRef.current = editing.clearEditingState
  setEditingRowErrorRef.current = editing.setEditingRowError

  return (
    <>
      <div className="mb-4">
        <h1 className="text-2xl font-semibold tracking-tight">マイギア</h1>
      </div>
      <div>
        {gearItemsQuery.isLoading ? <p>読み込み中...</p> : null}
        {gearItemsQuery.isError ? (
          <p className="text-destructive">ギア一覧の読み込みに失敗しました。</p>
        ) : null}
        {gearItemsQuery.data?.length === 0 ? <p>まだギアがありません。</p> : null}
        {gearItemsQuery.data ? (
          <Table className="table-fixed">
            <TableHeader>
              <TableRow>
                <TableHead>名前</TableHead>
                <TableHead>カテゴリ</TableHead>
                <TableHead>種別</TableHead>
                <TableHead className="w-[120px]">重量</TableHead>
                <TableHead className="w-[88px]">個数</TableHead>
                <TableHead>メモ</TableHead>
                <TableHead className="w-[160px]">
                  <span className="sr-only">削除</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isCreating ? (
                <TableRow>
                  <TableCell>
                    <Input
                      aria-label="新規名前"
                      value={newDraft.name}
                      onChange={(event) => setNewDraft((prev) => ({ ...prev, name: event.target.value }))}
                    />
                  </TableCell>
                  <TableCell>
                    <Select
                      value={newDraft.category}
                      onValueChange={(value) => setNewDraft((prev) => ({ ...prev, category: value }))}
                    >
                      <SelectTrigger aria-label="新規カテゴリ" className="w-full min-w-0">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {categoryOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    <Select
                      value={newDraft.kind}
                      onValueChange={(value) => setNewDraft((prev) => ({ ...prev, kind: value as ItemKind }))}
                    >
                      <SelectTrigger aria-label="新規種別" className="w-full min-w-0">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {itemKindOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    <Input
                      aria-label="新規重量"
                      type="number"
                      min={1}
                      value={newDraft.weight_grams}
                      onChange={(event) =>
                        setNewDraft((prev) => ({ ...prev, weight_grams: Number(event.target.value) }))
                      }
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      aria-label="新規個数"
                      type="number"
                      min={1}
                      value={newDraft.quantity}
                      onChange={(event) =>
                        setNewDraft((prev) => ({ ...prev, quantity: Number(event.target.value) }))
                      }
                    />
                  </TableCell>
                  <TableCell>
                    <Textarea
                      aria-label="新規メモ"
                      className="min-h-9 h-9 w-full resize-none field-sizing-fixed"
                      rows={1}
                      value={newDraft.notes}
                      onChange={(event) => setNewDraft((prev) => ({ ...prev, notes: event.target.value }))}
                    />
                  </TableCell>
                  <TableCell className="space-x-2">
                    <Button
                      size="sm"
                      disabled={isBusy}
                      onClick={() => {
                        const validationError = validateDraft(newDraft)
                        if (validationError) {
                          setNewRowError(validationError)
                          return
                        }
                        setNewRowError(null)
                        createMutation.mutate(trimDraft(newDraft))
                      }}
                    >
                      追加
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={isBusy}
                      onClick={() => {
                        setIsCreating(false)
                        setNewRowError(null)
                        setNewDraft({
                          name: '',
                          category: 'other',
                          weight_grams: 1,
                          quantity: 1,
                          kind: 'base',
                          notes: '',
                        })
                      }}
                    >
                      取消
                    </Button>
                  </TableCell>
                </TableRow>
              ) : (
                <TableRow>
                  <TableCell colSpan={7}>
                    <Button
                      size="sm"
                      variant="outline"
                      className="w-full"
                      disabled={Boolean(editing.editingItemId) || isBusy}
                      onClick={() => {
                        setNewRowError(null)
                        setNewDraft({
                          name: '',
                          category: 'other',
                          weight_grams: 1,
                          quantity: 1,
                          kind: 'base',
                          notes: '',
                        })
                        setIsCreating(true)
                      }}
                    >
                      + 新規
                    </Button>
                  </TableCell>
                </TableRow>
              )}
              {newRowError ? (
                <TableRow>
                  <TableCell colSpan={7}>
                    <p className="text-sm text-destructive">{newRowError}</p>
                  </TableCell>
                </TableRow>
              ) : null}
              {(gearItemsQuery.data ?? []).map((item) => (
                <EditableGearRow
                  key={item.id}
                  item={item}
                  isEditing={editing.editingItemId === item.id}
                  editingDraft={editing.editingDraft}
                  editingField={editing.editingField}
                  editingRowRef={editing.editingRowRef}
                  isSaving={updateMutation.isPending}
                  isEditDisabled={Boolean(editing.editingItemId) || isCreating || isBusy}
                  onSetDraft={editing.setEditingDraft}
                  onStartEditing={editing.startEditing}
                  onSave={(i) => editing.saveEditing(i)}
                  onCancel={editing.cancelEditing}
                  onDelete={setItemToDelete}
                />
              ))}
              {editing.editingRowError ? (
                <TableRow>
                  <TableCell colSpan={7}>
                    <p className="text-sm text-destructive">{editing.editingRowError}</p>
                  </TableCell>
                </TableRow>
              ) : null}
            </TableBody>
          </Table>
        ) : null}
      </div>

      <AlertDialog
        open={Boolean(itemToDelete)}
        onOpenChange={(open) => {
          if (!open && !deleteMutation.isPending) setItemToDelete(null)
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>ギアを削除しますか？</AlertDialogTitle>
            <AlertDialogDescription>
              {itemToDelete ? `「${itemToDelete.name}」を削除します。この操作は取り消せません。` : ''}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteMutation.isPending}>キャンセル</AlertDialogCancel>
            <AlertDialogAction
              disabled={deleteMutation.isPending || !itemToDelete}
              onClick={(event) => {
                event.preventDefault()
                if (!itemToDelete) return
                deleteMutation.mutate({ itemId: itemToDelete.id, listId: itemToDelete.list_id })
              }}
            >
              削除する
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
