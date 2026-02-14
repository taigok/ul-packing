import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'

import { ListCreateForm } from '@/components/list-create-form'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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

  const listQuery = useQuery({ queryKey: ['lists'], queryFn: api.getLists })
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
