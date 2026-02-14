import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'

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
import { kindLabel } from '@/lib/format'
import { api } from '@/lib/api'

export function GearPage() {
  const gearItemsQuery = useQuery({ queryKey: ['gear-items'], queryFn: api.getGearItems })

  return (
    <Card>
      <CardHeader>
        <CardTitle>My Gear</CardTitle>
      </CardHeader>
      <CardContent>
        {gearItemsQuery.isLoading ? <p>Loading...</p> : null}
        {gearItemsQuery.isError ? (
          <p className="text-destructive">Failed to load gear items.</p>
        ) : null}
        {gearItemsQuery.data?.length === 0 ? <p>No gear items yet.</p> : null}
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
  )
}
