import { useEffect, useRef, useState } from 'react'
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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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
import { ApiError } from '@/lib/api'
import { categoryLabel, kindLabel } from '@/lib/format'
import { api } from '@/lib/api'
import type { GearListItem, ItemKind } from '@/lib/types'

type ItemDraft = {
  name: string
  category: string
  weight_grams: number
  quantity: number
  kind: ItemKind
  notes: string
}

type EditField = 'name' | 'category' | 'kind' | 'weight_grams' | 'quantity' | 'notes'

const toDraft = (item: GearListItem): ItemDraft => ({
  name: item.name,
  category: item.category,
  weight_grams: item.weight_grams,
  quantity: item.quantity,
  kind: item.kind,
  notes: item.notes,
})

const trimDraft = (draft: ItemDraft): ItemDraft => ({
  ...draft,
  name: draft.name.trim(),
  notes: draft.notes.trim(),
})

const validateDraft = (draft: ItemDraft): string | null => {
  if (!draft.name.trim()) return '名前は必須です。'
  if (!Number.isInteger(draft.weight_grams) || draft.weight_grams < 1) return '重量は1以上で入力してください。'
  if (!Number.isInteger(draft.quantity) || draft.quantity < 1) return '個数は1以上で入力してください。'
  return null
}

const hasChanges = (item: GearListItem, draft: ItemDraft) => {
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

const mutationErrorMessage = (error: unknown, fallback: string) =>
  error instanceof ApiError ? error.message : fallback

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
  const [editingItemId, setEditingItemId] = useState<string | null>(null)
  const [editingDraft, setEditingDraft] = useState<ItemDraft | null>(null)
  const [editingField, setEditingField] = useState<EditField>('name')
  const [editingRowError, setEditingRowError] = useState<string | null>(null)
  const [itemToDelete, setItemToDelete] = useState<GearListItem | null>(null)
  const editingRowRef = useRef<HTMLTableRowElement | null>(null)
  const categoryTriggerRef = useRef<HTMLButtonElement | null>(null)
  const kindTriggerRef = useRef<HTMLButtonElement | null>(null)

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
      const message = mutationErrorMessage(error, 'ギアの追加に失敗しました')
      setNewRowError(message)
      toast.error(message)
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ itemId, listId, payload }: { itemId: string; listId: string; payload: ItemDraft }) =>
      api.updateItem(listId, itemId, payload),
    onSuccess: async () => {
      await invalidateQueries()
      setEditingItemId(null)
      setEditingDraft(null)
      setEditingRowError(null)
      toast.success('ギアを更新しました')
    },
    onError: (error) => {
      const message = mutationErrorMessage(error, 'ギアの更新に失敗しました')
      setEditingRowError(message)
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
    onError: (error) => toast.error(mutationErrorMessage(error, 'ギアの削除に失敗しました')),
  })

  const isBusy = createMutation.isPending || updateMutation.isPending || deleteMutation.isPending

  useEffect(() => {
    if (!editingItemId) return
    if (editingField === 'category') categoryTriggerRef.current?.focus()
    if (editingField === 'kind') kindTriggerRef.current?.focus()
  }, [editingField, editingItemId])

  const startEditing = (item: GearListItem, field: EditField) => {
    if (editingItemId || isCreating || isBusy) return
    setEditingItemId(item.id)
    setEditingDraft(toDraft(item))
    setEditingField(field)
    setEditingRowError(null)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>マイギア</CardTitle>
      </CardHeader>
      <CardContent>
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
                <TableHead>重量</TableHead>
                <TableHead>個数</TableHead>
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
                      disabled={Boolean(editingItemId) || isBusy}
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
                <TableRow
                  key={item.id}
                  ref={editingItemId === item.id ? editingRowRef : null}
                  onBlurCapture={() => {
                    if (editingItemId !== item.id || !editingDraft || updateMutation.isPending) return
                    setTimeout(() => {
                      const activeElement = document.activeElement
                      if (editingRowRef.current?.contains(activeElement)) return

                      const validationError = validateDraft(editingDraft)
                      if (validationError) {
                        setEditingRowError(validationError)
                        return
                      }
                      if (!hasChanges(item, editingDraft)) {
                        setEditingItemId(null)
                        setEditingDraft(null)
                        setEditingRowError(null)
                        return
                      }
                      setEditingRowError(null)
                      updateMutation.mutate({
                        itemId: item.id,
                        listId: item.list_id,
                        payload: trimDraft(editingDraft),
                      })
                    }, 0)
                  }}
                >
                  {editingItemId === item.id && editingDraft ? (
                    <>
                      <TableCell>
                        <Input
                          aria-label="編集名前"
                          autoFocus={editingField === 'name'}
                          value={editingDraft.name}
                          onChange={(event) =>
                            setEditingDraft((prev) => (prev ? { ...prev, name: event.target.value } : prev))
                          }
                        />
                      </TableCell>
                      <TableCell>
                        <Select
                          value={editingDraft.category}
                          onValueChange={(value) =>
                            setEditingDraft((prev) => (prev ? { ...prev, category: value } : prev))
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
                            setEditingDraft((prev) => (prev ? { ...prev, kind: value as ItemKind } : prev))
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
                            setEditingDraft((prev) =>
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
                            setEditingDraft((prev) =>
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
                            setEditingDraft((prev) => (prev ? { ...prev, notes: event.target.value } : prev))
                          }
                        />
                      </TableCell>
                      <TableCell className="space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={updateMutation.isPending}
                          onClick={(event) => {
                            event.stopPropagation()
                            setEditingItemId(null)
                            setEditingDraft(null)
                            setEditingField('name')
                            setEditingRowError(null)
                          }}
                        >
                          キャンセル
                        </Button>
                      </TableCell>
                    </>
                  ) : (
                    <>
                      <TableCell className="font-medium cursor-pointer" onClick={() => startEditing(item, 'name')}>
                        {item.name}
                      </TableCell>
                      <TableCell className="cursor-pointer" onClick={() => startEditing(item, 'category')}>
                        <Badge variant="outline">{categoryLabel(item.category)}</Badge>
                      </TableCell>
                      <TableCell className="cursor-pointer" onClick={() => startEditing(item, 'kind')}>
                        {kindLabel(item.kind)}
                      </TableCell>
                      <TableCell className="cursor-pointer" onClick={() => startEditing(item, 'weight_grams')}>
                        {item.weight_grams * item.quantity} g
                      </TableCell>
                      <TableCell className="cursor-pointer" onClick={() => startEditing(item, 'quantity')}>
                        {item.quantity}
                      </TableCell>
                      <TableCell className="cursor-pointer" onClick={() => startEditing(item, 'notes')}>
                        {item.notes || '-'}
                      </TableCell>
                      <TableCell className="space-x-2">
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          aria-label={`${item.name}を削除`}
                          className="text-muted-foreground hover:text-foreground"
                          disabled={Boolean(editingItemId) || isCreating || isBusy}
                          onClick={(event) => {
                            event.stopPropagation()
                            setItemToDelete(item)
                          }}
                        >
                          <Trash2Icon className="size-4" />
                        </Button>
                      </TableCell>
                    </>
                  )}
                </TableRow>
              ))}
              {editingRowError ? (
                <TableRow>
                  <TableCell colSpan={7}>
                    <p className="text-sm text-destructive">{editingRowError}</p>
                  </TableCell>
                </TableRow>
              ) : null}
            </TableBody>
          </Table>
        ) : null}
      </CardContent>

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
    </Card>
  )
}
