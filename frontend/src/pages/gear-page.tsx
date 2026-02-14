import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { categoryLabel, kindLabel } from '@/lib/format'
import { api } from '@/lib/api'

export function GearPage() {
  const gearItemsQuery = useQuery({ queryKey: ['gear-items'], queryFn: api.getGearItems })

  return (
    <Card>
      <CardHeader>
        <CardTitle>マイギア</CardTitle>
      </CardHeader>
      <CardContent>
        {gearItemsQuery.isLoading ? <p>読み込み中...</p> : null}
        {gearItemsQuery.isError ? (
          <p className="text-destructive">ギア一覧の読み込みに失敗しました。</p>
        ) : null}
        {gearItemsQuery.data?.length === 0 ? <p>まだギアがありません。</p> : null}
        {gearItemsQuery.data && gearItemsQuery.data.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>名前</TableHead>
                <TableHead>カテゴリ</TableHead>
                <TableHead>種別</TableHead>
                <TableHead>重量</TableHead>
                <TableHead>個数</TableHead>
                <TableHead>リスト</TableHead>
                <TableHead className="w-[140px]">操作</TableHead>
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
                  <TableCell>{item.list_title}</TableCell>
                  <TableCell>
                    <Button asChild variant="outline" size="sm">
                      <Link to={`/lists/${item.list_id}`}>リストを開く</Link>
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
