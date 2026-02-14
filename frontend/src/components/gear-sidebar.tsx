import { useQuery } from '@tanstack/react-query'
import { useDraggable } from '@dnd-kit/core'
import { GripVerticalIcon, PackageIcon } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { api } from '@/lib/api'
import { categoryLabel, formatWeight, kindLabel } from '@/lib/format'
import type { GearListItem, Unit } from '@/lib/types'
import { useState } from 'react'

function DraggableGearItem({ item, unit }: { item: GearListItem; unit: Unit }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `gear-${item.id}`,
    data: { gearItem: item },
  })

  const style = transform
    ? { transform: `translate(${transform.x}px, ${transform.y}px)` }
    : undefined

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center gap-2 rounded-md border bg-card p-2 text-sm ${
        isDragging ? 'opacity-50 shadow-lg' : 'hover:bg-accent/50'
      }`}
    >
      <button
        type="button"
        className="shrink-0 cursor-grab touch-none text-muted-foreground hover:text-foreground"
        {...listeners}
        {...attributes}
      >
        <GripVerticalIcon className="size-4" />
      </button>
      <div className="min-w-0 flex-1">
        <div className="truncate font-medium">{item.name}</div>
        <div className="flex flex-wrap items-center gap-1 text-xs text-muted-foreground">
          <Badge variant="outline" className="text-xs">
            {categoryLabel(item.category)}
          </Badge>
          <Badge variant="secondary" className="text-xs">
            {kindLabel(item.kind)}
          </Badge>
          <span>{formatWeight(item.weight_grams, unit)}</span>
        </div>
      </div>
    </div>
  )
}

type GearSidebarProps = {
  unit: Unit
  currentListId: string
}

export function GearSidebar({ unit, currentListId }: GearSidebarProps) {
  const [search, setSearch] = useState('')

  const gearQuery = useQuery({
    queryKey: ['gear-items'],
    queryFn: () => api.getGearItems(),
  })

  if (gearQuery.isLoading) return <p className="p-4 text-sm text-muted-foreground">読み込み中...</p>
  if (gearQuery.isError) return <p className="p-4 text-sm text-destructive">ギアの取得に失敗しました。</p>

  const allItems = gearQuery.data ?? []
  // Filter out items that belong to the current list
  const availableItems = allItems.filter((item) => item.list_id !== currentListId)

  const filteredItems = search.trim()
    ? availableItems.filter(
        (item) =>
          item.name.toLowerCase().includes(search.toLowerCase()) ||
          categoryLabel(item.category).includes(search)
      )
    : availableItems

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-2 border-b p-3">
        <PackageIcon className="size-4 shrink-0 text-muted-foreground" />
        <h3 className="text-sm font-semibold">マイギア</h3>
      </div>
      <div className="p-3">
        <Input
          placeholder="ギアを検索..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="h-8 text-sm"
        />
      </div>
      <div className="flex-1 space-y-1 overflow-y-auto px-3 pb-3">
        {filteredItems.length === 0 ? (
          <p className="py-4 text-center text-xs text-muted-foreground">
            {availableItems.length === 0 ? 'ギアが登録されていません' : '該当するギアがありません'}
          </p>
        ) : (
          filteredItems.map((item) => (
            <DraggableGearItem key={item.id} item={item} unit={unit} />
          ))
        )}
      </div>
    </div>
  )
}
