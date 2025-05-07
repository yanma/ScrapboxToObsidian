# ScrapboxToObsidian
Convert scrapbox json file to a folder of markdown files for Obsidian.

## 必要条件
- [Deno](https://deno.land/) がインストールされていること

### Denoのインストール方法
#### Windows
```powershell
iwr https://deno.land/install.ps1 -useb | iex
```

#### macOS / Linux
```bash
curl -fsSL https://deno.land/x/install/install.sh | sh
```

インストール後、環境変数のPATHに追加する必要があります。詳細は[公式ドキュメント](https://deno.land/manual/getting_started/installation)を参照してください。

## 機能
- ScrapboxのエクスポートJSONファイルをObsidian用のMarkdownファイルに変換
- プロジェクトのアイコンを保持
- リンクの相互参照を維持

## 使用方法
```bash
deno run --allow-run --allow-read --allow-write mod.ts SCRAPBOX_EXPORTED_FILE.json PROJECT_NAME
```

### パラメータ
- `SCRAPBOX_EXPORTED_FILE.json`: ScrapboxからエクスポートしたJSONファイルのパス
- `PROJECT_NAME`: Scrapboxのプロジェクト名（アイコンの取得に使用）

### 出力
- カレントディレクトリに`output`フォルダが作成され、その中にMarkdownファイルが生成されます
- 各ページは個別のMarkdownファイルとして保存されます
- 画像ファイルは`output/images`ディレクトリに保存されます

## 注意事項
- 大量のページがある場合、変換に時間がかかる可能性があります
- 画像ファイルのダウンロードにはインターネット接続が必要です
- ファイル名の処理について：
  - ファイル名は150文字（拡張子を含む）に制限されます
  - スペースはアンダースコア（_）に変換されます
  - 特殊文字（/ \\ : * ? " < > |）はアンダースコア（_）に変換されます
  - 元のページタイトルは、生成されるMarkdownファイルのメタデータ（frontmatter）に保持されます