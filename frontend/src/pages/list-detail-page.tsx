import { useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { CopyIcon, EllipsisVerticalIcon, PencilIcon, TrashIcon } from 'lucide-react'
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
import { ApiError, api } from '@/lib/api'
import { categoryLabel, formatWeight, kindLabel } from '@/lib/format'
import type { GearItem, Unit } from '@/lib/types'

const mutationErrorMessage = (error: unknown, fallback: string) =>
  error instanceof ApiError ? error.message : fallback

export function ListDetailPage() {
  const { listId } = useParams<{ listId: string }>()
  const queryClient = useQueryClient()
  const [editingItem, setEditingItem] = useState<GearItem | null>(null)
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

  const setUnitMutation = useMutation({
    mutationFn: (unit: Unit) => api.setUnit(listId ?? '', unit),
    onSuccess: async () => {
      await invalidateListQuery()
    },
    onError: (error) => toast.error(mutationErrorMessage(error, '単位の更新に失敗しました')),
  })

  const setTemplateMutation = useMutation({
    mutationFn: (isTemplate: boolean) => api.setTemplate(listId ?? '', isTemplate),
    onSuccess: async (_, isTemplate) => {
      await invalidateListQuery()
      toast.success(isTemplate ? 'テンプレートとして保存しました' : 'テンプレート設定を解除しました')
    },
    onError: (error) => toast.error(mutationErrorMessage(error, 'テンプレート設定の更新に失敗しました')),
  })

  const regenerateShareMutation = useMutation({
    mutationFn: () => api.regenerateShareToken(listId ?? ''),
    onSuccess: async () => {
      await invalidateListQuery()
      toast.success('共有トークンを再生成しました')
    },
    onError: (error) => toast.error(mutationErrorMessage(error, 'トークン再生成に失敗しました')),
  })

  const shareUrl = useMemo(() => {
    if (!listQuery.data?.share_token) return ''
    return `${window.location.origin}/s/${listQuery.data.share_token}`
  }, [listQuery.data?.share_token])

  if (listQuery.isLoading) return <p>読み込み中...</p>
  if (listQuery.isError || !listQuery.data) return <p className="text-destructive">リストが見つかりません。</p>

  const list = listQuery.data
  const summaryCards = [
    { title: 'ベース', weight: list.summary.base_weight_g },
    { title: '消耗品', weight: list.summary.consumable_weight_g },
    { title: '着用', weight: list.summary.worn_weight_g },
    { title: '合計', weight: list.summary.total_pack_g },
  ] as const

  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader>
          <CardTitle>{list.title}</CardTitle>
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
              void setTemplateMutation.mutateAsync(!list.is_template)
            }}
          >
            {list.is_template ? 'テンプレート解除' : 'テンプレートとして保存'}
          </Button>
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

      <Card>
        <CardHeader>
          <CardTitle>アイテム一覧</CardTitle>
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
