import { useQuery } from '@tanstack/react-query'
import { useParams } from 'react-router-dom'

import { Badge } from '@/components/ui/badge'
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
import { categoryLabel, formatWeight, kindLabel } from '@/lib/format'

export function SharedPage() {
  const { token } = useParams<{ token: string }>()

  const sharedQuery = useQuery({
    queryKey: ['shared', token],
    queryFn: () => api.getShared(token ?? ''),
    enabled: Boolean(token),
  })

  if (sharedQuery.isLoading) return <p>読み込み中...</p>
  if (sharedQuery.isError || !sharedQuery.data) return <p className="text-destructive">共有リストが見つかりません。</p>

  const list = sharedQuery.data

  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader>
          <CardTitle>{list.title}</CardTitle>
          <p className="text-sm text-muted-foreground">{list.description || '説明なし'}</p>
        </CardHeader>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">ベース</CardTitle>
          </CardHeader>
          <CardContent>{formatWeight(list.summary.base_weight_g, list.unit)}</CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">消耗品</CardTitle>
          </CardHeader>
          <CardContent>{formatWeight(list.summary.consumable_weight_g, list.unit)}</CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">着用</CardTitle>
          </CardHeader>
          <CardContent>{formatWeight(list.summary.worn_weight_g, list.unit)}</CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">合計</CardTitle>
          </CardHeader>
          <CardContent>{formatWeight(list.summary.total_pack_g, list.unit)}</CardContent>
        </Card>
      </div>

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
              </TableRow>
            </TableHeader>
            <TableBody>
              {list.items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.name}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{categoryLabel(item.category)}</Badge>
                  </TableCell>
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
