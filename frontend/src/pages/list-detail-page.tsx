import { useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  closestCenter,
  useSensor,
  useSensors,
  useDroppable,
} from '@dnd-kit/core'
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import type { DragEndEvent, DragStartEvent } from '@dnd-kit/core'
import {
  CopyIcon,
  EllipsisVerticalIcon,
  GripVerticalIcon,
  PencilIcon,
  PlusIcon,
  TrashIcon,
} from 'lucide-react'
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
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
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart'
import { Pie, PieChart } from 'recharts'
import { ApiError, api } from '@/lib/api'
import { categoryLabel, formatWeight, kindLabel } from '@/lib/format'
import type { Category, GearItem, GearListItem, Unit } from '@/lib/types'

const mutationErrorMessage = (error: unknown, fallback: string) =>
  error instanceof ApiError ? error.message : fallback

function DroppableItemList({
  children,
  isOver,
  isEmpty,
}: {
  children: React.ReactNode
  isOver: boolean
  isEmpty: boolean
}) {
  const { setNodeRef } = useDroppable({ id: 'packing-list-drop' })

  return (
    <div
      ref={setNodeRef}
      className={`rounded-lg transition-all duration-200 ${
        isOver
          ? 'ring-2 ring-primary ring-offset-2 bg-primary/5'
          : ''
      }`}
    >
      {children}
      {isEmpty && (
        <div
          className={`mx-6 mb-6 flex flex-col items-center justify-center rounded-lg border-2 border-dashed py-12 text-center transition-colors ${
            isOver
              ? 'border-primary bg-primary/10 text-primary'
              : 'border-muted-foreground/25 text-muted-foreground'
          }`}
        >
          <PlusIcon className={`mb-2 size-8 ${isOver ? 'text-primary' : 'text-muted-foreground/50'}`} />
          <p className="text-sm font-medium">
            {isOver ? 'ここにドロップして追加' : 'ギアパネルからドラッグして追加'}
          </p>
        </div>
      )}
    </div>
  )
}

function SortableItemRow({
  item,
  unit,
  onEdit,
  onDelete,
}: {
  item: GearItem
  unit: Unit
  onEdit: (item: GearItem) => void
  onDelete: (itemId: string) => void
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <TableRow
      ref={setNodeRef}
      style={style}
      className={isDragging ? 'opacity-40 bg-muted' : ''}
    >
      <TableCell className="w-[40px] px-2">
        <button
          type="button"
          className="cursor-grab touch-none rounded p-1 text-muted-foreground hover:bg-accent hover:text-foreground active:cursor-grabbing"
          {...listeners}
          {...attributes}
        >
          <GripVerticalIcon className="size-4" />
        </button>
      </TableCell>
      <TableCell className="font-medium">{item.name}</TableCell>
      <TableCell>
        <Badge variant="outline">{categoryLabel(item.category)}</Badge>
      </TableCell>
      <TableCell>
        <Badge variant="secondary">{kindLabel(item.kind)}</Badge>
      </TableCell>
      <TableCell>{formatWeight(item.weight_grams * item.quantity, unit)}</TableCell>
      <TableCell>{item.quantity}</TableCell>
      <TableCell>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon-sm">
              <EllipsisVerticalIcon className="size-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onEdit(item)}>
              <PencilIcon className="mr-2 size-4" />
              編集
            </DropdownMenuItem>
            <DropdownMenuItem
              className="text-destructive"
              onClick={() => onDelete(item.id)}
            >
              <TrashIcon className="mr-2 size-4" />
              削除
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </TableRow>
  )
}

