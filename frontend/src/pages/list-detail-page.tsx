import { useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { CopyIcon, EllipsisVerticalIcon, PencilIcon, TrashIcon } from 'lucide-react'
import { Cell, Label, Pie, PieChart } from 'recharts'
import { useParams } from 'react-router-dom'
import { toast } from 'sonner'

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
import type { GearItem } from '@/lib/types'

const mutationErrorMessage = (error: unknown, fallback: string) =>
  error instanceof ApiError ? error.message : fallback

const weightChartConfig = {
  base: { label: 'ベース', color: 'var(--chart-1)' },
  consumable: { label: '消耗品', color: 'var(--chart-2)' },
  worn: { label: '着用', color: 'var(--chart-3)' },
} satisfies ChartConfig

export function ListDetailPage() {
  const { listId } = useParams<{ listId: string }>()
  const queryClient = useQueryClient()
  const [editingItem, setEditingItem] = useState<GearItem | null>(null)
  const [isCreateItemOpen, setIsCreateItemOpen] = useState(false)
  const listQueryKey = ['list', listId] as const
  const invalidateListQuery = async () => {
    await queryClient.invalidateQueries({ queryKey: listQueryKey })
  }

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

  if (listQuery.isLoading) return <p>読み込み中...</p>
  if (listQuery.isError || !listQuery.data) return <p className="text-destructive">リストが見つかりません。</p>

  const list = listQuery.data
  const kindChartData = [
    { kind: 'base', label: 'ベース', weight: list.summary.base_weight_g, fill: 'var(--color-base)' },
    { kind: 'consumable', label: '消耗品', weight: list.summary.consumable_weight_g, fill: 'var(--color-consumable)' },
    { kind: 'worn', label: '着用', weight: list.summary.worn_weight_g, fill: 'var(--color-worn)' },
  ] as const
  return (
    <div className="grid gap-4">
      <section className="flex flex-col gap-3 px-1 md:flex-row md:items-start md:justify-between">
        <div className="grid gap-1">
          <h1 className="text-lg font-semibold">{list.title}</h1>
          <p className="text-sm text-muted-foreground">{list.description || '説明なし'}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2 md:justify-end">
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
        </div>
      </section>

      <div className="grid items-start gap-3 xl:grid-cols-[minmax(0,1fr)_340px]">
        <Card className="gap-3 py-4">
          <CardHeader className="flex flex-row items-center justify-between gap-3 px-4">
            <CardTitle>アイテム一覧</CardTitle>
            <Dialog open={isCreateItemOpen} onOpenChange={setIsCreateItemOpen}>
              <DialogTrigger asChild>
                <Button size="sm">+ アイテム追加</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>アイテム追加</DialogTitle>
                  <DialogDescription>追加するアイテム情報を入力してください。</DialogDescription>
                </DialogHeader>
                <ItemFormFields
                  submitLabel="アイテム追加"
                  isSubmitting={createItemMutation.isPending}
                  onSubmit={async (values) => {
                    await createItemMutation.mutateAsync(values)
                  }}
                />
              </DialogContent>
            </Dialog>
          </CardHeader>
          <CardContent className="px-4">
            <Table className="[&_th]:h-8 [&_th]:px-1.5 [&_td]:px-1.5 [&_td]:py-1.5">
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

        <aside className="grid gap-3 xl:sticky xl:top-4">
          <Card className="gap-2 py-2">
            <CardHeader className="px-3">
              <CardTitle>重量内訳グラフ</CardTitle>
            </CardHeader>
            <CardContent className="px-3 pb-3">
              <ChartContainer
                config={weightChartConfig}
                className="mx-auto aspect-auto h-[250px] w-full max-w-[300px]"
              >
                <PieChart margin={{ top: 8, right: 16, bottom: 8, left: 16 }}>
                  <ChartTooltip content={<ChartTooltipContent nameKey="kind" hideLabel />} />
                  <Pie
                    data={kindChartData}
                    dataKey="weight"
                    nameKey="label"
                    cx="50%"
                    cy="50%"
                    innerRadius={44}
                    outerRadius={82}
                    paddingAngle={2}
                    labelLine={false}
                  >
                    {kindChartData.map((entry) => (
                      <Cell key={entry.kind} fill={entry.fill} />
                    ))}
                    <Label
                      content={({ viewBox }) => {
                        if (!viewBox || !('cx' in viewBox) || !('cy' in viewBox)) return null

                        const cx = Number(viewBox.cx)
                        const cy = Number(viewBox.cy)
                        if (!Number.isFinite(cx) || !Number.isFinite(cy)) return null

                        return (
                          <g className="select-none">
                            <text
                              x={cx}
                              y={cy - 9}
                              textAnchor="middle"
                              dominantBaseline="middle"
                              className="fill-muted-foreground text-[10px]"
                            >
                              総重量
                            </text>
                            <text
                              x={cx}
                              y={cy + 11}
                              textAnchor="middle"
                              dominantBaseline="middle"
                              className="fill-foreground text-[12px] font-semibold"
                            >
                              {formatWeight(list.summary.total_pack_g, list.unit)}
                            </text>
                          </g>
                        )
                      }}
                    />
                  </Pie>
                </PieChart>
              </ChartContainer>
              <div className="mt-2 grid gap-1 text-xs">
                {kindChartData.map((entry) => (
                  <div key={entry.kind} className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5">
                      <span className="h-2 w-2 rounded-[2px]" style={{ backgroundColor: entry.fill }} />
                      <span className="text-muted-foreground">{entry.label}</span>
                    </div>
                    <span className="font-medium tabular-nums">
                      {formatWeight(entry.weight, list.unit)}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </aside>
      </div>

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
    </div>
  )
}
