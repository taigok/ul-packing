import { Navigate, Route, Routes } from 'react-router-dom'

import { AppLayout } from '@/components/app-layout'
import { GearPage } from '@/pages/gear-page'
import { ListDetailPage } from '@/pages/list-detail-page'
import { ListsPage } from '@/pages/lists-page'
import { NotFoundPage } from '@/pages/not-found-page'
import { SharedPage } from '@/pages/shared-page'

export default function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route path="/" element={<ListsPage />} />
        <Route path="/gear" element={<GearPage />} />
        <Route path="/lists/:listId" element={<ListDetailPage />} />
        <Route path="/s/:token" element={<SharedPage />} />
        <Route path="/404" element={<NotFoundPage />} />
        <Route path="*" element={<Navigate to="/404" replace />} />
      </Route>
    </Routes>
  )
}
