import { useQuery } from '@tanstack/react-query'
import { useParams } from 'react-router-dom'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { api } from '@/lib/api'
import { formatWeight, kindLabel } from '@/lib/format'

export function SharedPage() {
  const { token } = useParams<{ token: string }>()

  const sharedQuery = useQuery({
    queryKey: ['shared', token],
    queryFn: () => api.getShared(token ?? ''),
    enabled: Boolean(token),
  })

  if (sharedQuery.isLoading) return <p>Loading...</p>
  if (sharedQuery.isError || !sharedQuery.data) return <p className="text-destructive">Shared list not found.</p>

  const list = sharedQuery.data

  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader>
          <CardTitle>{list.title}</CardTitle>
          <p className="text-sm text-muted-foreground">{list.description || 'No description'}</p>
        </CardHeader>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Base</CardTitle>
          </CardHeader>
          <CardContent>{formatWeight(list.summary.base_weight_g, list.unit)}</CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Consumable</CardTitle>
          </CardHeader>
          <CardContent>{formatWeight(list.summary.consumable_weight_g, list.unit)}</CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Worn</CardTitle>
          </CardHeader>
          <CardContent>{formatWeight(list.summary.worn_weight_g, list.unit)}</CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Total</CardTitle>
          </CardHeader>
          <CardContent>{formatWeight(list.summary.total_pack_g, list.unit)}</CardContent>
        </Card>
      </div>

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
              </TableRow>
            </TableHeader>
            <TableBody>
              {list.items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.name}</TableCell>
                  <TableCell>{item.category}</TableCell>
                  <TableCell>{kindLabel(item.kind)}</TableCell>
                  <TableCell>{formatWeight(item.weight_grams * item.quantity, list.unit)}</TableCell>
                  <TableCell>{item.quantity}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
