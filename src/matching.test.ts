import { describe, expect, it } from "vitest";
import { getRecommendations } from "./matching";
import type { Preferences } from "./types";

const defaults: Preferences = { skinType: "unknown", finish: null, budget: "any" };

describe("getRecommendations", () => {
  it("returns a stable order for the same source shade", () => {
    const first = getRecommendations("mac-nc20", defaults).map((item) => item.shade.id);
    const second = getRecommendations("mac-nc20", defaults).map((item) => item.shade.id);

    expect(first.slice(0, 2)).toEqual(["atelier-n20", "forma-n2"]);
    expect(first).toContain("3ina-602");
    expect(first).toContain("essence-40");
    expect(second).toEqual(first);
  });

  it("respects budget limits without inventing alternatives", () => {
    const results = getRecommendations("mac-nc20", { ...defaults, budget: "3000" });

    expect(results.map((item) => item.shade.id)).toEqual(["atelier-n20", "3ina-602", "essence-40"]);
    expect(results.every((item) => item.product.price <= 3000)).toBe(true);
  });

  it("uses formula preferences to rank equally close shades", () => {
    const results = getRecommendations("mac-nc20", { ...defaults, finish: "natural", skinType: "combination" });

    expect(results[0].product.finish).toBe("natural");
    expect(results[0].match.level).toBe("close");
  });

  it("returns no recommendations when the demo table has no mapping", () => {
    expect(getRecommendations("rare-170w", defaults)).toEqual([]);
    expect(getRecommendations(null, defaults)).toEqual([]);
  });
});
