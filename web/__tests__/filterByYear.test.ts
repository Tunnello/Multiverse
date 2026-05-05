import { describe, it, expect } from "vitest";
import { filterGraphByYear } from "@/lib/filterByYear";
import type { GraphDocument } from "@/lib/graphSchema";

const doc: GraphDocument = {
  schemaVersion: "1.0",
  topic: { title: "T", slug: "t" },
  timeRange: { minYear: 2016, maxYear: 2026 },
  nodes: [
    {
      id: "a",
      label: "A",
      camp: "academic",
      summary: "s",
      quote: "q",
      opinionType: "赞成",
      opinionReason: ["r"],
      keyPoint: ["k"],
      author: { name: "Alice" },
      voteUpCount: 1,
      publishedAt: "2015-06-01T00:00:00.000Z",
      predictionScore: { predictionDeviation: 0 },
      zhihu: {},
    },
    {
      id: "b",
      label: "B",
      camp: "radical",
      summary: "s2",
      quote: "q2",
      opinionType: "反对",
      opinionReason: ["r2"],
      keyPoint: ["k2"],
      author: { name: "Bob" },
      voteUpCount: 2,
      publishedAt: "2020-01-01T00:00:00.000Z",
      predictionScore: { predictionDeviation: 1 },
      zhihu: {},
    },
  ],
  edges: [
    { id: "e1", source: "a", target: "b", kind: "clash", label: "c" },
  ],
};

describe("filterGraphByYear", () => {
  it("hides nodes published strictly after Dec 31 of selected year", () => {
    const y2016 = filterGraphByYear(doc, 2016);
    expect(y2016.visibleNodeIds.has("a")).toBe(true);
    expect(y2016.visibleNodeIds.has("b")).toBe(false);
    expect(y2016.edges.map((e) => e.id)).toEqual([]);
  });

  it("shows both when year is 2020", () => {
    const y2020 = filterGraphByYear(doc, 2020);
    expect(y2020.visibleNodeIds.has("a")).toBe(true);
    expect(y2020.visibleNodeIds.has("b")).toBe(true);
    expect(y2020.edges.map((e) => e.id)).toEqual(["e1"]);
  });
});
