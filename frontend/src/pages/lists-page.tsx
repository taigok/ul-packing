import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'

import { ItemFormFields, type ItemFormValue } from '@/components/item-form-fields'
import { ListCreateForm } from '@/components/list-create-form'
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
import { kindLabel } from '@/lib/format'

export function ListsPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [isAddGearOpen, setIsAddGearOpen] = useState(false)

  const gearItemsQuery = useQuery({ queryKey: ['gear-items'], queryFn: api.getGearItems })
  const listQuery = useQuery({ queryKey: ['lists'], queryFn: api.getLists })
  const createGearItemMutation = useMutation({
    mutationFn: (payload: ItemFormValue) => api.createGearItem(payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['gear-items'] })
      await queryClient.invalidateQueries({ queryKey: ['lists'] })
      setIsAddGearOpen(false)
      toast.success('Gear item added')
    },
    onError: (error) => {
      const message = error instanceof ApiError ? error.message : 'Failed to add gear item'
      toast.error(message)
    },
  })
  const createListMutation = useMutation({
    mutationFn: api.createList,
    onSuccess: async (list) => {
      await queryClient.invalidateQueries({ queryKey: ['lists'] })
      navigate(`/lists/${list.id}`)
    },
    onError: (error) => {
      const message = error instanceof ApiError ? error.message : 'Failed to create list'
      toast.error(message)
    },
  })

  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-3">
          <CardTitle>My Gear</CardTitle>
          <Dialog open={isAddGearOpen} onOpenChange={setIsAddGearOpen}>
            <DialogTrigger asChild>
              <Button>Add Gear</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Gear Item</DialogTitle>
                <DialogDescription>
                  You can register gear without creating a trip list first.
                </DialogDescription>
              </DialogHeader>
              <ItemFormFields
                submitLabel="Add Gear"
                isSubmitting={createGearItemMutation.isPending}
                onSubmit={async (values) => {
                  await createGearItemMutation.mutateAsync(values)
                }}
              />
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          {gearItemsQuery.isLoading ? <p>Loading...</p> : null}
          {gearItemsQuery.isError ? (
            <p className="text-destructive">Failed to load gear items.</p>
          ) : null}
          {gearItemsQuery.data?.length === 0 ? (
            <p className="text-muted-foreground">
              No gear items yet. Use "Add Gear" to register your first item.
            </p>
          ) : null}
          {gearItemsQuery.data && gearItemsQuery.data.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Kind</TableHead>
                  <TableHead>Weight</TableHead>
                  <TableHead>Qty</TableHead>
                  <TableHead>List</TableHead>
                  <TableHead className="w-[140px]">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {gearItemsQuery.data.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.name}</TableCell>
                    <TableCell className="capitalize">{item.category}</TableCell>
                    <TableCell>{kindLabel(item.kind)}</TableCell>
                    <TableCell>{item.weight_grams * item.quantity} g</TableCell>
                    <TableCell>{item.quantity}</TableCell>
                    <TableCell>{item.list_title}</TableCell>
                    <TableCell>
                      <Button asChild variant="outline" size="sm">
                        <Link to={`/lists/${item.list_id}`}>Open List</Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : null}
        </CardContent>
      </Card>

      <ListCreateForm
        isSubmitting={createListMutation.isPending}
        onSubmit={async (values) => {
          await createListMutation.mutateAsync(values)
        }}
      />

      <Card>
        <CardHeader>
          <CardTitle>Packing Lists</CardTitle>
        </CardHeader>
        <CardContent>
          {listQuery.isLoading ? <p>Loading...</p> : null}
          {listQuery.isError ? <p className="text-destructive">Failed to load lists.</p> : null}
          {listQuery.data ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead className="w-[160px]">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {listQuery.data.map((list) => (
                  <TableRow key={list.id}>
                    <TableCell className="font-medium">{list.title}</TableCell>
                    <TableCell>{list.description || '-'}</TableCell>
                    <TableCell>
                      <Button asChild variant="outline" size="sm">
                        <Link to={`/lists/${list.id}`}>Open</Link>
                      </Button>
                    </TableCell>
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
