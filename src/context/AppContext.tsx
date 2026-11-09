'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  Product,
  User,
  CartItem,
  Order,
  Review,
  Campaign,
  Coupon,
  Category,
  ResourceRequest,
  Newsletter,
  PricingSettings,
} from '@/lib/types';
import {
  INITIAL_PRODUCTS,
  INITIAL_USERS,
  INITIAL_CATEGORIES,
  INITIAL_CAMPAIGNS,
  INITIAL_COUPONS,
  INITIAL_ORDERS,
  INITIAL_REVIEWS,
  INITIAL_ENTITLEMENTS,
  INITIAL_RESOURCE_REQUESTS,
  INITIAL_NEWSLETTERS,
  INITIAL_PRICING_SETTINGS,
} from '@/lib/data';

interface ToastItem {
  id: string;
  message: string;
  type?: 'success' | 'error' | 'info';
}

interface AppContextType {
  user: User | null;
  setUser: (u: User | null) => void;
  signIn: (email: string, marketingConsent?: boolean) => void;
  signOut: () => void;
  switchUserRole: (role: 'guest' | 'customer' | 'admin') => void;

  products: Product[];
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
  categories: Category[];
  campaigns: Campaign[];
  coupons: Coupon[];
  activeCampaign: Campaign | null;

  cart: CartItem[];
  addToCart: (item: CartItem) => void;
  removeFromCart: (pid: string) => void;
  updateCartItem: (pid: string, updates: Partial<CartItem>) => void;
  clearCart: () => void;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;

  orders: Order[];
  createOrder: (order: Order) => void;
  uploadOrderSlip: (orderNo: string, slip: Order['slip']) => void;
  updateOrderStatus: (orderNo: string, status: Order['status'], note?: string) => void;

  reviews: Review[];
  addReview: (review: Omit<Review, 'id' | 'date'>) => void;
  voteReviewHelpful: (reviewId: string) => void;
  replyToReview: (reviewId: string, reply: string) => void;
  moderateReview: (reviewId: string, status: Review['status']) => void;

  entitlements: { uid: string; pid: string; at: string }[];
  userOwnsProduct: (pid: string) => boolean;

  resourceRequests: ResourceRequest[];
  submitResourceRequest: (req: Omit<ResourceRequest, 'id' | 'createdAt' | 'count'>) => void;

  pricingSettings: PricingSettings;
  updatePricingSettings: (updates: Partial<PricingSettings>) => void;

  newsletters: Newsletter[];
  addNewsletter: (nws: Newsletter) => void;

  toasts: ToastItem[];
  showToast: (msg: string, type?: 'success' | 'error' | 'info') => void;

  isSignInModalOpen: boolean;
  setIsSignInModalOpen: (open: boolean) => void;
}

const AppContext = createContext<AppContextType | null>(null);

