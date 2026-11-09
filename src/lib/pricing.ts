import { CurrencyAmount, Product, Campaign, Coupon, CartItem, DeliveryDetails } from './types';

export const LAARI_PER_MVR = 100;
export const POINTS_PER_MVR_VALUE = 10; // 10 points = 1 MVR
export const LAARI_PER_POINT = 10; // 100 laari / 10 points = 10 laari per point

export interface PricingOptions {
  user?: {
    id: string;
    points: number;
    welcome?: {
      status: 'active' | 'used' | 'expired';
      pct: number;
      expires: number;
    };
  } | null;
  activeCampaign?: Campaign | null;
  coupon?: Coupon | null;
  pointsToUse?: number; // In points count
  deliveryZoneId?: string;
  isPickup?: boolean;
}

export interface CalculatedLineItem {
  pid: string;
  product: Product;
  format: 'digital' | 'print';
  listPrice: CurrencyAmount; // laari
  discountedPrice: CurrencyAmount; // after campaign/welcome & coupon, floored at min
  discountAmount: CurrencyAmount;
  appliedOfferName?: string;
  appliedOfferPct?: number;
  printCost: CurrencyAmount; // print charge for this item (0 if digital)
  printConfig?: CartItem['printConfig'];
  maxPointsAllowed: number; // max points that can be spent on this digital line
  pointsUsed: number;
  pointsDiscountLaari: CurrencyAmount;
  finalDigitalCash: CurrencyAmount;
  finalLineTotal: CurrencyAmount; // finalDigitalCash + printCost
}

export interface OrderPricingResult {
  items: CalculatedLineItem[];
  subtotal: CurrencyAmount; // sum of list prices
  discountTotal: CurrencyAmount; // total promotional discounts
  digitalAfterDiscount: CurrencyAmount; // sum of discounted digital prices
  maxPointsUsable: number; // max points that can be spent across digital items
  pointsUsed: number; // points actually applied
  pointsDiscountTotal: CurrencyAmount; // in laari
  printSubtotal: CurrencyAmount; // total printing charges
  deliveryFee: CurrencyAmount; // delivery fee in laari
  deliveryZoneName: string;
  totalCash: CurrencyAmount; // what customer pays via bank transfer
  pointsToEarn: number; // loyalty points earned on cash spent
}

export const DEFAULT_DELIVERY_ZONES = [
  { id: 'pickup', name: 'Pick up (owner address)', fee: 0, eta: 'When ready', active: true },
  { id: 'male', name: 'Malé, Villimalé', fee: 3000, eta: '1–2 days after printing', active: true },
  { id: 'hulhumale', name: 'Hulhumalé', fee: 4000, eta: '1–2 days', active: true },
  { id: 'greater_male', name: 'Greater Malé (Thilafushi, Gulhifalhu)', fee: 6000, eta: '2–3 days', active: true },
  { id: 'atolls', name: 'Other atolls (collect at harbour)', fee: 10000, eta: '3–7 days', active: true },
];

export function calculatePrintCost(
  pages: number,
  config?: CartItem['printConfig']
): CurrencyAmount {
  if (!config) return 0;
  const qty = Math.max(1, config.qty || 1);
  
  // Base page rate
  const pageRate = config.colour === 'colour' ? 300 : 100; // 3.00 MVR or 1.00 MVR
  const cardSurcharge = config.paper === 'card' ? 100 : 0; // 1.00 MVR
  const singlePageCost = pageRate + cardSurcharge;

  // Binding
  let bindingCost = 0;
  if (config.binding === 'stapled') bindingCost = 500; // 5.00 MVR
  else if (config.binding === 'spiral') bindingCost = 2500; // 25.00 MVR

  // Min per copy is 20.00 MVR (2000 laari)
  const copyRaw = pages * singlePageCost + bindingCost;
  const copyFinal = Math.max(2000, copyRaw);

  return copyFinal * qty;
}

