# UL Packing

ウルトラライト（UL）ハイキング用のギア管理・パッキングリストアプリ

## 開発環境のセットアップ

```bash
pnpm install
pnpm dev
```

ブラウザで [http://localhost:3000](http://localhost:3000) を開く

## サンプルデータの追加

開発時の動作確認用に、ブラウザコンソール（F12 → Console）で以下を実行：

```javascript
localStorage.setItem('ul-packing-gears', JSON.stringify([{"id":"sample-tent-1","name":"サンプル テント A","category":"tent","weight":800,"description":"1人用軽量テント","createdAt":"2024-01-15T00:00:00.000Z"},{"id":"sample-tent-2","name":"サンプル タープ B","category":"tent","weight":300,"description":"ULタープシェルター","createdAt":"2024-01-16T00:00:00.000Z"},{"id":"sample-sleeping-1","name":"サンプル 寝袋 A","category":"sleeping","weight":600,"description":"3シーズン用ダウン寝袋","createdAt":"2024-01-17T00:00:00.000Z"},{"id":"sample-sleeping-2","name":"サンプル スリーピングマット B","category":"sleeping","weight":350,"description":"エアマット","createdAt":"2024-01-18T00:00:00.000Z"},{"id":"sample-backpack-1","name":"サンプル バックパック A","category":"backpack","weight":450,"description":"30L ULバックパック","createdAt":"2024-01-19T00:00:00.000Z"},{"id":"sample-clothing-1","name":"サンプル レインジャケット A","category":"clothing","weight":200,"description":"防水透湿ジャケット","createdAt":"2024-01-20T00:00:00.000Z"},{"id":"sample-clothing-2","name":"サンプル ダウンジャケット B","category":"clothing","weight":250,"description":"保温着","createdAt":"2024-01-21T00:00:00.000Z"},{"id":"sample-cooking-1","name":"サンプル クッカー A","category":"cooking","weight":150,"description":"チタン製クッカー","createdAt":"2024-01-22T00:00:00.000Z"},{"id":"sample-cooking-2","name":"サンプル バーナー B","category":"cooking","weight":80,"description":"ガスバーナー","createdAt":"2024-01-23T00:00:00.000Z"},{"id":"sample-food-1","name":"サンプル 行動食 A","category":"food","weight":500,"description":"ナッツ・ドライフルーツ","createdAt":"2024-01-24T00:00:00.000Z"},{"id":"sample-water-1","name":"サンプル ウォーターボトル A","category":"water","weight":50,"description":"500ml ソフトボトル","createdAt":"2024-01-25T00:00:00.000Z"},{"id":"sample-electronics-1","name":"サンプル ヘッドランプ A","category":"electronics","weight":60,"description":"LED ヘッドランプ","createdAt":"2024-01-26T00:00:00.000Z"},{"id":"sample-electronics-2","name":"サンプル モバイルバッテリー B","category":"electronics","weight":120,"description":"10000mAh バッテリー","createdAt":"2024-01-27T00:00:00.000Z"},{"id":"sample-other-1","name":"サンプル ファーストエイドキット","category":"other","weight":100,"description":"救急セット","createdAt":"2024-01-28T00:00:00.000Z"},{"id":"sample-other-2","name":"サンプル マップケース","category":"other","weight":30,"description":"防水マップケース","createdAt":"2024-01-29T00:00:00.000Z"}]));
location.reload();
```

クリア：
```javascript
localStorage.removeItem('ul-packing-gears');
location.reload();
```

## 技術スタック

- Next.js 14
- React 18
- TypeScript
- Tailwind CSS
- localStorage (データ永続化)
