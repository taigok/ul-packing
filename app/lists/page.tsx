'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getPackingLists, savePackingList, deletePackingList, getGears } from '@/lib/storage';
import { PackingList } from '@/lib/types';

export default function ListsPage() {
  const [lists, setLists] = useState<PackingList[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    destination: '',
  });

  useEffect(() => {
    loadLists();
  }, []);

  const loadLists = () => {
    setLists(getPackingLists());
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const list: PackingList = {
      id: Date.now().toString(),
      name: formData.name,
      description: formData.description || undefined,
      destination: formData.destination || undefined,
      items: [],
      createdAt: new Date(),
    };

    savePackingList(list);
    loadLists();
    resetForm();
  };

  const handleDelete = (id: string) => {
    if (confirm('本当に削除しますか？')) {
      deletePackingList(id);
      loadLists();
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      destination: '',
    });
    setIsFormOpen(false);
  };

  const getListStats = (list: PackingList) => {
    const gears = getGears();
    const totalItems = list.items.reduce((sum, item) => sum + item.quantity, 0);
    const packedItems = list.items.filter(item => item.packed).reduce((sum, item) => sum + item.quantity, 0);
    const totalWeight = list.items.reduce((sum, item) => {
      const gear = gears.find(g => g.id === item.gearId);
      return sum + (gear?.weight || 0) * item.quantity;
    }, 0);

    return { totalItems, packedItems, totalWeight };
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">パッキングリスト</h1>
          <p className="text-slate-600">{lists.length}個のリスト</p>
        </div>
        <Button onClick={() => setIsFormOpen(!isFormOpen)}>
          {isFormOpen ? 'キャンセル' : '+ 新しいリストを作成'}
        </Button>
      </div>

      {isFormOpen && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>新しいリストを作成</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">リスト名 *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  placeholder="富士山 1泊2日"
                />
              </div>
              <div>
                <Label htmlFor="destination">目的地（任意）</Label>
                <Input
                  id="destination"
                  value={formData.destination}
                  onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
                  placeholder="富士山"
                />
              </div>
              <div>
                <Label htmlFor="description">説明（任意）</Label>
                <Input
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="夏季・テント泊"
                />
              </div>
              <div className="flex gap-2">
                <Button type="submit">作成</Button>
                <Button type="button" variant="outline" onClick={resetForm}>
                  キャンセル
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {lists.map((list) => {
          const stats = getListStats(list);
          return (
            <Card key={list.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="text-lg">{list.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm text-slate-600">
                  {list.destination && (
                    <div>📍 {list.destination}</div>
                  )}
                  {list.description && (
                    <div>{list.description}</div>
                  )}
                  <div className="pt-2 space-y-1">
                    <div>アイテム数: {stats.totalItems}個</div>
                    <div>パック済み: {stats.packedItems}/{stats.totalItems}</div>
                    <div>総重量: {stats.totalWeight}g</div>
                  </div>
                </div>
                <div className="flex gap-2 mt-4">
                  <Link href={`/lists/${list.id}`} className="flex-1">
                    <Button className="w-full" size="sm">詳細</Button>
                  </Link>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDelete(list.id)}
                  >
                    削除
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {lists.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-slate-600 mb-4">まだリストが作成されていません</p>
            <Button onClick={() => setIsFormOpen(true)}>
              最初のリストを作成
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
