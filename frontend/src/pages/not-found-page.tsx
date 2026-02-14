import { Link } from 'react-router-dom'

import { Button } from '@/components/ui/button'

export function NotFoundPage() {
  return (
    <div className="grid gap-4 py-20 text-center">
      <h1 className="text-3xl font-semibold">ページが見つかりません</h1>
      <p className="text-muted-foreground">指定したページは存在しません。</p>
      <div>
        <Button asChild>
          <Link to="/">リストへ戻る</Link>
        </Button>
      </div>
    </div>
  )
}