function DragOverlayContent({ item, type }: { item: { name: string; category: Category }; type: 'gear' | 'reorder' }) {
  return (
    <div className="flex items-center gap-2 rounded-md border bg-card p-2 text-sm shadow-lg">
      {type === 'gear' ? (
        <PlusIcon className="size-4 text-primary" />
      ) : (
        <GripVerticalIcon className="size-4 text-muted-foreground" />
      )}
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
  const [activeListItem, setActiveListItem] = useState<GearItem | null>(null)
  const [isOverDropZone, setIsOverDropZone] = useState(false)
  const listQueryKey = ['list', listId] as const
  const invalidateListQuery = async () => {
    await queryClient.invalidateQueries({ queryKey: listQueryKey })
  }

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
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

  const reorderMutation = useMutation({
    mutationFn: (itemIds: string[]) => api.reorderItems(listId ?? '', itemIds),
    onError: (error) => {
      toast.error(mutationErrorMessage(error, '並び替えに失敗しました'))
      void invalidateListQuery()
    },
  })

  const setUnitMutation = useMutation({
    mutationFn: (unit: Unit) => api.setUnit(listId ?? '', unit),
    onSuccess: async () => {
      await invalidateListQuery()
      toast.success('単位を更新しました')
    },
    onError: (error) => toast.error(mutationErrorMessage(error, '単位の更新に失敗しました')),
  })
  const regenerateShareMutation = useMutation({
    mutationFn: () => api.regenerateShareToken(listId ?? ''),
    onSuccess: async () => {
      await invalidateListQuery()
      toast.success('共有トークンを再生成しました')
    },
    onError: (error) => toast.error(mutationErrorMessage(error, '共有トークンの再生成に失敗しました')),
  })

  const shareUrl = useMemo(() => {
    if (!listQuery.data?.share_token) return ''
    return `${window.location.origin}/s/${listQuery.data.share_token}`
  }, [listQuery.data?.share_token])

  const handleDragStart = (event: DragStartEvent) => {
    const gearItem = event.active.data.current?.gearItem as GearListItem | undefined
    if (gearItem) {
      setActiveGearItem(gearItem)
      return
    }

    // It's a list item being reordered
    const item = listQuery.data?.items.find((i) => i.id === event.active.id)
    if (item) {
      setActiveListItem(item)
    }
  }

  const handleDragOver = (event: { over: { id: string | number } | null }) => {
    setIsOverDropZone(event.over?.id === 'packing-list-drop')
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const wasGearDrag = Boolean(activeGearItem)
    setActiveGearItem(null)
    setActiveListItem(null)
    setIsOverDropZone(false)

    const { active, over } = event
    if (!over) return

    // Gear item dropped onto the packing list
    if (wasGearDrag) {
      if (over.id !== 'packing-list-drop') return
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
      return
    }

    // List item reorder
    if (active.id === over.id) return
    const items = listQuery.data?.items
    if (!items) return

    const oldIndex = items.findIndex((i) => i.id === active.id)
    const newIndex = items.findIndex((i) => i.id === over.id)
    if (oldIndex === -1 || newIndex === -1) return

    const reordered = arrayMove(items, oldIndex, newIndex)
    const newItemIds = reordered.map((i) => i.id)

    // Optimistic update
    queryClient.setQueryData(listQueryKey, (old: typeof listQuery.data) => {
      if (!old) return old
      return { ...old, items: reordered }
    })

    reorderMutation.mutate(newItemIds)
  }

  if (listQuery.isLoading) return <p>読み込み中...</p>
  if (listQuery.isError || !listQuery.data) return <p className="text-destructive">リストが見つかりません。</p>

  const list = listQuery.data
  const summaryCards = [
    { title: '総重量', weight: list.summary.total_pack_g },
    { title: 'ベース', weight: list.summary.base_weight_g },
    { title: '消耗品', weight: list.summary.consumable_weight_g },
    { title: '着用', weight: list.summary.worn_weight_g },
  ] as const
  const chartConfig = {
    base: { label: 'ベース', color: 'var(--chart-1)' },
    consumable: { label: '消耗品', color: 'var(--chart-2)' },
    worn: { label: '着用', color: 'var(--chart-3)' },
  } satisfies ChartConfig
  const kindChartData = [
    { kind: 'base', label: 'ベース', weight: list.summary.base_weight_g, fill: 'var(--color-base)' },
    { kind: 'consumable', label: '消耗品', weight: list.summary.consumable_weight_g, fill: 'var(--color-consumable)' },
    { kind: 'worn', label: '着用', weight: list.summary.worn_weight_g, fill: 'var(--color-worn)' },
  ]
  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
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
                <CardTitle>重量内訳グラフ</CardTitle>
              </CardHeader>
              <CardContent>
                <ChartContainer config={chartConfig} className="mx-auto max-h-64">
                  <PieChart>
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Pie data={kindChartData} dataKey="weight" nameKey="kind" innerRadius={45} strokeWidth={2} />
                  </PieChart>
                </ChartContainer>
              </CardContent>
            </Card>

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

            <DroppableItemList isOver={isOverDropZone && Boolean(activeGearItem)} isEmpty={list.items.length === 0}>
              <Card>
                <CardHeader>
                  <CardTitle>アイテム一覧</CardTitle>
                  <p className="text-xs text-muted-foreground">
                    ドラッグで並び替え・ギアパネルからドロップで追加できます
                  </p>
                </CardHeader>
                {list.items.length > 0 && (
                  <CardContent>
                    <SortableContext items={list.items.map((i) => i.id)} strategy={verticalListSortingStrategy}>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="w-[40px] px-2" />
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
                            <SortableItemRow
                              key={item.id}
                              item={item}
                              unit={list.unit}
                              onEdit={setEditingItem}
                              onDelete={(itemId) => void deleteItemMutation.mutateAsync(itemId)}
                            />
                          ))}
                        </TableBody>
                      </Table>
                    </SortableContext>
                  </CardContent>
                )}
              </Card>
            </DroppableItemList>
          </div>
        </div>
      </div>

      <DragOverlay dropAnimation={{ duration: 200, easing: 'ease' }}>
        {activeGearItem ? (
          <DragOverlayContent item={activeGearItem} type="gear" />
        ) : activeListItem ? (
          <DragOverlayContent item={activeListItem} type="reorder" />
        ) : null}
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