export function formatMVR(laari: CurrencyAmount): string {
  const mvr = laari / 100;
  return 'MVR ' + mvr.toLocaleString('en-US', {
    minimumFractionDigits: laari % 100 ? 2 : 0,
    maximumFractionDigits: 2,
  });
}

/**
 * Core Pricing Service
 * Follows P1-CHK-05, P1-CHK-06, P1-PTS-03, P1-PRN-05
 */
export function calculateOrderPricing(
  items: CartItem[],
  productsMap: Map<string, Product>,
  options: PricingOptions = {}
): OrderPricingResult {
  const calculatedItems: CalculatedLineItem[] = [];
  let subtotal = 0;
  let totalPromotionalDiscount = 0;
  let totalDigitalAfterDiscount = 0;
  let totalPrintCost = 0;

  // 1. Calculate each item's list price and promotional discount
  for (const item of items) {
    const product = productsMap.get(item.pid);
    if (!product) continue;

    const listPrice = product.price; // in laari
    const minPrice = product.min || 0; // minimum price floor

    let bestOfferPct = 0;
    let offerName: string | undefined = undefined;

    // A. Check Campaign
    if (options.activeCampaign && options.activeCampaign.active) {
      const scope = options.activeCampaign.scope;
      if (scope === 'all' || scope === product.cat) {
        if (options.activeCampaign.pct > bestOfferPct) {
          bestOfferPct = options.activeCampaign.pct;
          offerName = options.activeCampaign.name;
        }
      }
    }

    // B. Check Welcome Offer (better of campaign or welcome offer wins)
    if (
      options.user?.welcome &&
      options.user.welcome.status === 'active' &&
      Date.now() < options.user.welcome.expires
    ) {
      if (options.user.welcome.pct > bestOfferPct) {
        bestOfferPct = options.user.welcome.pct;
        offerName = `Welcome Offer (${options.user.welcome.pct}%)`;
      }
    }

    // Apply offer discount
    let promoDiscountLaari = Math.round((listPrice * bestOfferPct) / 100);

    // C. Check Coupon
    if (options.coupon && options.coupon.active) {
      if (options.coupon.pct) {
        const couponDisc = Math.round((listPrice * options.coupon.pct) / 100);
        promoDiscountLaari += couponDisc;
      } else if (options.coupon.fixedMvr) {
        // distribute fixed MVR across items or per item
        const fixedLaari = options.coupon.fixedMvr * LAARI_PER_MVR;
        promoDiscountLaari += fixedLaari;
      }
    }

    // D. Floor at minimum price for paid items
    let discountedPrice = listPrice - promoDiscountLaari;
    if (listPrice > 0 && discountedPrice < minPrice) {
      discountedPrice = minPrice;
      promoDiscountLaari = listPrice - minPrice;
    }
    if (discountedPrice < 0) discountedPrice = 0;

    // E. Print cost
    let printCost = 0;
    if (item.format === 'print' && product.printOptions?.enabled) {
      printCost = calculatePrintCost(product.pages, item.printConfig);
    }

    // F. Maximum points allowed on this digital item:
    // P1-PTS-03: Max 80% of digital item after discounts, NEVER below minimum price.
    // That means points discount cannot reduce price below minPrice, AND cannot exceed 80% of discountedPrice.
    let maxPointsDiscountLaari = Math.floor(discountedPrice * 0.8);
    const maxDropAllowed = discountedPrice - minPrice;
    if (maxDropAllowed < maxPointsDiscountLaari) {
      maxPointsDiscountLaari = Math.max(0, maxDropAllowed);
    }

    // Max points = maxPointsDiscountLaari / 10 (since 10 laari per point)
    const maxPointsForLine = Math.floor(maxPointsDiscountLaari / LAARI_PER_POINT);

    calculatedItems.push({
      pid: item.pid,
      product,
      format: item.format,
      listPrice,
      discountedPrice,
      discountAmount: promoDiscountLaari,
      appliedOfferName: offerName,
      appliedOfferPct: bestOfferPct,
      printCost,
      printConfig: item.printConfig,
      maxPointsAllowed: maxPointsForLine,
      pointsUsed: 0,
      pointsDiscountLaari: 0,
      finalDigitalCash: discountedPrice,
      finalLineTotal: discountedPrice + printCost,
    });

    subtotal += listPrice;
    totalPromotionalDiscount += promoDiscountLaari;
    totalDigitalAfterDiscount += discountedPrice;
    totalPrintCost += printCost;
  }

  // 2. Distribute points across eligible items
  const totalMaxPointsUsable = calculatedItems.reduce((acc, it) => acc + it.maxPointsAllowed, 0);
  const userAvailablePoints = options.user ? Math.max(0, options.user.points) : 0;
  
  // Minimum redemption rule: 100 points
  let requestedPoints = options.pointsToUse || 0;
  if (requestedPoints > 0 && requestedPoints < 100) {
    requestedPoints = 0;
  }

  const pointsToApply = Math.min(requestedPoints, userAvailablePoints, totalMaxPointsUsable);

  let remainingPointsToDistribute = pointsToApply;
  let totalPointsDiscountLaari = 0;

  for (const it of calculatedItems) {
    if (remainingPointsToDistribute <= 0 || it.maxPointsAllowed <= 0) continue;

    const linePoints = Math.min(remainingPointsToDistribute, it.maxPointsAllowed);
    it.pointsUsed = linePoints;
    it.pointsDiscountLaari = linePoints * LAARI_PER_POINT;
    it.finalDigitalCash = it.discountedPrice - it.pointsDiscountLaari;
    it.finalLineTotal = it.finalDigitalCash + it.printCost;

    remainingPointsToDistribute -= linePoints;
    totalPointsDiscountLaari += it.pointsDiscountLaari;
  }

  // 3. Delivery fee
  let deliveryFee = 0;
  let deliveryZoneName = 'Pick up';
  const hasPrintItem = calculatedItems.some((it) => it.format === 'print');

  if (hasPrintItem && !options.isPickup && options.deliveryZoneId) {
    const zone = DEFAULT_DELIVERY_ZONES.find((z) => z.id === options.deliveryZoneId);
    if (zone) {
      deliveryFee = zone.fee;
      deliveryZoneName = zone.name;
    } else {
      deliveryFee = 3000; // default Male'
      deliveryZoneName = "Malé, Villimalé";
    }
  } else if (!hasPrintItem) {
    deliveryFee = 0;
    deliveryZoneName = 'Digital delivery';
  }

  // 4. Total Cash
  const totalDigitalCash = calculatedItems.reduce((acc, it) => acc + it.finalDigitalCash, 0);
  const totalCash = totalDigitalCash + totalPrintCost + deliveryFee;

  // 5. Points to earn:
  // 1 MVR spent = 10 points earned (1 MVR is equal to 10 points)
  // Campaign multiplier applies if active!
  const eligibleCashEarn = totalDigitalCash + totalPrintCost;
  const cashInMVR = Math.floor(eligibleCashEarn / LAARI_PER_MVR);
  const multiplier = options.activeCampaign?.active ? (options.activeCampaign.mult || 1) : 1;
  const pointsToEarn = cashInMVR * 10 * multiplier;

  return {
    items: calculatedItems,
    subtotal,
    discountTotal: totalPromotionalDiscount,
    digitalAfterDiscount: totalDigitalAfterDiscount,
    maxPointsUsable: totalMaxPointsUsable,
    pointsUsed: pointsToApply,
    pointsDiscountTotal: totalPointsDiscountLaari,
    printSubtotal: totalPrintCost,
    deliveryFee,
    deliveryZoneName,
    totalCash,
    pointsToEarn,
  };
}

