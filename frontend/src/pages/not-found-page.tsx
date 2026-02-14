import { Link } from 'react-router-dom'

import { Button } from '@/components/ui/button'

export function NotFoundPage() {
  return (
    <div className="grid gap-4 py-20 text-center">
      <h1 className="text-3xl font-semibold">Page not found</h1>
      <p className="text-muted-foreground">The page does not exist.</p>
      <div>
        <Button asChild>
          <Link to="/">Back to lists</Link>
        </Button>
      </div>
    </div>
  )
}
