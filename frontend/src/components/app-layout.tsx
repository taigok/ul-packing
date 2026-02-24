import { Link, Outlet, useLocation } from 'react-router-dom'

import { Badge } from '@/components/ui/badge'

export function AppLayout() {
  const { pathname } = useLocation()

  return (
    <div className="min-h-screen bg-muted/30">
      <header className="border-b bg-background">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <nav aria-label="メインナビゲーション" className="flex items-center gap-4">
            <Link to="/lists" className="text-lg font-semibold tracking-tight">
              UL Packing
            </Link>
            <Link
              to="/lists"
              className="text-sm text-muted-foreground hover:text-foreground"
              aria-current={pathname.startsWith('/lists') ? 'page' : undefined}
            >
              パッキングリスト
            </Link>
            <Link
              to="/gear"
              className="text-sm text-muted-foreground hover:text-foreground"
              aria-current={pathname === '/gear' ? 'page' : undefined}
            >
              マイギア
            </Link>
          </nav>
          <Badge variant="secondary">MVP</Badge>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-6">
        <Outlet />
      </main>
    </div>
  )
}
