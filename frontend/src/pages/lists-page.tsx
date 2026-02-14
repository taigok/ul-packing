import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'

import { ItemFormFields, type ItemFormValue } from '@/components/item-form-fields'
import { ListCreateForm } from '@/components/list-create-form'
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { ApiError, api } from '@/lib/api'
import { categoryLabel, kindLabel } from '@/lib/format'

export function ListsPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [isAddGearOpen, setIsAddGearOpen] = useState(false)
  const [isCreateListOpen, setIsCreateListOpen] = useState(false)

  const gearItemsQuery = useQuery({ queryKey: ['gear-items'], queryFn: api.getGearItems })
  const listQuery = useQuery({ queryKey: ['lists'], queryFn: api.getLists })
  const createGearItemMutation = useMutation({
    mutationFn: (payload: ItemFormValue) => api.createGearItem(payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['gear-items'] })
      await queryClient.invalidateQueries({ queryKey: ['lists'] })
      setIsAddGearOpen(false)
      toast.success('ギアを追加しました')
    },
    onError: (error) => {
      const message = error instanceof ApiError ? error.message : 'ギアの追加に失敗しました'
      toast.error(message)
    },
  })
  const createListMutation = useMutation({
    mutationFn: api.createList,
    onSuccess: async (list) => {
      await queryClient.invalidateQueries({ queryKey: ['lists'] })
      setIsCreateListOpen(false)
      navigate(`/lists/${list.id}`)
    },
    onError: (error) => {
      const message = error instanceof ApiError ? error.message : 'リストの作成に失敗しました'
      toast.error(message)
    },
  })
  const hasGearItems = Boolean(gearItemsQuery.data && gearItemsQuery.data.length > 0)
  const hasLists = Boolean(listQuery.data && listQuery.data.length > 0)

  return (
    <div className="grid gap-4">
      <Card className="gap-4 py-4">
        <CardHeader className="flex flex-row items-center justify-between gap-3 px-4">
          <CardTitle>マイギア</CardTitle>
          <Dialog open={isAddGearOpen} onOpenChange={setIsAddGearOpen}>
            {hasGearItems ? (
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">+ 新規</Button>
              </DialogTrigger>
            ) : null}
            <DialogContent>
              <DialogHeader>
                <DialogTitle>ギアを追加</DialogTitle>
                <DialogDescription>
                  リストを作らなくても、先にギアを登録できます。
                </DialogDescription>
              </DialogHeader>
              <ItemFormFields
                submitLabel="ギア追加"
                isSubmitting={createGearItemMutation.isPending}
                onSubmit={async (values) => {
                  await createGearItemMutation.mutateAsync(values)
                }}
              />
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent className="px-4">
          {gearItemsQuery.isLoading ? <p>読み込み中...</p> : null}
          {gearItemsQuery.isError ? (
            <p className="text-destructive">ギア一覧の読み込みに失敗しました。</p>
          ) : null}
          {gearItemsQuery.data?.length === 0 ? (
            <div className="grid justify-items-center gap-3 py-6 text-center">
              <p className="text-sm text-muted-foreground">
                まだギアがありません。最初のギアを追加しましょう。
              </p>
              <Button size="sm" onClick={() => setIsAddGearOpen(true)}>
                最初のギアを追加
              </Button>
            </div>
          ) : null}
          {gearItemsQuery.data && gearItemsQuery.data.length > 0 ? (
            <Table className="[&_th]:h-8 [&_th]:px-1.5 [&_td]:px-1.5 [&_td]:py-1.5">
              <TableHeader>
                <TableRow>
                  <TableHead>名前</TableHead>
                  <TableHead>カテゴリ</TableHead>
                  <TableHead>種別</TableHead>
                  <TableHead>重量</TableHead>
                  <TableHead>個数</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {gearItemsQuery.data.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.name}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{categoryLabel(item.category)}</Badge>
                    </TableCell>
                    <TableCell>{kindLabel(item.kind)}</TableCell>
                    <TableCell>{item.weight_grams * item.quantity} g</TableCell>
                    <TableCell>{item.quantity}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : null}
        </CardContent>
      </Card>

      <Card className="gap-4 py-4">
        <CardHeader className="flex flex-row items-center justify-between gap-3 px-4">
          <CardTitle>パッキングリスト</CardTitle>
          <Dialog open={isCreateListOpen} onOpenChange={setIsCreateListOpen}>
            {hasLists ? (
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">+ 新規</Button>
              </DialogTrigger>
            ) : null}
            <DialogContent>
              <DialogHeader>
                <DialogTitle>パッキングリストを作成</DialogTitle>
                <DialogDescription>
                  山行ごとのパッキングリストを作成します。
                </DialogDescription>
              </DialogHeader>
              <ListCreateForm
                isSubmitting={createListMutation.isPending}
                onSubmit={async (values) => {
                  await createListMutation.mutateAsync(values)
                }}
              />
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent className="px-4">
          {listQuery.isLoading ? <p>読み込み中...</p> : null}
          {listQuery.isError ? <p className="text-destructive">リストの読み込みに失敗しました。</p> : null}
          {listQuery.data?.length === 0 ? (
            <div className="grid justify-items-center gap-3 py-6 text-center">
              <p className="text-sm text-muted-foreground">
                まだパッキングリストがありません。最初のリストを作成しましょう。
              </p>
              <Button size="sm" onClick={() => setIsCreateListOpen(true)}>
                最初のリストを作成
              </Button>
            </div>
          ) : null}
          {listQuery.data && listQuery.data.length > 0 ? (
            <Table className="[&_th]:h-8 [&_th]:px-1.5 [&_td]:px-1.5 [&_td]:py-1.5">
              <TableHeader>
                <TableRow>
                  <TableHead>タイトル</TableHead>
                  <TableHead>説明</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {listQuery.data.map((list) => (
                  <TableRow key={list.id}>
                    <TableCell className="font-medium">{list.title}</TableCell>
                    <TableCell>{list.description || '-'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : null}
        </CardContent>
      </Card>
    </div>
  )
}
