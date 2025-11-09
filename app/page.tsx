'use client';

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getGears, saveGear, deleteGear } from '@/lib/storage';
import { Gear, GearCategory, CATEGORY_LABELS } from '@/lib/types';

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

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">ギア管理</h1>
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

      <div className="space-y-6">
        {Object.entries(CATEGORY_LABELS).map(([category, label]) => {
          const categoryGears = groupedGears[category as GearCategory] || [];
          if (categoryGears.length === 0) return null;

          const categoryWeight = categoryGears.reduce((sum, gear) => sum + gear.weight, 0);

          return (
            <Card key={category}>
              <CardHeader>
                <CardTitle className="text-xl">
                  {label} ({categoryGears.length}個 / {categoryWeight}g)
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-slate-50 border-b">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-700 uppercase">名前</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-700 uppercase">説明</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-slate-700 uppercase">重量</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-slate-700 uppercase">操作</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {categoryGears.map((gear) => (
                        <tr key={gear.id} className="hover:bg-slate-50">
                          <td className="px-6 py-3 text-sm font-medium text-slate-900">
                            {gear.name}
                          </td>
                          <td className="px-6 py-3 text-sm text-slate-600">
                            {gear.description || '-'}
                          </td>
                          <td className="px-6 py-3 text-sm text-slate-700 text-right">
                            {gear.weight}g
                          </td>
                          <td className="px-6 py-3 text-right">
                            <div className="flex gap-2 justify-end">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleEdit(gear)}
                              >
                                編集
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleDelete(gear.id)}
                              >
                                削除
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          );
        })}

        {gears.length === 0 && (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-slate-600 mb-4">まだギアが登録されていません</p>
              <Button onClick={() => setIsFormOpen(true)}>
                最初のギアを追加
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
