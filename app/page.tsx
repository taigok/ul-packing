'use client';

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getGears, saveGear, deleteGear, saveGearOrder, deleteManyGears } from '@/lib/storage';
import { Gear, GearCategory, CATEGORY_LABELS } from '@/lib/types';
import { GearTable } from '@/components/gear-table';
import { Toaster } from 'sonner';

export default function Page() {
  const [gears, setGears] = useState<Gear[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingGear, setEditingGear] = useState<Gear | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    category: 'other' as GearCategory,
    weight: '',
    description: '',
  });

  useEffect(() => {
    loadGears();
  }, []);

  const loadGears = () => {
    setGears(getGears());
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const gear: Gear = {
      id: editingGear?.id || Date.now().toString(),
      name: formData.name,
      category: formData.category,
      weight: Number(formData.weight),
      description: formData.description || undefined,
      createdAt: editingGear?.createdAt || new Date(),
    };

    saveGear(gear);
    loadGears();
    resetForm();
  };

  const handleEdit = (gear: Gear) => {
    setEditingGear(gear);
    setFormData({
      name: gear.name,
      category: gear.category,
      weight: gear.weight.toString(),
      description: gear.description || '',
    });
    setIsFormOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('本当に削除しますか？')) {
      deleteGear(id);
      loadGears();
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      category: 'other',
      weight: '',
      description: '',
    });
    setEditingGear(null);
    setIsFormOpen(false);
  };

  const groupedGears = gears.reduce((acc, gear) => {
    if (!acc[gear.category]) {
      acc[gear.category] = [];
    }
    acc[gear.category].push(gear);
    return acc;
  }, {} as Record<GearCategory, Gear[]>);

  const totalWeight = gears.reduce((sum, gear) => sum + gear.weight, 0);

  const handleReorder = (newGears: Gear[]) => {
    setGears(newGears);
    saveGearOrder(newGears);
  };

  const handleUpdate = (updatedGear: Gear) => {
    saveGear(updatedGear);
    loadGears();
  };

  const handleDeleteMany = (ids: string[]) => {
    deleteManyGears(ids);
    loadGears();
  };

  return (
    <>
      <Toaster />
      <div className="mx-auto max-w-6xl">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="mb-2 text-3xl font-bold text-slate-900">ギア管理</h1>
            <p className="text-slate-600">
              {gears.length}個のギア（合計 {totalWeight}g）
            </p>
          </div>
          <Button onClick={() => setIsFormOpen(!isFormOpen)}>
            {isFormOpen ? 'キャンセル' : '+ 新しいギアを追加'}
          </Button>
        </div>

        {isFormOpen && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>{editingGear ? 'ギアを編集' : '新しいギアを追加'}</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div>
                    <Label htmlFor="name">名前 *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                      placeholder="テント、シュラフなど"
                    />
                  </div>
                  <div>
                    <Label htmlFor="category">カテゴリー *</Label>
                    <Select
                      value={formData.category}
                      onValueChange={(value) => setFormData({ ...formData, category: value as GearCategory })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
                          <SelectItem key={key} value={key}>
                            {label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="weight">重量（グラム） *</Label>
                    <Input
                      id="weight"
                      type="number"
                      value={formData.weight}
                      onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                      required
                      placeholder="500"
                      min="0"
                    />
                  </div>
                  <div>
                    <Label htmlFor="description">説明（任意）</Label>
                    <Input
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="モンベル ステラリッジ2"
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button type="submit">
                    {editingGear ? '更新' : '追加'}
                  </Button>
                  <Button type="button" variant="outline" onClick={resetForm}>
                    キャンセル
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {gears.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="mb-4 text-slate-600">まだギアが登録されていません</p>
              <Button onClick={() => setIsFormOpen(true)}>
                最初のギアを追加
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="p-0">
              <GearTable
                data={gears}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onDeleteMany={handleDeleteMany}
                onReorder={handleReorder}
                onUpdate={handleUpdate}
              />
            </CardContent>
          </Card>
        )}
      </div>
    </>
  );
}
