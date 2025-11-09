/**
 * 開発用サンプルデータ投入スクリプト
 *
 * 使用方法:
 * npx tsx script/sampleData.ts
 *
 * このスクリプトは開発環境でのUI確認用にサンプルギアデータをlocalStorageに投入します。
 */

import { Gear, GearCategory } from '../lib/types';

// サンプルギアデータ
const sampleGears: Gear[] = [
  // テント・シェルター
  {
    id: 'sample-tent-1',
    name: 'サンプル テント A',
    category: 'tent' as GearCategory,
    weight: 800,
    description: '1人用軽量テント',
    createdAt: new Date('2024-01-15'),
  },
  {
    id: 'sample-tent-2',
    name: 'サンプル タープ B',
    category: 'tent' as GearCategory,
    weight: 300,
    description: 'ULタープシェルター',
    createdAt: new Date('2024-01-16'),
  },

  // 寝具
  {
    id: 'sample-sleeping-1',
    name: 'サンプル 寝袋 A',
    category: 'sleeping' as GearCategory,
    weight: 600,
    description: '3シーズン用ダウン寝袋',
    createdAt: new Date('2024-01-17'),
  },
  {
    id: 'sample-sleeping-2',
    name: 'サンプル スリーピングマット B',
    category: 'sleeping' as GearCategory,
    weight: 350,
    description: 'エアマット',
    createdAt: new Date('2024-01-18'),
  },

  // バックパック
  {
    id: 'sample-backpack-1',
    name: 'サンプル バックパック A',
    category: 'backpack' as GearCategory,
    weight: 450,
    description: '30L ULバックパック',
    createdAt: new Date('2024-01-19'),
  },

  // ウェア
  {
    id: 'sample-clothing-1',
    name: 'サンプル レインジャケット A',
    category: 'clothing' as GearCategory,
    weight: 200,
    description: '防水透湿ジャケット',
    createdAt: new Date('2024-01-20'),
  },
  {
    id: 'sample-clothing-2',
    name: 'サンプル ダウンジャケット B',
    category: 'clothing' as GearCategory,
    weight: 250,
    description: '保温着',
    createdAt: new Date('2024-01-21'),
  },

  // 調理器具
  {
    id: 'sample-cooking-1',
    name: 'サンプル クッカー A',
    category: 'cooking' as GearCategory,
    weight: 150,
    description: 'チタン製クッカー',
    createdAt: new Date('2024-01-22'),
  },
  {
    id: 'sample-cooking-2',
    name: 'サンプル バーナー B',
    category: 'cooking' as GearCategory,
    weight: 80,
    description: 'ガスバーナー',
    createdAt: new Date('2024-01-23'),
  },

  // 食料
  {
    id: 'sample-food-1',
    name: 'サンプル 行動食 A',
    category: 'food' as GearCategory,
    weight: 500,
    description: 'ナッツ・ドライフルーツ',
    createdAt: new Date('2024-01-24'),
  },

  // 水分
  {
    id: 'sample-water-1',
    name: 'サンプル ウォーターボトル A',
    category: 'water' as GearCategory,
    weight: 50,
    description: '500ml ソフトボトル',
    createdAt: new Date('2024-01-25'),
  },

  // 電子機器
  {
    id: 'sample-electronics-1',
    name: 'サンプル ヘッドランプ A',
    category: 'electronics' as GearCategory,
    weight: 60,
    description: 'LED ヘッドランプ',
    createdAt: new Date('2024-01-26'),
  },
  {
    id: 'sample-electronics-2',
    name: 'サンプル モバイルバッテリー B',
    category: 'electronics' as GearCategory,
    weight: 120,
    description: '10000mAh バッテリー',
    createdAt: new Date('2024-01-27'),
  },

  // その他
  {
    id: 'sample-other-1',
    name: 'サンプル ファーストエイドキット',
    category: 'other' as GearCategory,
    weight: 100,
    description: '救急セット',
    createdAt: new Date('2024-01-28'),
  },
  {
    id: 'sample-other-2',
    name: 'サンプル マップケース',
    category: 'other' as GearCategory,
    weight: 30,
    description: '防水マップケース',
    createdAt: new Date('2024-01-29'),
  },
];

// ブラウザ環境で実行する場合
if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
  console.log('サンプルデータをlocalStorageに投入します...');
  localStorage.setItem('ul-packing-gears', JSON.stringify(sampleGears));
  console.log(`${sampleGears.length}件のサンプルギアを追加しました。`);
  console.log('ページをリロードしてください。');
} else {
  // Node.js環境では実行できないことを通知
  console.log('このスクリプトはブラウザのコンソールで実行してください。');
  console.log('\n以下のコードをブラウザのコンソールにコピー&ペーストしてください:\n');
  console.log(`localStorage.setItem('ul-packing-gears', '${JSON.stringify(sampleGears)}'); location.reload();`);
}

export { sampleGears };
