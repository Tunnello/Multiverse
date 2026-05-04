import { copyFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const pipelineOut = join(root, "..", "pipeline", "out");
const dataDir = join(root, "public", "data");

mkdirSync(dataDir, { recursive: true });

const topics = [
  { id: "topic-1", label: "问题 1", dataUrl: "/data/topic-1.json", file: "topic-1.json" },
  { id: "topic-2", label: "问题 2", dataUrl: "/data/topic-2.json", file: "topic-2.json" },
  { id: "topic-3", label: "问题 3", dataUrl: "/data/topic-3.json", file: "topic-3.json" },
];

let copied = 0;
for (const t of topics) {
  const src = join(pipelineOut, t.file);
  const dst = join(dataDir, t.file);
  if (existsSync(src)) {
    copyFileSync(src, dst);
    console.log(`Copied ${t.file}`);
    copied++;
  } else {
    console.warn(`Missing: ${src} (skipped)`);
  }
}

if (copied > 0) {
  const manifest = { topics };
  writeFileSync(join(dataDir, "manifest.json"), JSON.stringify(manifest, null, 2), "utf8");
  console.log("Updated manifest.json");
}

console.log(`Done: copied ${copied}/${topics.length} topic files`);
