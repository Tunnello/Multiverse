import { describe, it, expect } from "vitest";
import { readFileSync } from "fs";
import { join } from "path";
import { GraphDocumentSchema } from "@/lib/graphSchema";
import { ManifestSchema } from "@/lib/manifestSchema";

const dataDir = join(process.cwd(), "public", "data");

describe("committed fixtures", () => {
  it("validates manifest", () => {
    const raw = JSON.parse(readFileSync(join(dataDir, "manifest.json"), "utf8"));
    expect(() => ManifestSchema.parse(raw)).not.toThrow();
  });

  for (const file of ["topic-1.json", "topic-2.json", "topic-3.json"]) {
    it(`validates ${file}`, () => {
      const raw = JSON.parse(readFileSync(join(dataDir, file), "utf8"));
      const doc = GraphDocumentSchema.parse(raw);
      expect(doc.nodes.length).toBeGreaterThan(0);
      const clash = doc.edges.filter((e) => e.kind === "clash");
      expect(clash.length).toBeGreaterThan(0);
    });
  }
});
