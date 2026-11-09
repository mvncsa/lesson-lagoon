export type CurrencyAmount = number; // Integers in laari (MVR * 100)

export type ResourceType = 'PDF' | 'DOCX' | 'PPTX' | 'EPUB' | 'TUTORIAL';

export interface Category {
  id: string;
  name: string;
  ic: string;
}

export interface ProductVersion {
  v: number;
  at: string;
  note: string;
  file: string;
}

export interface PrintOptions {
  enabled: boolean;
  pricingMode: 'fixed' | 'auto';
  fixedPrice?: CurrencyAmount; // in laari
  allowColour: boolean;
  allowBw: boolean;
  bindings: ('none' | 'stapled' | 'spiral')[];
  papers: ('standard' | 'card')[];
  maxQty: number;
  productionDays: number;
}

export interface Product {
  id: string;
  slug: string;
  title: string;
  short: string;
  long?: string;
  cat: string;
  grade: string;
  type: ResourceType;
  pages: number;
  price: CurrencyAmount; // in laari, 0 = free
  min: CurrencyAmount; // minimum price in laari
  featured: boolean;
  rating: number;
  rc: number; // review count
  color: string;
  ic: string;
  status: 'Draft' | 'Published' | 'Archived';
  sales: number;
  curr: string;
  ver: number;
  pv: number; // preview pages count
  printOptions?: PrintOptions;
  pinnedRelated?: string[];
  blockedRelated?: string[];
  file?: {
    name: string;
    size: number;
    hash?: string | null;
  };
  versions?: ProductVersion[];
  created?: string;
  updated?: string;
  tags?: string[];
  cover?: string | null;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'CUSTOMER' | 'ADMIN';
  color?: string;
  points: number;
  pending: number;
  held: number;
  code: string; // referral code
  refBy?: string | null;
  joined: string;
  source: string;
  consent: boolean;
  paid: boolean;
  tags?: string[];
  notes?: string;
  blocked?: boolean;
  birthDay?: number | null;
  birthMonth?: number | null;
  birthdaySetAt?: string | null;
  profileValues?: Record<string, any>;
  welcome?: {
    status: 'active' | 'used' | 'expired';
    pct: number;
    expires: number;
  };
}

export interface Review {
  id: string;
  pid: string;
  uid: string | null;
  name: string;
  rating: number; // 1-5, 0 for testimonials
  title?: string;
  text: string;
  status: 'pending' | 'approved' | 'hidden' | 'reported';
  home: boolean;
  date: string;
  verifiedType?: 'paid' | 'free' | 'testimonial';
  photos?: string[];
  tags?: string[];
  helpfulCount?: number;
  ownerReply?: string;
  repliedAt?: string;
}

export interface Campaign {
  id: string;
  name: string;
  type: string;
  pct: number;
  scope: 'all' | string; // 'all' or subject id
  mult: number;
  active: boolean;
  start: number;
  end: number;
  accent: string;
  banner: string;
  ended?: boolean;
}

export interface Coupon {
  code: string;
  pct?: number;
  fixedMvr?: number; // in MVR
  limit: number;
  used: number;
  expires: string;
  active: boolean;
  applyToPrint?: boolean;
}

export interface CartItem {
  pid: string;
  format: 'digital' | 'print';
  printConfig?: {
    colour: 'colour' | 'bw';
    binding: 'none' | 'stapled' | 'spiral';
    paper: 'standard' | 'card';
    qty: number;
    unitPrice: CurrencyAmount;
  };
}

export interface OrderItem {
  pid: string;
  title: string;
  list: CurrencyAmount;
  final: CurrencyAmount;
  format?: 'digital' | 'print';
  printDetails?: {
    colour: 'colour' | 'bw';
    binding: 'none' | 'stapled' | 'spiral';
    paper: 'standard' | 'card';
    qty: number;
    unitPrice: CurrencyAmount;
    lineTotal: CurrencyAmount;
  };
}

