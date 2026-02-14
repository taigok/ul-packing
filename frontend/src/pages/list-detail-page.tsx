import { useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { DndContext, DragOverlay, PointerSensor, useSensor, useSensors, useDroppable } from '@dnd-kit/core'
import type { DragEndEvent, DragStartEvent } from '@dnd-kit/core'
import { CopyIcon, EllipsisVerticalIcon, PencilIcon, PlusIcon, TrashIcon } from 'lucide-react'
import { useParams } from 'react-router-dom'
import { toast } from 'sonner'

import { GearSidebar } from '@/components/gear-sidebar'
import { ItemFormFields, type ItemFormValue } from '@/components/item-form-fields'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart'
import { ApiError, api } from '@/lib/api'
import { categoryLabel, formatWeight, kindLabel } from '@/lib/format'
import type { GearItem, GearListItem, Unit } from '@/lib/types'

const mutationErrorMessage = (error: unknown, fallback: string) =>
  error instanceof ApiError ? error.message : fallback

function DroppableItemList({ children }: { children: React.ReactNode }) {
  const { isOver, setNodeRef } = useDroppable({ id: 'packing-list-drop' })

  return (
    <div
      ref={setNodeRef}
      className={`rounded-lg transition-colors ${isOver ? 'ring-2 ring-primary ring-offset-2' : ''}`}
    >
      {children}
    </div>
  )
}

function DragOverlayContent({ item }: { item: GearListItem }) {
  return (
    <div className="flex items-center gap-2 rounded-md border bg-card p-2 text-sm shadow-lg">
      <PlusIcon className="size-4 text-primary" />
      <span className="font-medium">{item.name}</span>
      <Badge variant="outline" className="text-xs">
        {categoryLabel(item.category)}
      </Badge>
    </div>
  )
}

export function ListDetailPage() {
  const { listId } = useParams<{ listId: string }>()
  const queryClient = useQueryClient()
  const [editingItem, setEditingItem] = useState<GearItem | null>(null)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [activeGearItem, setActiveGearItem] = useState<GearListItem | null>(null)
  const listQueryKey = ['list', listId] as const
  const invalidateListQuery = async () => {
    await queryClient.invalidateQueries({ queryKey: listQueryKey })
  }

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  )

  const listQuery = useQuery({
    queryKey: listQueryKey,
    queryFn: () => api.getList(listId ?? ''),
    enabled: Boolean(listId),
  })

  const createItemMutation = useMutation({
    mutationFn: (payload: ItemFormValue) => api.createItem(listId ?? '', payload),
    onSuccess: async () => {
      await invalidateListQuery()
      setIsCreateItemOpen(false)
      toast.success('アイテムを追加しました')
    },
    onError: (error) => toast.error(mutationErrorMessage(error, 'アイテムの追加に失敗しました')),
  })

  const updateItemMutation = useMutation({
    mutationFn: ({ itemId, payload }: { itemId: string; payload: ItemFormValue }) =>
      api.updateItem(listId ?? '', itemId, payload),
    onSuccess: async () => {
      await invalidateListQuery()
      setEditingItem(null)
      toast.success('アイテムを更新しました')
    },
    onError: (error) => toast.error(mutationErrorMessage(error, 'アイテムの更新に失敗しました')),
  })

  const deleteItemMutation = useMutation({
    mutationFn: (itemId: string) => api.deleteItem(listId ?? '', itemId),
    onSuccess: async () => {
      await invalidateListQuery()
      toast.success('アイテムを削除しました')
    },
    onError: (error) => toast.error(mutationErrorMessage(error, 'アイテムの削除に失敗しました')),
  })

  const shareUrl = useMemo(() => {
    if (!listQuery.data?.share_token) return ''
    return `${window.location.origin}/s/${listQuery.data.share_token}`
  }, [listQuery.data?.share_token])

  const handleDragStart = (event: DragStartEvent) => {
    const gearItem = event.active.data.current?.gearItem as GearListItem | undefined
    if (gearItem) {
      setActiveGearItem(gearItem)
    }
  }

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveGearItem(null)
    const { active, over } = event
    if (!over || over.id !== 'packing-list-drop') return

    const gearItem = active.data.current?.gearItem as GearListItem | undefined
    if (!gearItem) return

    createItemMutation.mutate({
      name: gearItem.name,
      category: gearItem.category,
      weight_grams: gearItem.weight_grams,
      quantity: gearItem.quantity,
      kind: gearItem.kind,
      notes: gearItem.notes,
    })
  }

  if (listQuery.isLoading) return <p>読み込み中...</p>
  if (listQuery.isError || !listQuery.data) return <p className="text-destructive">リストが見つかりません。</p>

  const list = listQuery.data
  const kindChartData = [
    { kind: 'base', label: 'ベース', weight: list.summary.base_weight_g, fill: 'var(--color-base)' },
    { kind: 'consumable', label: '消耗品', weight: list.summary.consumable_weight_g, fill: 'var(--color-consumable)' },
    { kind: 'worn', label: '着用', weight: list.summary.worn_weight_g, fill: 'var(--color-worn)' },
  ] as const
  return (
    <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className="flex gap-6">
        {/* Gear Sidebar */}
        {sidebarOpen && (
          <aside className="hidden w-72 shrink-0 lg:block">
            <div className="sticky top-4 max-h-[calc(100vh-2rem)] overflow-hidden rounded-lg border bg-card">
              <GearSidebar unit={list.unit} currentListId={list.id} />
            </div>
          </aside>
        )}

        {/* Main Content */}
        <div className="min-w-0 flex-1">
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>{list.title}</CardTitle>
                  <Button
                    variant="outline"
                    size="sm"
                    className="hidden lg:inline-flex"
                    onClick={() => setSidebarOpen(!sidebarOpen)}
                  >
                    {sidebarOpen ? 'ギアパネルを閉じる' : 'ギアパネルを開く'}
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground">{list.description || '説明なし'}</p>
              </CardHeader>
              <CardContent className="flex flex-wrap items-center gap-3">
                <div className="w-[140px]">
                  <Select
                    value={list.unit}
                    onValueChange={(value) => {
                      void setUnitMutation.mutateAsync(value as Unit)
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="単位" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="g">グラム</SelectItem>
                      <SelectItem value="oz">オンス</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button
                  variant="outline"
                  onClick={() => {
                    if (!shareUrl) return
                    navigator.clipboard.writeText(shareUrl).then(() => toast.success('共有URLをコピーしました'))
                  }}
                >
                  <CopyIcon className="mr-2 size-4" />
                  共有URLをコピー
                </Button>
                <Button asChild variant="outline">
                  <a href={shareUrl} target="_blank" rel="noreferrer">
                    共有ページを開く
                  </a>
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive">トークン再生成</Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>共有トークンを再生成しますか？</AlertDialogTitle>
                      <AlertDialogDescription>
                        既存の共有URLはすぐに使えなくなります。
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>キャンセル</AlertDialogCancel>
                      <AlertDialogAction onClick={() => void regenerateShareMutation.mutateAsync()}>
                        再生成
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </CardContent>
            </Card>

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {summaryCards.map((card) => (
                <Card key={card.title}>
                  <CardHeader>
                    <CardTitle className="text-sm">{card.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="text-xl font-semibold">
                    {formatWeight(card.weight, list.unit)}
                  </CardContent>
                </Card>
              ))}
            </div>

            <Card>
              <CardHeader>
                <CardTitle>アイテム追加</CardTitle>
              </CardHeader>
              <CardContent>
                <ItemFormFields
                  submitLabel="アイテム追加"
                  isSubmitting={createItemMutation.isPending}
                  onSubmit={async (values) => {
                    await createItemMutation.mutateAsync(values)
                  }}
                />
              </CardContent>
            </Card>

            <DroppableItemList>
              <Card>
                <CardHeader>
                  <CardTitle>アイテム一覧</CardTitle>
                  <p className="text-xs text-muted-foreground">
                    左のギアパネルからドラッグ＆ドロップでアイテムを追加できます
                  </p>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>名前</TableHead>
                        <TableHead>カテゴリ</TableHead>
                        <TableHead>種別</TableHead>
                        <TableHead>重量</TableHead>
                        <TableHead>個数</TableHead>
                        <TableHead className="w-[90px]">操作</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {list.items.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell className="font-medium">{item.name}</TableCell>
                          <TableCell>
                            <Badge variant="outline">{categoryLabel(item.category)}</Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant="secondary">{kindLabel(item.kind)}</Badge>
                          </TableCell>
                          <TableCell>{formatWeight(item.weight_grams * item.quantity, list.unit)}</TableCell>
                          <TableCell>{item.quantity}</TableCell>
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon-sm">
                                  <EllipsisVerticalIcon className="size-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => setEditingItem(item)}>
                                  <PencilIcon className="mr-2 size-4" />
                                  編集
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  className="text-destructive"
                                  onClick={() => void deleteItemMutation.mutateAsync(item.id)}
                                >
                                  <TrashIcon className="mr-2 size-4" />
                                  削除
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </DroppableItemList>
          </div>
        </div>
      </div>

      <DragOverlay>
        {activeGearItem ? <DragOverlayContent item={activeGearItem} /> : null}
      </DragOverlay>

      <Dialog open={Boolean(editingItem)} onOpenChange={(open) => !open && setEditingItem(null)}>
        <DialogTrigger asChild>
          <span />
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>アイテム編集</DialogTitle>
            <DialogDescription>項目を更新して保存します。</DialogDescription>
          </DialogHeader>
          {editingItem ? (
            <ItemFormFields
              defaultValue={editingItem}
              submitLabel="更新する"
              isSubmitting={updateItemMutation.isPending}
              onSubmit={async (values) => {
                await updateItemMutation.mutateAsync({
                  itemId: editingItem.id,
                  payload: values,
                })
              }}
            />
          ) : null}
        </DialogContent>
      </Dialog>
    </DndContext>
  )
}
