import { describe, it, expect } from 'vitest';
import { getRecommendations } from '../lib/recommender';
import { Product, Order } from '../lib/types';

describe('Recommender Engine (Section 15.9, P1-REC-01 to P1-REC-06)', () => {
  const p1: Product = {
    id: 'p1',
    slug: 'p1',
    title: 'Grade 4 Maths',
    short: 'Maths pack',
    cat: 'maths',
    grade: 'Grade 4',
    type: 'PDF',
    pages: 20,
    price: 5000,
    min: 1000,
    featured: true,
    rating: 4.9,
    rc: 10,
    color: '#0E8C7F',
    ic: '🍕',
    status: 'Published',
    sales: 100,
    curr: 'National Curriculum',
    ver: 1,
    pv: 3,
  };

  const p2: Product = {
    id: 'p2',
    slug: 'p2',
    title: 'Grade 4 Geometry',
    short: 'Geometry pack',
    cat: 'maths',
    grade: 'Grade 4',
    type: 'PDF',
    pages: 15,
    price: 4000,
    min: 800,
    featured: false,
    rating: 4.8,
    rc: 5,
    color: '#0E8C7F',
    ic: '📐',
    status: 'Published',
    sales: 80,
    curr: 'National Curriculum',
    ver: 1,
    pv: 3,
  };

  const p3: Product = {
    id: 'p3',
    slug: 'p3',
    title: 'Grade 1 Dhivehi Tracing',
    short: 'Dhivehi',
    cat: 'dhivehi',
    grade: 'Grade 1',
    type: 'PDF',
    pages: 30,
    price: 0,
    min: 0,
    featured: false,
    rating: 4.7,
    rc: 20,
    color: '#7C3AED',
    ic: '✍️',
    status: 'Published',
    sales: 500,
    curr: 'National Curriculum',
    ver: 1,
    pv: 3,
  };

  const allProducts = [p1, p2, p3];

  it('recommends co-purchased items meeting minimum support of 3 customers', () => {
    // 3 distinct customers (u1, u2, u3) own both p1 and p2
    const entitlements = [
      { uid: 'u1', pid: 'p1', at: '2026-10-01' },
      { uid: 'u1', pid: 'p2', at: '2026-10-01' },
      { uid: 'u2', pid: 'p1', at: '2026-10-01' },
      { uid: 'u2', pid: 'p2', at: '2026-10-01' },
      { uid: 'u3', pid: 'p1', at: '2026-10-01' },
      { uid: 'u3', pid: 'p2', at: '2026-10-01' },
    ];

    const recs = getRecommendations(allProducts, [], entitlements, {
      currentProductId: 'p1',
      limit: 2,
    });

    expect(recs.length).toBeGreaterThan(0);
    expect(recs[0].id).toBe('p2'); // p2 co-purchased by 3 customers
  });

  it('never recommends items the viewer already owns (P1-REC-02 rule 5)', () => {
    const entitlements = [
      { uid: 'u1', pid: 'p1', at: '2026-10-01' },
      { uid: 'u1', pid: 'p2', at: '2026-10-01' },
    ];

    const recs = getRecommendations(allProducts, [], entitlements, {
      currentProductId: 'p1',
      viewerOwnedIds: ['p2'], // Viewer already owns p2
    });

    // Should NOT include p2
    expect(recs.some((r) => r.id === 'p2')).toBe(false);
  });
});