export interface DeliveryDetails {
  zoneId: string;
  zoneName: string;
  fee: CurrencyAmount;
  recipient: string;
  phone: string;
  island: string;
  address: string;
  notes?: string;
  isPickup?: boolean;
  status?: 'PRINT_QUEUED' | 'PRINTING' | 'READY_FOR_PICKUP' | 'OUT_FOR_DELIVERY' | 'DELIVERED';
  trackingNote?: string;
}

export interface Order {
  no: string;
  uid: string;
  items: OrderItem[];
  subtotal: CurrencyAmount;
  discount: CurrencyAmount;
  pointsUsed: number;
  pointsDiscount: CurrencyAmount;
  printTotal: CurrencyAmount;
  deliveryFee: CurrencyAmount;
  deliveryDetails?: DeliveryDetails;
  total: CurrencyAmount;
  status:
    | 'AWAITING_TRANSFER'
    | 'AWAITING_VERIFICATION'
    | 'PAID'
    | 'COMPLETED_FREE'
    | 'PAYMENT_REJECTED'
    | 'CANCELLED'
    | 'EXPIRED'
    | 'REFUNDED';
  at: string;
  method: 'Bank transfer' | 'Free';
  earned?: number;
  mult?: number;
  slip?: {
    amount: CurrencyAmount;
    ref: string;
    sender: string;
    date: string;
    url?: string;
  };
  dup?: boolean;
  tokens?: {
    approve: string;
    reject: string;
    used: boolean;
  };
  log?: { at: string; ev: string }[];
}

export interface PointsLedgerItem {
  id: string;
  uid: string;
  type: string;
  pts: number;
  status: 'available' | 'pending' | 'held' | 'spent' | 'expired' | 'reversed';
  at: string;
  release?: number | null;
  expiry?: string | null;
}

export interface ResourceRequest {
  id: string;
  email: string;
  text: string;
  subjectId?: string;
  grade?: string;
  type?: string;
  notify: boolean;
  marketingConsent: boolean;
  status: 'New' | 'Unverified' | 'Planned' | 'In progress' | 'Published' | 'Declined';
  linkedProductId?: string;
  note?: string;
  count: number;
  createdAt: string;
}

export interface Newsletter {
  id: string;
  subject: string;
  previewText: string;
  blocks: any[];
  segmentId: string;
  status: 'Draft' | 'Scheduled' | 'Sending' | 'Sent';
  scheduledAt?: string;
  sentAt?: string;
  stats?: {
    recipients: number;
    opens: number;
    clicks: number;
    unsubscribes: number;
    orders: number;
  };
}

export interface AutomationJourney {
  id: string;
  name: string;
  trigger: string;
  enabled: boolean;
  steps: string[];
  delay: string;
  stopsWhen: string;
  stats: {
    entered: number;
    sent: number;
    converted: number;
  };
}

export interface PricingSettings {
  defaultPrice: number; // MVR
  defaultMinPct: number;
  defaultPreviewPages: number;
  freeDailyLimit: number;
  ptsPerMVR: number;
  ptsPerMVRValue: number;
  maxPointsPct: number;
  minPointsRedemption: number;
  pointsExpiryMonths: number;
  signupPts: number;
  reviewPts: number;
  reviewPhotoPtsBonus: number;
  holdDays: number;
  sharePts: number;
  shareFirstOrderPct: number;
  shareMonthlyCap: number;
  refReferrer: number;
  refFriend: number;
  welcomePct: number;
  welcomeDays: number;
  birthdayBonusPts: number;
  birthdayCouponPct: number;
  birthdayWindowDays: number;
  // Print rates
  bwPageRate: number; // MVR
  colourPageRate: number;
  cardPaperSurcharge: number;
  stapledRate: number;
  spiralRate: number;
  minPrintCharge: number;
  maxPrintQty: number;
  productionDays: number;
}
