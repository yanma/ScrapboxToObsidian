import { convertScrapboxToObsidian } from "./convert.js";
import { parse } from "https://esm.sh/@progfay/scrapbox-parser@8.1.0";
import { ensureDir } from "https://deno.land/std@0.170.0/fs/mod.ts";

// ファイル名を安全な形式に変換する関数
const sanitizeFileName = (title) => {
  // 特殊文字とスペースをアンダースコアに変換
  let sanitized = title
    .replace(/[\\/:*?"<>|]/g, "_") // ファイルシステムで使用できない文字をアンダースコアに
    .replace(/\s+/g, "_");         // スペースをアンダースコアに

  // 長さを制限（拡張子を含む）
  const maxLength = 100;
  if (sanitized.length > maxLength - 3) { // .mdの3文字を考慮
    sanitized = sanitized.substring(0, maxLength - 3);
  }

  return sanitized;
};

const generateMetaData = (title, created, updated) => {
  return [
    "---",
    `title: ${title}`,
    `created_at: ${new Date(created * 1000).toLocaleDateString("ja-JP", { year: "numeric", month: "2-digit", day: "2-digit" }).replace(/\//g, "-")}`,
    `updated_at: ${new Date(updated * 1000).toLocaleDateString("ja-JP", { year: "numeric", month: "2-digit", day: "2-digit" }).replace(/\//g, "-")}`,
    "---"
  ].join("\n");
};

const filePath = Deno.args[0];
const projectName = Deno.args[1] ?? "PROJECT_NAME";
const outputDir = Deno.args[2] ?? "obsidianPages";
const forceOverwrite = Deno.args.includes("-f");

try {
  // 出力ディレクトリのパスを正規化
  const normalizedOutputDir = outputDir.startsWith("./") ? outputDir : `./${outputDir}`;
  await ensureDir(normalizedOutputDir);
  const projectFile = await Deno.readTextFile(`./${filePath}`);
  const projectJson = JSON.parse(projectFile);
  const pages = projectJson["pages"];
  for (const page of pages) {
    const obsidianPageMetadata = generateMetaData(
      page["title"],
      page["created"],
      page["updated"]
    );
    const blocks = parse(page["lines"].join("\n"));
    const obsidianPageContent = blocks.map((block) =>
      convertScrapboxToObsidian(block, 0, projectName)
    ).join("\n");
    
    // ファイル名を安全な形式に変換
    const safeFileName = sanitizeFileName(page["title"]);
    const obsidianPagePath = `${normalizedOutputDir}/${safeFileName}.md`;
    
    // ファイルの存在確認と更新日時のチェック
    let shouldWrite = true;
    try {
      const fileInfo = await Deno.stat(obsidianPagePath);
      if (!forceOverwrite && fileInfo.mtime && fileInfo.mtime.getTime() >= page["updated"] * 1000) {
        shouldWrite = false;
      }
    } catch (error) {
      if (!(error instanceof Deno.errors.NotFound)) {
        throw error;
      }
    }

    if (shouldWrite) {
      await Deno.writeTextFile(obsidianPagePath, obsidianPageMetadata + obsidianPageContent);
      await Deno.utime(obsidianPagePath, new Date(), page["updated"]);
      console.log(`Written: ${safeFileName}.md`);
    }
  }
} catch (error) {
  if (error instanceof Deno.errors.NotFound) {
    console.error("the file was not found");
  } else {
    throw error;
  }
}