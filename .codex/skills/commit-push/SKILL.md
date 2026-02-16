---
name: commit-push
description: 変更をGitにコミットしてリモートにプッシュ
allowed-tools: Bash(git status), Bash(git diff:*), Bash(git log:*), Bash(git add:*), Bash(git commit:*), Bash(git push*), Bash(git pull*)
user-invocable: true
---

# コミット作成とプッシュ

現在の変更をGitにコミットし、リモートリポジトリにプッシュする。

## 実行手順

1. `git status` で変更ファイルを確認（NEVER use -uall flag）
2. `git diff` で変更内容を確認
3. `git log` で最近のコミットメッセージのスタイルを確認
4. 変更内容を分析してコミットメッセージを生成:
   - 変更の性質を要約（新機能、既存機能の強化、バグ修正、リファクタリング、テスト、ドキュメントなど）
   - 「なぜ」を重視した簡潔なメッセージ（1-2文）
   - リポジトリのスタイルに合わせる
5. 関連するファイルをステージングしてコミット
6. コミット後に `git status` で結果を確認
7. `git push` でリモートにプッシュ
   - プッシュが拒否された場合は `git pull --rebase` でリモートの変更を取り込む
   - コンフリクトが発生した場合はユーザーに報告
   - リベース成功後に再度 `git push` を実行

## コミットメッセージのフォーマット

HEREDOCを使用して適切にフォーマット:

```bash
git commit -m "$(cat <<'EOF'
コミットメッセージのタイトル
```

## 注意事項

- .envやcredentials.jsonなど秘密情報を含むファイルは警告する
- コミットしないファイルがあれば無視する
- 変更がない場合は空のコミットを作成しない