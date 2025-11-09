'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getPackingList, savePackingList, getGears } from '@/lib/storage';
import { PackingList, PackingListItem, Gear, CATEGORY_LABELS } from '@/lib/types';

export default function ListDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [list, setList] = useState<PackingList | null>(null);
  const [gears, setGears] = useState<Gear[]>([]);
  const [isAddingItem, setIsAddingItem] = useState(false);
  const [selectedGearId, setSelectedGearId] = useState<string>('');
  const [quantity, setQuantity] = useState('1');

  useEffect(() => {
    const id = params.id as string;
    const loadedList = getPackingList(id);
    if (!loadedList) {
      router.push('/lists');
      return;
    }
    setList(loadedList);
    setGears(getGears());
  }, [params.id, router]);

  if (!list) {
    return <div>Loading...</div>;
  }

  const handleAddItem = () => {
    if (!selectedGearId) return;

    const newItem: PackingListItem = {
      id: Date.now().toString(),
      gearId: selectedGearId,
      quantity: Number(quantity),
      packed: false,
    };

    const updatedList = {
      ...list,
      items: [...list.items, newItem],
    };

    savePackingList(updatedList);
    setList(updatedList);
    setSelectedGearId('');
    setQuantity('1');
    setIsAddingItem(false);
  };

  const handleTogglePacked = (itemId: string) => {
    const updatedList = {
      ...list,
      items: list.items.map(item =>
        item.id === itemId ? { ...item, packed: !item.packed } : item
      ),
    };
    savePackingList(updatedList);
    setList(updatedList);
  };

  const handleUpdateQuantity = (itemId: string, newQuantity: number) => {
    if (newQuantity < 1) return;

    const updatedList = {
      ...list,
      items: list.items.map(item =>
        item.id === itemId ? { ...item, quantity: newQuantity } : item
      ),
    };
    savePackingList(updatedList);
    setList(updatedList);
  };

  const handleRemoveItem = (itemId: string) => {
    const updatedList = {
      ...list,
      items: list.items.filter(item => item.id !== itemId),
    };
    savePackingList(updatedList);
    setList(updatedList);
  };

  const getGearById = (gearId: string) => {
    return gears.find(g => g.id === gearId);
  };

  const totalWeight = list.items.reduce((sum, item) => {
    const gear = getGearById(item.gearId);
    return sum + (gear?.weight || 0) * item.quantity;
  }, 0);

  const totalItems = list.items.reduce((sum, item) => sum + item.quantity, 0);
  const packedItems = list.items.filter(item => item.packed).reduce((sum, item) => sum + item.quantity, 0);

  const availableGears = gears.filter(gear =>
    !list.items.some(item => item.gearId === gear.id)
  );

  const groupedItems = list.items.reduce((acc, item) => {
    const gear = getGearById(item.gearId);
    if (!gear) return acc;

    const category = gear.category;
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push({ item, gear });
    return acc;
  }, {} as Record<string, Array<{ item: PackingListItem; gear: Gear }>>);

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <Link href="/lists" className="text-sm text-slate-600 hover:text-slate-900 mb-2 inline-block">
          ← リスト一覧に戻る
        </Link>
        <h1 className="text-3xl font-bold text-slate-900 mb-2">{list.name}</h1>
        {list.destination && (
          <p className="text-slate-600">📍 {list.destination}</p>
        )}
        {list.description && (
          <p className="text-slate-600">{list.description}</p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-slate-900">{totalItems}</div>
            <div className="text-sm text-slate-600">総アイテム数</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-slate-900">
              {packedItems}/{totalItems}
            </div>
            <div className="text-sm text-slate-600">パック済み</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-slate-900">{totalWeight}g</div>
            <div className="text-sm text-slate-600">総重量</div>
          </CardContent>
        </Card>
      </div>

      <div className="mb-6">
        <Button onClick={() => setIsAddingItem(!isAddingItem)}>
          {isAddingItem ? 'キャンセル' : '+ アイテムを追加'}
        </Button>
      </div>

      {isAddingItem && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>アイテムを追加</CardTitle>
          </CardHeader>
          <CardContent>
            {availableGears.length === 0 ? (
              <div className="text-center py-4">
                <p className="text-slate-600 mb-4">
                  追加できるギアがありません。
                  {gears.length === 0 ? 'まずギアを登録してください。' : '全てのギアが既に追加されています。'}
                </p>
                {gears.length === 0 && (
                  <Link href="/gears">
                    <Button>ギアを登録</Button>
                  </Link>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <Label>ギア</Label>
                  <Select value={selectedGearId} onValueChange={setSelectedGearId}>
                    <SelectTrigger>
                      <SelectValue placeholder="ギアを選択" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableGears.map(gear => (
                        <SelectItem key={gear.id} value={gear.id}>
                          {gear.name} ({gear.weight}g) - {CATEGORY_LABELS[gear.category]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>数量</Label>
                  <Input
                    type="number"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    min="1"
                  />
                </div>
                <Button onClick={handleAddItem} disabled={!selectedGearId}>
                  追加
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <div className="space-y-6">
        {Object.entries(CATEGORY_LABELS).map(([category, label]) => {
          const items = groupedItems[category] || [];
          if (items.length === 0) return null;

          const categoryWeight = items.reduce((sum, { item, gear }) => {
            return sum + gear.weight * item.quantity;
          }, 0);

          return (
            <Card key={category}>
              <CardHeader>
                <CardTitle className="text-xl">
                  {label} ({items.length}個 / {categoryWeight}g)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {items.map(({ item, gear }) => (
                    <div
                      key={item.id}
                      className="flex items-center gap-4 p-4 bg-slate-50 rounded-lg"
                    >
                      <Checkbox
                        checked={item.packed}
                        onCheckedChange={() => handleTogglePacked(item.id)}
                      />
                      <div className="flex-1">
                        <div className={`font-medium ${item.packed ? 'line-through text-slate-500' : 'text-slate-900'}`}>
                          {gear.name}
                        </div>
                        {gear.description && (
                          <div className="text-sm text-slate-600">{gear.description}</div>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                          disabled={item.quantity <= 1}
                        >
                          -
                        </Button>
                        <span className="text-sm font-medium w-8 text-center">
                          {item.quantity}
                        </span>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                        >
                          +
                        </Button>
                      </div>
                      <div className="text-sm font-medium text-slate-700 w-16 text-right">
                        {gear.weight * item.quantity}g
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleRemoveItem(item.id)}
                      >
                        削除
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          );
        })}

        {list.items.length === 0 && (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-slate-600 mb-4">まだアイテムが追加されていません</p>
              <Button onClick={() => setIsAddingItem(true)}>
                最初のアイテムを追加
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
