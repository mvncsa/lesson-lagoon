'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useSession, signOut as nextAuthSignOut } from 'next-auth/react';
import { checkRedirectSignIn } from '@/lib/firebase';
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
  DeliveryDetails,
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
  updatePrintStatus: (orderNo: string, printStatus: NonNullable<DeliveryDetails['status']>, note?: string) => void;

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

  clearTestData: () => void;

  isSignInModalOpen: boolean;
  setIsSignInModalOpen: (open: boolean) => void;
}

const AppContext = createContext<AppContextType | null>(null);

const STORAGE_KEY = 'lessonlagoon_state_v1';

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null); // Clean guest state by default; no dummy customer
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

  const { data: session } = useSession();

  // Sync Google NextAuth Session with AppContext
  useEffect(() => {
    if (session?.user?.email) {
      const email = session.user.email;
      const name = session.user.name || email.split('@')[0];
      const role = (session.user as any).role || (email.toLowerCase().includes('owner') ? 'ADMIN' : 'CUSTOMER');
      const points = (session.user as any).points ?? 50;
      const code = (session.user as any).referralCode || (email.slice(0, 5).toUpperCase() + '25');

      setUser({
        id: session.user.id || 'u_' + Math.random().toString(36).slice(2, 7),
        name,
        email,
        role: role as 'CUSTOMER' | 'ADMIN',
        points,
        pending: 0,
        held: 0,
        code,
        joined: new Date().toISOString().slice(0, 10),
        source: 'Google OAuth',
        consent: true,
        paid: false,
        welcome: {
          status: 'active',
          pct: 20,
          expires: Date.now() + 7 * 86400000,
        },
      });
    }
  }, [session]);

  // Check if returning from Firebase Google Redirect
  useEffect(() => {
    checkRedirectSignIn()
      .then(async (fbUser) => {
        if (fbUser && fbUser.email) {
          const res = await fetch('/api/auth/sync', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              email: fbUser.email,
              name: fbUser.displayName,
              image: fbUser.photoURL,
            }),
          });
          const data = await res.json();
          if (data.user) {
            setUser({
              id: data.user.id,
              name: data.user.name,
              email: data.user.email,
              role: data.user.role,
              points: data.user.points ?? 50,
              pending: 0,
              held: 0,
              code: data.user.referralCode,
              joined: new Date().toISOString().slice(0, 10),
              source: 'Google OAuth Redirect',
              consent: true,
              paid: false,
              welcome: {
                status: 'active',
                pct: 20,
                expires: Date.now() + 7 * 86400000,
              },
            });
            showToast(`Welcome, ${data.user.name || data.user.email}!`, 'success');
          }
        }
      })
      .catch(() => {});
  }, []);

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
    const cleanEmail = email.trim().toLowerCase();
    const isAdminEmail = cleanEmail.includes('owner@lessonlagoon.mv') || cleanEmail.includes('mvncsa@gmail.com');
    const newUser: User = {
      id: 'u_' + Math.random().toString(36).slice(2, 7),
      name: cleanEmail.split('@')[0].replace('.', ' '),
      email: cleanEmail,
      role: isAdminEmail ? 'ADMIN' : 'CUSTOMER',
      points: 50, // 50 sign-up bonus points (1 MVR = 10 pts)
      pending: 0,
      held: 0,
      code: cleanEmail.slice(0, 5).toUpperCase() + Math.floor(Math.random() * 90 + 10),
      joined: new Date().toISOString().slice(0, 10),
      source: 'Gmail / Direct',
      consent: marketingConsent,
      paid: false,
      welcome: {
        status: 'active',
        pct: 20,
        expires: Date.now() + 7 * 86400000,
      },
    };
    setUser(newUser);
    setIsSignInModalOpen(false);
    showToast(`🎉 Signed in as ${newUser.email}! +50 welcome points added.`, 'success');
  };

  const signOut = () => {
    try {
      nextAuthSignOut({ redirect: false });
    } catch {}
    setUser(null);
    showToast('Signed out successfully.');
  };

  const switchUserRole = (role: 'guest' | 'customer' | 'admin') => {
    if (role === 'guest') {
      setUser(null);
      showToast('Signed out (Guest mode)');
    } else if (role === 'admin') {
      setUser({
        id: 'admin_owner',
        name: 'Store Administrator',
        email: 'owner@lessonlagoon.mv',
        role: 'ADMIN',
        points: 0,
        pending: 0,
        held: 0,
        code: 'ADMIN',
        joined: new Date().toISOString().slice(0, 10),
        source: 'Admin Portal',
        consent: true,
        paid: true,
      });
      showToast('Switched to Administrator');
    }
  };

  const clearTestData = () => {
    setOrders([]);
    setCart([]);
    setEntitlements([]);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {}
    showToast('Test orders, carts, and mock slips purged successfully.', 'success');
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

  const updatePrintStatus = (
    orderNo: string,
    printStatus: NonNullable<DeliveryDetails['status']>,
    note?: string
  ) => {
    setOrders((prev) =>
      prev.map((o) => {
        if (o.no === orderNo && o.deliveryDetails) {
          const updatedLog = [
            ...(o.log || []),
            {
              at: new Date().toISOString().slice(0, 16),
              ev: note || `Print fulfillment updated to ${printStatus}`,
            },
          ];
          return {
            ...o,
            deliveryDetails: {
              ...o.deliveryDetails,
              status: printStatus,
            },
            log: updatedLog,
          };
        }
        return o;
      })
    );
    showToast(`Order ${orderNo} print status: ${printStatus}`, 'success');
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
        updatePrintStatus,
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
        clearTestData,
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

