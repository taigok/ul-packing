'use client';

import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { useEffect, useState } from 'react';
import { getGears, getPackingLists } from '@/lib/storage';

export default function Page() {
  const [gearCount, setGearCount] = useState(0);
  const [listCount, setListCount] = useState(0);

  useEffect(() => {
    setGearCount(getGears().length);
    setListCount(getPackingLists().length);
  }, []);

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-slate-900 mb-2">
          UL Packing
        </h1>
        <p className="text-lg text-slate-600">
          装備を管理し、最適なパッキングリストを作成しましょう
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>ギア管理</CardTitle>
            <CardDescription>
              {gearCount}個の装備を登録中
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-slate-600 mb-4">
              あなたの装備を登録・管理して、パッキングリスト作成に活用しましょう
            </p>
            <Link href="/gears">
              <Button className="w-full">ギアを管理</Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>パッキングリスト</CardTitle>
            <CardDescription>
              {listCount}個のリストを作成中
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-slate-600 mb-4">
              旅行やアクティビティごとにパッキングリストを作成しましょう
            </p>
            <Link href="/lists">
              <Button className="w-full">リストを作成</Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>使い方</CardTitle>
        </CardHeader>
        <CardContent>
          <ol className="list-decimal list-inside space-y-2 text-sm text-slate-700">
            <li>「ギア管理」で手持ちの装備を登録</li>
            <li>「パッキングリスト」で旅行やアクティビティ用のリストを作成</li>
            <li>登録したギアをリストに追加して、重量を確認</li>
            <li>チェックリストとして活用して、忘れ物を防止</li>
          </ol>
        </CardContent>
      </Card>
    </div>
  );
}