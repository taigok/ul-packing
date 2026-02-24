import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'

import { ListCreateForm } from '@/components/list-create-form'
import { Badge } from '@/components/ui/badge'
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
import { api, apiErrorMessage } from '@/lib/api'
import type { PackingList } from '@/lib/types'

type Tab = 'lists' | 'templates'

export function ListsPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [isCreateListOpen, setIsCreateListOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<Tab>('lists')

  const listQuery = useQuery({ queryKey: ['lists'], queryFn: api.getLists })
  const templateQuery = useQuery({ queryKey: ['list-templates'], queryFn: api.getTemplates })
  const createListMutation = useMutation({
    mutationFn: api.createList,
    onSuccess: async (list) => {
      await queryClient.invalidateQueries({ queryKey: ['lists'] })
      await queryClient.invalidateQueries({ queryKey: ['list-templates'] })
      setIsCreateListOpen(false)
      navigate(`/lists/${list.id}`)
    },
    onError: (error) => toast.error(apiErrorMessage(error, 'リストの作成に失敗しました')),
  })

  const toggleTemplateMutation = useMutation({
    mutationFn: ({ list, isTemplate }: { list: PackingList; isTemplate: boolean }) =>
      api.updateList(list.id, {
        title: list.title,
        description: list.description,
        is_template: isTemplate,
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['lists'] })
      await queryClient.invalidateQueries({ queryKey: ['list-templates'] })
      toast.success('テンプレート設定を更新しました')
    },
    onError: (error) => toast.error(apiErrorMessage(error, 'テンプレート設定の更新に失敗しました')),
  })

  const packingLists = listQuery.data?.filter((list) => !list.is_template)
  const templates = templateQuery.data ?? []

  return (
    <div className="grid">
      <Dialog open={isCreateListOpen} onOpenChange={setIsCreateListOpen}>
      <div className="mb-4 flex flex-row items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold tracking-tight">パッキングリスト</h1>
      </div>

      {/* Tabs */}
      <div className="mb-4 flex gap-1 border-b" role="tablist" aria-label="リスト種別">
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'lists'}
          aria-controls="panel-lists"
          className={`px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === 'lists'
              ? 'border-b-2 border-primary text-primary'
              : 'text-muted-foreground hover:text-foreground'
          }`}
          onClick={() => setActiveTab('lists')}
        >
          マイリスト
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'templates'}
          aria-controls="panel-templates"
          className={`px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === 'templates'
              ? 'border-b-2 border-primary text-primary'
              : 'text-muted-foreground hover:text-foreground'
          }`}
          onClick={() => setActiveTab('templates')}
        >
          テンプレート
          {templates.length > 0 ? (
            <Badge variant="secondary" className="ml-2">{templates.length}</Badge>
          ) : null}
        </button>
      </div>

      <div>
        {activeTab === 'lists' ? (
          <div id="panel-lists" role="tabpanel" aria-label="マイリスト">
            {listQuery.isLoading ? <p>読み込み中...</p> : null}
            {listQuery.isError ? <p className="text-destructive">リストの読み込みに失敗しました。</p> : null}
            {packingLists?.length === 0 ? (
              <div className="grid justify-items-center gap-3 py-6 text-center">
                <p className="text-sm text-muted-foreground">
                  まだパッキングリストがありません。最初のリストを作成しましょう。
                </p>
                <Button size="sm" onClick={() => setIsCreateListOpen(true)}>
                  最初のリストを作成
                </Button>
              </div>
            ) : null}
            {packingLists && packingLists.length > 0 ? (
              <Table className="[&_td]:py-3">
                <TableHeader>
                  <TableRow>
                    <TableHead>タイトル</TableHead>
                    <TableHead>説明</TableHead>
                    <TableHead className="w-[140px]">操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell colSpan={3}>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm" className="w-full">+ 新規</Button>
                      </DialogTrigger>
                    </TableCell>
                  </TableRow>
                  {packingLists.map((list) => (
                    <TableRow
                      key={list.id}
                      role="link"
                      tabIndex={0}
                      aria-label={`${list.title}を開く`}
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
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          aria-label={`${list.title}をテンプレートに設定`}
                          onClick={(e) => {
                            e.stopPropagation()
                            toggleTemplateMutation.mutate({ list, isTemplate: true })
                          }}
                        >
                          テンプレ化
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : null}
          </div>
        ) : (
          <div id="panel-templates" role="tabpanel" aria-label="テンプレート">
            {templateQuery.isLoading ? <p>読み込み中...</p> : null}
            {templateQuery.isError ? <p className="text-destructive">テンプレートの読み込みに失敗しました。</p> : null}
            {templates.length === 0 && !templateQuery.isLoading ? (
              <div className="grid justify-items-center gap-3 py-6 text-center">
                <p className="text-sm text-muted-foreground">
                  テンプレートがまだありません。リストをテンプレートとしてマークするか、新規作成時にテンプレートとして保存できます。
                </p>
              </div>
            ) : null}
            {templates.length > 0 ? (
              <Table className="[&_td]:py-3">
                <TableHeader>
                  <TableRow>
                    <TableHead>タイトル</TableHead>
                    <TableHead>説明</TableHead>
                    <TableHead className="w-[240px]">操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {templates.map((template) => (
                    <TableRow key={template.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span
                            tabIndex={0}
                            role="link"
                            aria-label={`${template.title}を開く`}
                            className="cursor-pointer font-medium hover:underline"
                            onClick={() => navigate(`/lists/${template.id}`)}
                            onKeyDown={(event) => {
                              if (event.key !== 'Enter' && event.key !== ' ') return
                              event.preventDefault()
                              navigate(`/lists/${template.id}`)
                            }}
                          >
                            {template.title}
                          </span>
                          <Badge variant="secondary">テンプレート</Badge>
                        </div>
                      </TableCell>
                      <TableCell>{template.description || '-'}</TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <DialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                            >
                              このテンプレートから作成
                            </Button>
                          </DialogTrigger>
                          <Button
                            variant="ghost"
                            size="sm"
                            aria-label={`${template.title}のテンプレートを解除`}
                            onClick={() =>
                              toggleTemplateMutation.mutate({ list: template, isTemplate: false })
                            }
                          >
                            解除
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : null}
          </div>
        )}
      </div>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>パッキングリストを作成</DialogTitle>
          <DialogDescription>
            山行ごとのパッキングリストを作成します。
          </DialogDescription>
        </DialogHeader>
        <ListCreateForm
          isSubmitting={createListMutation.isPending}
          templateOptions={templateQuery.data ?? []}
          onSubmit={async (values) => {
            await createListMutation.mutateAsync(values)
          }}
        />
      </DialogContent>
      </Dialog>
    </div>
  )
}
