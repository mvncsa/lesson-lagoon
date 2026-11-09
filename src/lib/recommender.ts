import { Product, Order } from './types';

export interface RecommendationOptions {
  currentProductId?: string;
  viewerOwnedIds?: string[];
  viewerInterests?: {
    subjects?: string[];
    grades?: string[];
  };
  limit?: number;
}

/**
 * Section 15.9: "Customers who bought this also bought" Recommender
 */
export function getRecommendations(
  allProducts: Product[],
  allOrders: Order[],
  entitlements: { uid: string; pid: string; at: string }[],
  options: RecommendationOptions = {}
): Product[] {
  const limit = options.limit || 8;
  const currentPid = options.currentProductId;
  const viewerOwned = new Set(options.viewerOwnedIds || []);
  const publishedProducts = allProducts.filter((p) => p.status === 'Published');
  const productsMap = new Map(publishedProducts.map((p) => [p.id, p]));

  // 1. Gather baskets per customer
  const userBaskets = new Map<string, Set<string>>();
  for (const ent of entitlements) {
    if (!userBaskets.has(ent.uid)) {
      userBaskets.set(ent.uid, new Set());
    }
    userBaskets.get(ent.uid)!.add(ent.pid);
  }

  // Also include approved paid/free orders
  for (const order of allOrders) {
    if (order.status === 'PAID' || order.status === 'COMPLETED_FREE') {
      if (!userBaskets.has(order.uid)) {
        userBaskets.set(order.uid, new Set());
      }
      for (const item of order.items) {
        userBaskets.get(order.uid)!.add(item.pid);
      }
    }
  }

  // If a specific product is targeted:
  if (currentPid) {
    const currentProd = productsMap.get(currentPid);
    const coOccurrenceCount = new Map<string, number>();
    const pairCustomers = new Map<string, Set<string>>();

    for (const [uid, basket] of userBaskets.entries()) {
      if (basket.has(currentPid)) {
        for (const otherPid of basket) {
          if (otherPid === currentPid) continue;
          if (!productsMap.has(otherPid)) continue;

          coOccurrenceCount.set(otherPid, (coOccurrenceCount.get(otherPid) || 0) + 1);
          if (!pairCustomers.has(otherPid)) {
            pairCustomers.set(otherPid, new Set());
          }
          pairCustomers.get(otherPid)!.add(uid);
        }
      }
    }

    const scoredItems: { product: Product; score: number }[] = [];

    // Filter by minimum support of 3 customers (P1-REC-02 rule 4)
    for (const [otherPid, distinctUsers] of pairCustomers.entries()) {
      if (distinctUsers.size >= 3) {
        const prod = productsMap.get(otherPid)!;
        if (viewerOwned.has(prod.id)) continue;

        let score = distinctUsers.size;
        // Re-ranking bonuses:
        if (currentProd && prod.cat === currentProd.cat) score *= 1.1; // +10% same subject
        if (currentProd && prod.grade === currentProd.grade) score *= 1.1; // +10% same grade
        if (prod.rating >= 4.5) score *= 1.05; // +5% high rating

        scoredItems.push({ product: prod, score });
      }
    }

    scoredItems.sort((a, b) => b.score - a.score);
    const results: Product[] = scoredItems.map((s) => s.product);

    // Check owner pinned items (P1-REC-05)
    if (currentProd?.pinnedRelated && currentProd.pinnedRelated.length > 0) {
      for (let i = currentProd.pinnedRelated.length - 1; i >= 0; i--) {
        const pinnedId = currentProd.pinnedRelated[i];
        const pinnedProd = productsMap.get(pinnedId);
        if (pinnedProd && !viewerOwned.has(pinnedProd.id) && !results.some((r) => r.id === pinnedId)) {
          results.unshift(pinnedProd);
        }
      }
    }

    // Fallbacks if fewer than limit results (P1-REC-02 rule 6)
    if (results.length < limit) {
      const addedIds = new Set(results.map((r) => r.id));
      addedIds.add(currentPid);
      for (const ownedId of viewerOwned) addedIds.add(ownedId);

      // Same subject & grade
      const sameCatGrade = publishedProducts
        .filter((p) => !addedIds.has(p.id) && currentProd && p.cat === currentProd.cat)
        .sort((a, b) => b.rating * b.sales - a.rating * a.sales);

      for (const p of sameCatGrade) {
        if (results.length >= limit) break;
        results.push(p);
        addedIds.add(p.id);
      }

      // Overall best sellers fallback
      if (results.length < limit) {
        const bestSellers = publishedProducts
          .filter((p) => !addedIds.has(p.id))
          .sort((a, b) => b.sales - a.sales);

        for (const p of bestSellers) {
          if (results.length >= limit) break;
          results.push(p);
          addedIds.add(p.id);
        }
      }
    }

    return results.slice(0, limit);
  }

  // Home / General recommendations based on viewer interests or best sellers
  const addedIds = new Set<string>();
  for (const ownedId of viewerOwned) addedIds.add(ownedId);

  const interestMatches = publishedProducts
    .filter((p) => {
      if (addedIds.has(p.id)) return false;
      const subMatch = options.viewerInterests?.subjects?.includes(p.cat);
      const gradeMatch = options.viewerInterests?.grades?.includes(p.grade);
      return subMatch || gradeMatch;
    })
    .sort((a, b) => b.rating * b.sales - a.rating * a.sales);

  const generalBestSellers = publishedProducts
    .filter((p) => !addedIds.has(p.id))
    .sort((a, b) => b.sales - a.sales);

  const finalPool = [...interestMatches, ...generalBestSellers];
  const uniqueResults: Product[] = [];
  const seen = new Set<string>();

  for (const p of finalPool) {
    if (!seen.has(p.id)) {
      seen.add(p.id);
      uniqueResults.push(p);
      if (uniqueResults.length >= limit) break;
    }
  }

  return uniqueResults;
}

