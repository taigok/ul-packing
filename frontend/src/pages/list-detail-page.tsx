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
import { formatWeight, kindLabel } from '@/lib/format'
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
      toast.success('Item added')
    },
    onError: (error) => toast.error(mutationErrorMessage(error, 'Failed to add item')),
  })

  const updateItemMutation = useMutation({
    mutationFn: ({ itemId, payload }: { itemId: string; payload: ItemFormValue }) =>
      api.updateItem(listId ?? '', itemId, payload),
    onSuccess: async () => {
      await invalidateListQuery()
      setEditingItem(null)
      toast.success('Item updated')
    },
    onError: (error) => toast.error(mutationErrorMessage(error, 'Failed to update item')),
  })

  const deleteItemMutation = useMutation({
    mutationFn: (itemId: string) => api.deleteItem(listId ?? '', itemId),
    onSuccess: async () => {
      await invalidateListQuery()
      toast.success('Item deleted')
    },
    onError: (error) => toast.error(mutationErrorMessage(error, 'Failed to delete item')),
  })

  const setUnitMutation = useMutation({
    mutationFn: (unit: Unit) => api.setUnit(listId ?? '', unit),
    onSuccess: async () => {
      await invalidateListQuery()
    },
    onError: (error) => toast.error(mutationErrorMessage(error, 'Failed to update unit')),
  })

  const regenerateShareMutation = useMutation({
    mutationFn: () => api.regenerateShareToken(listId ?? ''),
    onSuccess: async () => {
      await invalidateListQuery()
      toast.success('Share token regenerated')
    },
    onError: (error) => toast.error(mutationErrorMessage(error, 'Failed to regenerate token')),
  })

  const shareUrl = useMemo(() => {
    if (!listQuery.data?.share_token) return ''
    return `${window.location.origin}/s/${listQuery.data.share_token}`
  }, [listQuery.data?.share_token])

  if (listQuery.isLoading) return <p>Loading...</p>
  if (listQuery.isError || !listQuery.data) return <p className="text-destructive">List not found.</p>

  const list = listQuery.data
  const summaryCards = [
    { title: 'Base', weight: list.summary.base_weight_g },
    { title: 'Consumable', weight: list.summary.consumable_weight_g },
    { title: 'Worn', weight: list.summary.worn_weight_g },
    { title: 'Total', weight: list.summary.total_pack_g },
  ] as const

  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader>
          <CardTitle>{list.title}</CardTitle>
          <p className="text-sm text-muted-foreground">{list.description || 'No description'}</p>
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
                <SelectValue placeholder="Unit" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="g">Gram</SelectItem>
                <SelectItem value="oz">Ounce</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button
            variant="outline"
            onClick={() => {
              if (!shareUrl) return
              navigator.clipboard.writeText(shareUrl).then(() => toast.success('Share URL copied'))
            }}
          >
            <CopyIcon className="mr-2 size-4" />
            Copy share URL
          </Button>
          <Button asChild variant="outline">
            <a href={shareUrl} target="_blank" rel="noreferrer">
              Open shared page
            </a>
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive">Regenerate token</Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Regenerate share token?</AlertDialogTitle>
                <AlertDialogDescription>
                  Old share URL will stop working immediately.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={() => void regenerateShareMutation.mutateAsync()}>
                  Regenerate
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
          <CardTitle>Add Item</CardTitle>
        </CardHeader>
        <CardContent>
          <ItemFormFields
            submitLabel="Add Item"
            isSubmitting={createItemMutation.isPending}
            onSubmit={async (values) => {
              await createItemMutation.mutateAsync(values)
            }}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Items</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Kind</TableHead>
                <TableHead>Weight</TableHead>
                <TableHead>Qty</TableHead>
                <TableHead className="w-[90px]">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {list.items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.name}</TableCell>
                  <TableCell>{item.category}</TableCell>
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
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={() => void deleteItemMutation.mutateAsync(item.id)}
                        >
                          <TrashIcon className="mr-2 size-4" />
                          Delete
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
            <DialogTitle>Edit item</DialogTitle>
            <DialogDescription>Update item fields and save changes.</DialogDescription>
          </DialogHeader>
          {editingItem ? (
            <ItemFormFields
              defaultValue={editingItem}
              submitLabel="Update Item"
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
