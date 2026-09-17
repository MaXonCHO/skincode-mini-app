import { findProductByShade, findShade, matches } from "./data";
import type { Preferences } from "./types";

export function getRecommendations(sourceShadeId: string | string[] | null, preferences: Preferences) {
  const sourceShadeIds = Array.isArray(sourceShadeId) ? sourceShadeId : sourceShadeId ? [sourceShadeId] : [];
  const sourceProductIds = new Set(sourceShadeIds.map((id) => findProductByShade(id)?.id).filter(Boolean));
  const seenTargets = new Set<string>();

  return matches
    .filter((match) => sourceShadeIds.includes(match.sourceShadeId))
    .filter((match) => {
      if (seenTargets.has(match.targetShadeId)) return false;
      seenTargets.add(match.targetShadeId);
      return true;
    })
    .map((match) => ({
      match,
      product: findProductByShade(match.targetShadeId),
      shade: findShade(match.targetShadeId),
    }))
    .filter((item) => item.product && item.shade && !sourceProductIds.has(item.product.id))
    .filter((item) => preferences.budget === "any" || item.product!.price <= Number(preferences.budget))
    .sort((a, b) => {
      const score = (item: typeof a) => {
        const product = item.product!;
        return (
          (item.match.level === "close" ? 4 : 0) +
          (preferences.finish === product.finish ? 2 : 0) +
          (preferences.skinType !== "unknown" && product.skinTypes.includes(preferences.skinType) ? 1 : 0)
        );
      };

      return score(b) - score(a);
    })
    .map((item) => ({ ...item, product: item.product!, shade: item.shade! }));
}
