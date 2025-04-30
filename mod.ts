import { convertScrapboxToObsidian } from "./convert.js";
import { parse } from "https://esm.sh/@progfay/scrapbox-parser@8.1.0";
import { ensureDir } from "https://deno.land/std@0.170.0/fs/mod.ts";

await ensureDir("./obsidianPages");

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
try {
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
    const obsidianPagePath = `./obsidianPages/${
      page["title"].replace(/\//gi, "-")
    }.md`;
    await Deno.writeTextFile(obsidianPagePath, obsidianPageMetadata + obsidianPageContent);
    await Deno.utime(obsidianPagePath, new Date(), page["updated"]);
  }
} catch (error) {
  if (error instanceof Deno.errors.NotFound) {
    console.error("the file was not found");
  } else {
    throw error;
  }
}