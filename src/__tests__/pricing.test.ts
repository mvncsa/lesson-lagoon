import { describe, it, expect } from 'vitest';
import {
  calculateOrderPricing,
  calculatePrintCost,
  formatMVR,
  LAARI_PER_MVR,
  POINTS_PER_MVR_VALUE,
} from '../lib/pricing';
import { Product, CartItem, Campaign, Coupon } from '../lib/types';

describe('Pricing Service (P1-CHK-05, P1-CHK-06, P1-PTS-03, P1-PRN-05)', () => {
  const sampleProduct: Product = {
    id: 'p1',
    slug: 'maths-fractions',
    title: 'Grade 4 Fractions',
    short: 'Short desc',
    cat: 'maths',
    grade: 'Grade 4',
    type: 'PDF',
    pages: 20,
    price: 10000, // MVR 100.00 in laari
    min: 2000,    // MVR 20.00 minimum price
    featured: true,
    rating: 4.8,
    rc: 10,
    color: '#0E8C7F',
    ic: '🍕',
    status: 'Published',
    sales: 10,
    curr: 'National Curriculum',
    ver: 1,
    pv: 3,
    printOptions: {
      enabled: true,
      pricingMode: 'auto',
      allowColour: true,
      allowBw: true,
      bindings: ['stapled'],
      papers: ['standard'],
      maxQty: 30,
      productionDays: 2,
    },
  };

  const productsMap = new Map<string, Product>([[sampleProduct.id, sampleProduct]]);

  it('calculates standard full price for digital resource without promotions', () => {
    const items: CartItem[] = [{ pid: 'p1', format: 'digital' }];
    const result = calculateOrderPricing(items, productsMap);

    expect(result.subtotal).toBe(10000);
    expect(result.discountTotal).toBe(0);
    expect(result.totalCash).toBe(10000);
    expect(result.pointsToEarn).toBe(100); // 1 pt per 1 MVR paid in cash
  });

  it('applies campaign discount correctly', () => {
    const items: CartItem[] = [{ pid: 'p1', format: 'digital' }];
    const campaign: Campaign = {
      id: 'c1',
      name: "Teachers' Day",
      type: "Teachers' Day",
      pct: 15,
      scope: 'all',
      mult: 2,
      active: true,
      start: Date.now() - 10000,
      end: Date.now() + 10000,
      accent: '#DB2777',
      banner: '15% off',
    };

    const result = calculateOrderPricing(items, productsMap, { activeCampaign: campaign });

    expect(result.subtotal).toBe(10000);
    expect(result.discountTotal).toBe(1500); // 15% of 10000
    expect(result.totalCash).toBe(8500); // MVR 85.00
    expect(result.pointsToEarn).toBe(85 * 2); // 85 MVR * 2x campaign multiplier = 170 pts
  });

  it('respects minimum price floor and never sells below min price (P1-CAT-04)', () => {
    const items: CartItem[] = [{ pid: 'p1', format: 'digital' }];
    const aggressiveCoupon: Coupon = {
      code: 'MEGA90',
      pct: 90, // 90% off would be 1000 laari, but min is 2000 laari
      limit: 10,
      used: 0,
      expires: '2026-12-31',
      active: true,
    };

    const result = calculateOrderPricing(items, productsMap, { coupon: aggressiveCoupon });

    expect(result.totalCash).toBe(sampleProduct.min); // Floors at 2000 laari (MVR 20.00)
    expect(result.discountTotal).toBe(8000); // 10000 - 2000
  });

  it('enforces 80% maximum cap on points redemption (P1-PTS-03)', () => {
    const items: CartItem[] = [{ pid: 'p1', format: 'digital' }];
    const userWithManyPoints = {
      id: 'u1',
      points: 5000, // Customer has 5,000 points (value: MVR 500)
    };

    // Customer requests to use all 5000 points
    const result = calculateOrderPricing(items, productsMap, {
      user: userWithManyPoints,
      pointsToUse: 5000,
    });

    // 80% of 10000 laari is 8000 laari max points discount (= 800 points)
    // Also, price after points is 2000 laari, which is >= minPrice (2000 laari)
    expect(result.pointsUsed).toBe(800);
    expect(result.pointsDiscountTotal).toBe(8000);
    expect(result.totalCash).toBe(2000); // Customer pays at least 20% in cash
  });

  it('calculates print costs and ensures points are NOT used on print charges (P1-CHK-06)', () => {
    const items: CartItem[] = [
      {
        pid: 'p1',
        format: 'print',
        printConfig: {
          colour: 'colour', // 300 laari/page
          paper: 'standard', // 0 surcharge
          binding: 'stapled', // 500 laari
          qty: 1,
          unitPrice: 0,
        },
      },
    ];

    // 20 pages * 300 = 6000 + 500 = 6500 laari print cost
    const printCost = calculatePrintCost(20, items[0].printConfig);
    expect(printCost).toBe(6500); // MVR 65.00

    const userWithPoints = { id: 'u1', points: 2000 };
    const result = calculateOrderPricing(items, productsMap, {
      user: userWithPoints,
      pointsToUse: 2000,
      deliveryZoneId: 'male', // MVR 30.00 = 3000 laari
    });

    // Max points applies ONLY to digital part (80% of 10000 = 8000 laari = 800 points)
    expect(result.pointsUsed).toBe(800);
    expect(result.printSubtotal).toBe(6500);
    expect(result.deliveryFee).toBe(3000);
    // Total cash = 2000 (remaining digital) + 6500 (print) + 3000 (delivery) = 11500 laari
    expect(result.totalCash).toBe(11500);
  });

  it('formats MVR currency correctly with laari conversion', () => {
    expect(formatMVR(7500)).toBe('MVR 75');
    expect(formatMVR(7550)).toBe('MVR 75.50');
    expect(formatMVR(0)).toBe('MVR 0');
  });
});

