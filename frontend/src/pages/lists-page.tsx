import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'

import { ListCreateForm } from '@/components/list-create-form'
import { Button } from '@/components/ui/button'
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

export function ListsPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [isCreateListOpen, setIsCreateListOpen] = useState(false)

  const listQuery = useQuery({ queryKey: ['lists'], queryFn: api.getLists })
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
  const hasLists = Boolean(listQuery.data && listQuery.data.length > 0)

  return (
    <div className="grid">
      <div className="mb-4 flex flex-row items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold tracking-tight">パッキングリスト</h1>
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
      </div>
      <div>
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
          <Table className="[&_td]:py-3">
            <TableHeader>
              <TableRow>
                <TableHead>タイトル</TableHead>
                <TableHead>説明</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {listQuery.data.map((list) => (
                <TableRow
                  key={list.id}
                  tabIndex={0}
                  className="cursor-pointer"
                  onClick={() => navigate(`/lists/${list.id}`)}
                  onKeyDown={(event) => {
                    if (event.key !== 'Enter' && event.key !== ' ') return
                    event.preventDefault()
                    navigate(`/lists/${list.id}`)
                  }}
                >
                  <TableCell className="font-medium">{list.title}</TableCell>
                  <TableCell>{list.description || '-'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : null}
      </div>
    </div>
  )
}