const STORAGE_KEY = 'lessonlagoon_state_v1';

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(INITIAL_USERS[1]); // Mariyam Shifa by default
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [categories] = useState<Category[]>(INITIAL_CATEGORIES);
  const [campaigns] = useState<Campaign[]>(INITIAL_CAMPAIGNS);
  const [coupons] = useState<Coupon[]>(INITIAL_COUPONS);
  const [orders, setOrders] = useState<Order[]>(INITIAL_ORDERS);
  const [reviews, setReviews] = useState<Review[]>(INITIAL_REVIEWS);
  const [entitlements, setEntitlements] = useState(INITIAL_ENTITLEMENTS);
  const [resourceRequests, setResourceRequests] = useState<ResourceRequest[]>(INITIAL_RESOURCE_REQUESTS);
  const [newsletters, setNewsletters] = useState<Newsletter[]>(INITIAL_NEWSLETTERS);
  const [pricingSettings, setPricingSettings] = useState<PricingSettings>(INITIAL_PRICING_SETTINGS);

  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isSignInModalOpen, setIsSignInModalOpen] = useState(false);
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  // Load saved state from localStorage if available
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.orders) setOrders(parsed.orders);
        if (parsed.cart) setCart(parsed.cart);
        if (parsed.entitlements) setEntitlements(parsed.entitlements);
        if (parsed.reviews) setReviews(parsed.reviews);
      }
    } catch {}
  }, []);

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ orders, cart, entitlements, reviews })
      );
    } catch {}
  }, [orders, cart, entitlements, reviews]);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    const id = Math.random().toString(36).slice(2, 8);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3500);
  };

  const activeCampaign = campaigns.find(
    (c) => c.active && Date.now() >= c.start && Date.now() <= c.end
  ) || null;

  const signIn = (email: string, marketingConsent = false) => {
    let existing = INITIAL_USERS.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (!existing) {
      existing = {
        id: 'u_' + Math.random().toString(36).slice(2, 7),
        name: email.split('@')[0].replace('.', ' '),
        email,
        role: 'CUSTOMER',
        points: 50, // Sign up bonus (P1-AUTH-05)
        pending: 0,
        held: 0,
        code: email.slice(0, 5).toUpperCase() + Math.floor(Math.random() * 90 + 10),
        joined: new Date().toISOString().slice(0, 10),
        source: 'Google sign-in',
        consent: marketingConsent,
        paid: false,
        welcome: {
          status: 'active',
          pct: 20,
          expires: Date.now() + 7 * 86400000,
        },
      };
      showToast('🎉 Welcome to LessonLagoon! +50 sign-up points added.');
    } else {
      showToast(`Welcome back, ${existing.name}!`);
    }
    setUser(existing);
    setIsSignInModalOpen(false);
  };

  const signOut = () => {
    setUser(null);
    showToast('Signed out successfully.');
  };

  const switchUserRole = (role: 'guest' | 'customer' | 'admin') => {
    if (role === 'guest') {
      setUser(null);
      showToast('Switched to Guest mode');
    } else if (role === 'customer') {
      setUser(INITIAL_USERS[1]); // Mariyam Shifa
      showToast('Switched to Customer: Mariyam Shifa');
    } else if (role === 'admin') {
      setUser(INITIAL_USERS[0]); // Shaina Ali (Admin)
      showToast('Switched to Admin: Shaina Ali');
    }
  };

  const addToCart = (item: CartItem) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.pid === item.pid);
      if (existing) {
        showToast('Resource already in your cart.');
        return prev;
      }
      showToast('Added to cart!');
      return [...prev, item];
    });
    setIsCartOpen(true);
  };

  const removeFromCart = (pid: string) => {
    setCart((prev) => prev.filter((i) => i.pid !== pid));
    showToast('Item removed from cart');
  };

  const updateCartItem = (pid: string, updates: Partial<CartItem>) => {
    setCart((prev) =>
      prev.map((i) => (i.pid === pid ? { ...i, ...updates } : i))
    );
  };

  const clearCart = () => setCart([]);

  const userOwnsProduct = (pid: string): boolean => {
    if (!user) return false;
    return entitlements.some((e) => e.uid === user.id && e.pid === pid);
  };

  const createOrder = (order: Order) => {
    setOrders((prev) => [order, ...prev]);
    clearCart();

    if (order.status === 'COMPLETED_FREE') {
      // Free items give immediate entitlement
      const newEntitlements = order.items.map((it) => ({
        uid: order.uid,
        pid: it.pid,
        at: new Date().toISOString(),
      }));
      setEntitlements((prev) => [...prev, ...newEntitlements]);
      showToast('✨ Added to your Library! Ready to download.');
    } else {
      showToast(`Order ${order.no} created. Please transfer to complete.`);
    }
  };

  const uploadOrderSlip = (orderNo: string, slip: Order['slip']) => {
    setOrders((prev) =>
      prev.map((o) => {
        if (o.no === orderNo) {
          const updatedLog = [
            ...(o.log || []),
            { at: new Date().toISOString().slice(0, 16), ev: 'Transfer slip uploaded · owner notified' },
          ];
          return {
            ...o,
            slip,
            status: 'AWAITING_VERIFICATION',
            log: updatedLog,
          };
        }
        return o;
      })
    );
    showToast('Receipt slip uploaded! Awaiting owner approval.');
  };

  const updateOrderStatus = (orderNo: string, status: Order['status'], note?: string) => {
    setOrders((prev) =>
      prev.map((o) => {
        if (o.no === orderNo) {
          const updatedLog = [
            ...(o.log || []),
            { at: new Date().toISOString().slice(0, 16), ev: note || `Status changed to ${status}` },
          ];
          
          if (status === 'PAID') {
            // Unlock entitlements
            const newEnt = o.items.map((it) => ({
              uid: o.uid,
              pid: it.pid,
              at: new Date().toISOString(),
            }));
            setEntitlements((cur) => [...cur, ...newEnt]);
          }

          return { ...o, status, log: updatedLog };
        }
        return o;
      })
    );
    showToast(`Order ${orderNo} status updated to ${status}`);
  };

  const addReview = (reviewData: Omit<Review, 'id' | 'date'>) => {
    const id = 'r_' + Math.random().toString(36).slice(2, 8);
    const newReview: Review = {
      ...reviewData,
      id,
      date: new Date().toISOString().slice(0, 10),
      status: 'pending', // Sent to moderation queue
    };
    setReviews((prev) => [newReview, ...prev]);
    showToast('Thank you! Review submitted for verification (+20 points on approval).');
  };

  const voteReviewHelpful = (reviewId: string) => {
    setReviews((prev) =>
      prev.map((r) =>
        r.id === reviewId ? { ...r, helpfulCount: (r.helpfulCount || 0) + 1 } : r
      )
    );
    showToast('Marked as helpful! 👍');
  };

  const replyToReview = (reviewId: string, reply: string) => {
    setReviews((prev) =>
      prev.map((r) =>
        r.id === reviewId
          ? { ...r, ownerReply: reply, repliedAt: new Date().toISOString().slice(0, 10) }
          : r
      )
    );
    showToast('Reply published successfully.');
  };

  const moderateReview = (reviewId: string, status: Review['status']) => {
    setReviews((prev) =>
      prev.map((r) => (r.id === reviewId ? { ...r, status } : r))
    );
    showToast(`Review updated to ${status}`);
  };

  const submitResourceRequest = (req: Omit<ResourceRequest, 'id' | 'createdAt' | 'count'>) => {
    const id = 'req_' + Math.random().toString(36).slice(2, 7);
    const newReq: ResourceRequest = {
      ...req,
      id,
      count: 1,
      createdAt: new Date().toISOString().slice(0, 10),
    };
    setResourceRequests((prev) => [newReq, ...prev]);
    showToast("🎉 Request submitted! We'll notify you when ready.");
  };

  const updatePricingSettings = (updates: Partial<PricingSettings>) => {
    setPricingSettings((prev) => ({ ...prev, ...updates }));
    showToast('Pricing & rules updated successfully.');
  };

  const addNewsletter = (nws: Newsletter) => {
    setNewsletters((prev) => [nws, ...prev]);
    showToast('Newsletter saved.');
  };

  return (
    <AppContext.Provider
      value={{
        user,
        setUser,
        signIn,
        signOut,
        switchUserRole,
        products,
        setProducts,
        categories,
        campaigns,
        coupons,
        activeCampaign,
        cart,
        addToCart,
        removeFromCart,
        updateCartItem,
        clearCart,
        isCartOpen,
        setIsCartOpen,
        orders,
        createOrder,
        uploadOrderSlip,
        updateOrderStatus,
        reviews,
        addReview,
        voteReviewHelpful,
        replyToReview,
        moderateReview,
        entitlements,
        userOwnsProduct,
        resourceRequests,
        submitResourceRequest,
        pricingSettings,
        updatePricingSettings,
        newsletters,
        addNewsletter,
        toasts,
        showToast,
        isSignInModalOpen,
        setIsSignInModalOpen,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}

