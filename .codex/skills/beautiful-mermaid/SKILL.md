---
name: beautiful-mermaid
description: Beautiful Mermaid ライブラリを使って Mermaid 図を SVG と PNG にレンダリングします。Mermaid 図の描画依頼時に使います。
---

# Beautiful Mermaid 図のレンダリング

Beautiful Mermaid ライブラリを使って Mermaid 図を SVG と PNG で出力します。

## 依存関係

この skill は Node.js（npm / npx）と Playwright CLI を使います。
`beautiful-mermaid` パッケージは自動的に `~/.cache/beautiful-mermaid-skill` にインストールされるため、実行時にリポジトリ直下へ `package.json` や `package-lock.json` を作りません。

## 対応している図の種類

- Flowchart - プロセスフロー、意思決定ツリー、CI/CD パイプライン
- Sequence - API 呼び出し、OAuth フロー、データベーストランザクション
- State - 状態遷移、接続ライフサイクル
- Class - UML クラス図、デザインパターン
- Entity-Relationship - データベーススキーマ、データモデル

## 利用可能なテーマ

Default, Dracula, Solarized, Zinc Dark, Tokyo Night, Tokyo Night Storm, Tokyo Night Light, Catppuccin Latte, Nord, Nord Light, GitHub Dark, GitHub Light, One Dark.

テーマ指定がない場合は `default` を使います。

## よく使う構文パターン

### Flowchart のエッジラベル

エッジラベルはパイプ構文を使います。

```mermaid
A -->|label| B
A ---|label| B
```

次のようなスペース付きダッシュ構文は描画不良を起こすことがあります。

```mermaid
A -- label --> B   # 描画が崩れることがある
```

### 特殊文字を含むノードラベル

特殊文字を含むラベルは引用符で囲みます。

```mermaid
A["Label with (parens)"]
B["Label with / slash"]
```

## ワークフロー

### Step 1: Mermaid コードを生成または検証する

ユーザーがコードではなく説明を渡した場合は、有効な Mermaid 構文を生成します。詳細は `references/mermaid-syntax.md` を参照します。

### Step 2: SVG をレンダリングする

次のコマンドで SVG を生成します。

```bash
npx tsx scripts/render.ts --code $'flowchart TD\n  A --> B' --output diagram --theme default
```

ファイル入力の場合は次を使います。

```bash
npx tsx scripts/render.ts --input diagram.mmd --output diagram --theme tokyo-night
```

この手順でカレントディレクトリに `<output>.svg` が生成されます。
`--code` を使う場合は、1 行のセミコロン区切りではなく改行を含む Mermaid 構文を使います。

### Step 3: HTML ラッパーを作成する

スクリーンショット用に HTML ラッパーを作成します。

```bash
npx tsx scripts/create-html.ts --svg diagram.svg --output diagram.html
```

この HTML は適切な余白と背景で SVG を表示する最小構成です。

### Step 4: Playwright で高解像度 PNG を生成する

Playwright CLI で高品質スクリーンショットを取得します。

```bash
# 初回のみ必要な場合がある
npx playwright install chromium

# HiDPI のデスクトッププロファイルで全体を撮影
npx playwright screenshot --device="Desktop Chrome HiDPI" --full-page "file://$(pwd)/diagram.html" diagram.png
```

複雑な図でさらに高解像度が必要な場合は、HTML 作成時の `--padding` で余白を増やします。

### Step 5: 中間ファイルを削除する

レンダリング後は中間ファイルを削除します。最終的に `.svg` と `.png` のみ残します。

削除対象:

- HTML ラッパー（例: `diagram.html`）
- 一時 `.mmd` ファイル
- その他の中間生成物

```bash
python3 - <<'PY'
from pathlib import Path
for p in [Path("diagram.html"), Path("diagram.mmd")]:
    try:
        p.unlink()
    except FileNotFoundError:
        pass
PY
```

一時 `.mmd` のファイル名が異なる場合は `diagram.mmd` を読み替えます。

### Step 6: 生成画像をレビューする

コミット前に、必ずエージェント自身が生成 PNG を目視確認して結果を報告します。
確認時は `view_image` で PNG を開き、次の観点をチェックします。

- ローカル表示で文字つぶれ、はみ出し、欠けがない
- 背景設定（`transparent` または指定色）が意図どおり
- ノード、矢印、ラベルが全て描画されている
- 二重表示や意図しない重なりがない

問題があれば、テーマ、余白（`--padding`）、背景設定を調整して再生成します。

## 出力

常に次の 2 形式を生成します。

- SVG: ベクタ形式。拡大しても劣化しにくく、ファイルサイズが小さい
- PNG: ラスタ形式。4K（3840×2160）相当の表示で撮影し、図の幅は最低 1200px を目安にする

保存先は、ユーザーが明示しない限りカレントディレクトリです。

## テーマ選定ガイド

| Theme             | Background   | Best For                   |
| ----------------- | ------------ | -------------------------- |
| default           | Light grey   | General use                |
| dracula           | Dark purple  | Dark mode preference       |
| tokyo-night       | Dark blue    | Modern dark aesthetic      |
| tokyo-night-storm | Darker blue  | Higher contrast            |
| nord              | Dark arctic  | Muted, calm visuals        |
| nord-light        | Light arctic | Light mode with soft tones |
| github-dark       | GitHub dark  | Matches GitHub UI          |
| github-light      | GitHub light | Matches GitHub UI          |
| catppuccin-latte  | Warm light   | Soft pastel aesthetic      |
| solarized         | Tan/cream    | Solarized colour scheme    |
| one-dark          | Atom dark    | Atom editor aesthetic      |
| zinc-dark         | Neutral dark | Minimal, no colour bias    |

## トラブルシューティング

### テーマが反映されない

`render.ts` の出力にある `bg` と `fg` を確認するか、SVG の先頭タグにある `--bg` と `--fg` の CSS 変数を確認します。

### 図が切れる、または一部しか描画されない

- エッジラベルは `-->|label|` のパイプ記法を使う
- ノード ID の重複がないか確認する
- ラベルの括弧が閉じているか確認する

### SVG が空、または壊れた出力になる

- https://mermaid.live で構文検証する
- エスケープが必要な特殊文字は引用符で囲む
- 方向指定（`graph TD` や `graph LR`）があるか確認する
