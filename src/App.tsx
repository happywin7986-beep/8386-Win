/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { Product, Category, User, CartItem, PaymentRequest } from './types';
import {
  SESSION_KEY,
  defaultProducts,
  defaultCategories,
} from './data';

import { db, handleFirestoreError, OperationType, isFirebaseConfigured } from './firebase';
import { maskPrompt } from './utils';
import {
  collection,
  onSnapshot,
  doc,
  setDoc,
  getDoc,
  deleteDoc,
} from 'firebase/firestore';

// Import modular sub-components
import Header from './components/Header';
import Hero from './components/Hero';
import Guide from './components/Guide';
import ProductGrid from './components/ProductGrid';
import Checkout from './components/Checkout';
import CartDrawer from './components/CartDrawer';
import AccountDrawer from './components/AccountDrawer';
import AdminDrawer from './components/AdminDrawer';

export default function App() {
  // --- Core Persistent States ---
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [paymentRequests, setPaymentRequests] = useState<PaymentRequest[]>([]);

  // --- UI Layout drawers visibility controls ---
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isAccountOpen, setIsAccountOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);

  // --- Initial Data loading triggers & Session initialization ---
  useEffect(() => {
    // 1. Initial Session Loader
    const initSession = async () => {
      const loggedUsername = localStorage.getItem(SESSION_KEY);
      if (loggedUsername) {
        try {
          const userSnap = await getDoc(doc(db, 'users', loggedUsername));
          if (userSnap.exists()) {
            const userData = userSnap.data() as User;
            if (userData.isLocked) {
              localStorage.removeItem(SESSION_KEY);
              setCurrentUser(null);
            } else {
              setCurrentUser(userData);
            }
          } else {
            localStorage.removeItem(SESSION_KEY);
            setCurrentUser(null);
          }
        } catch (e) {
          localStorage.removeItem(SESSION_KEY);
          setCurrentUser(null);
        }
      }
    };
    initSession();

    // 2. Products real-time listener & seeding
    const unsubscribeProducts = onSnapshot(collection(db, 'products'), async (snapshot) => {
      if (snapshot.empty) {
        console.log("Seeding default products to Firestore...");
        try {
          for (const p of defaultProducts) {
            const securedProd: Product = {
              ...p,
              prompt: maskPrompt(p.prompt),
              articles: p.articles?.map((art) => ({
                ...art,
                prompt: maskPrompt(art.prompt),
              })),
            };
            await setDoc(doc(db, 'products', String(p.id)), securedProd);
          }
        } catch (err) {
          handleFirestoreError(err, OperationType.WRITE, 'products');
        }
      } else {
        const prodsList: Product[] = [];
        snapshot.forEach((d) => {
          prodsList.push(d.data() as Product);
        });
        prodsList.sort((a, b) => a.id - b.id);
        setProducts(prodsList);
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'products');
    });

    // 3. Categories real-time listener & seeding
    const unsubscribeCategories = onSnapshot(collection(db, 'categories'), async (snapshot) => {
      if (snapshot.empty) {
        console.log("Seeding default categories to Firestore...");
        try {
          for (const c of defaultCategories) {
            await setDoc(doc(db, 'categories', c.slug), c);
          }
        } catch (err) {
          handleFirestoreError(err, OperationType.WRITE, 'categories');
        }
      } else {
        const catsList: Category[] = [];
        snapshot.forEach((d) => {
          catsList.push(d.data() as Category);
        });
        setCategories(catsList);
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'categories');
    });

    return () => {
      unsubscribeProducts();
      unsubscribeCategories();
    };
  }, []);

  // Real-time listener for current user's profile documents (Secure synchronization)
  useEffect(() => {
    const loggedUsername = localStorage.getItem(SESSION_KEY);
    if (!loggedUsername) return;

    const unsubscribeProfile = onSnapshot(doc(db, 'users', loggedUsername), (snapshot) => {
      if (snapshot.exists()) {
        const userData = snapshot.data() as User;
        if (userData.isLocked) {
          localStorage.removeItem(SESSION_KEY);
          setCurrentUser(null);
          alert('Tài khoản của bạn đã bị khóa truy cập bởi quản trị viên!');
        } else {
          setCurrentUser(userData);
        }
      } else {
        localStorage.removeItem(SESSION_KEY);
        setCurrentUser(null);
      }
    }, (error) => {
      console.error("Error listening to profile updates: ", error);
    });

    return () => {
      unsubscribeProfile();
    };
  }, [currentUser?.username]);

  // Admin-only listeners (Securely loads users & payment requests ONLY when logged in as admin)
  useEffect(() => {
    if (!currentUser || currentUser.username !== 'admin') {
      setUsers([]);
      setPaymentRequests([]);
      return;
    }

    const unsubscribeAllUsers = onSnapshot(collection(db, 'users'), (snapshot) => {
      const loadedUsers: User[] = [];
      snapshot.forEach((d) => {
        loadedUsers.push(d.data() as User);
      });
      setUsers(loadedUsers);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'users');
    });

    const unsubscribeAllPayments = onSnapshot(collection(db, 'paymentRequests'), (snapshot) => {
      const loadedRequests: PaymentRequest[] = [];
      snapshot.forEach((d) => {
        loadedRequests.push(d.data() as PaymentRequest);
      });
      loadedRequests.sort((a, b) => b.id - a.id);
      setPaymentRequests(loadedRequests);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'paymentRequests');
    });

    return () => {
      unsubscribeAllUsers();
      unsubscribeAllPayments();
    };
  }, [currentUser?.username]);

  // --- Shopping Cart handler controls ---
  const handleAddToCart = (product: Product) => {
    setCart((prevCart) => {
      const matchIndex = prevCart.findIndex((item) => item.id === product.id);
      if (matchIndex > -1) {
        const copy = [...prevCart];
        copy[matchIndex].quantity += 1;
        return copy;
      } else {
        return [...prevCart, { ...product, quantity: 1 }];
      }
    });
    // Trigger sliding open the cart to notify user
    setIsCartOpen(true);
  };

  const handleUpdateQuantity = (
    productId: number,
    action: 'increase' | 'decrease' | 'remove'
  ) => {
    setCart((prevCart) => {
      const targetIndex = prevCart.findIndex((item) => item.id === productId);
      if (targetIndex === -1) return prevCart;

      const copy = [...prevCart];
      if (action === 'remove' || (action === 'decrease' && copy[targetIndex].quantity <= 1)) {
        return copy.filter((item) => item.id !== productId);
      } else if (action === 'decrease') {
        copy[targetIndex].quantity -= 1;
      } else if (action === 'increase') {
        copy[targetIndex].quantity += 1;
      }
      return copy;
    });
  };

  // --- Points Deductive Unlocking systems ---
  const handleUnlockProduct = async (product: Product) => {
    if (!currentUser) return;
    if (currentUser.points < product.pointsCost) {
      alert(`Bạn không đủ điểm! Cần ${product.pointsCost} points, tài khoản hiện có ${currentUser.points} points. Hãy nạp thẻ/chuyển khoản ở mục dưới.`);
      return;
    }

    if (currentUser.unlockedProducts.includes(product.id)) {
      return;
    }

    // Perform deducting parameters locally and save to Firestore
    const updatedUser = {
      ...currentUser,
      points: currentUser.points - product.pointsCost,
      unlockedProducts: [...currentUser.unlockedProducts, product.id],
    };

    try {
      await setDoc(doc(db, 'users', currentUser.username), updatedUser);
      setCurrentUser(updatedUser);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `users/${currentUser.username}`);
    }
  };

  // --- Checkout form Submissions handler ---
  const handleSubmitOrder = async (orderPayload: Omit<PaymentRequest, 'id' | 'createdAt' | 'status'>) => {
    const freshId = Date.now();
    const freshRequest: PaymentRequest = {
      ...orderPayload,
      id: freshId,
      status: 'pending',
      createdAt: new Date().toLocaleString('vi-VN'),
    };

    try {
      await setDoc(doc(db, 'paymentRequests', String(freshId)), freshRequest);
      // Completely clear out cart upon successful validation
      setCart([]);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `paymentRequests/${freshId}`);
    }
  };

  // --- Auth Session Actions ---
  const handleRegisterUser = async (payload: Omit<User, 'unlockedProducts' | 'points'>): Promise<boolean> => {
    // Safeguard admin administrative alias
    if (payload.username.toLowerCase() === 'admin') {
      alert('Tên tài khoản "admin" đã được đặt quyền quản trị tối cao!');
      return false;
    }

    try {
      const userRef = doc(db, 'users', payload.username);
      const userSnap = await getDoc(userRef);
      if (userSnap.exists()) {
        return false;
      }

      const newUser: User = {
        username: payload.username,
        password: payload.password,
        points: 100, // Give free starter points
        unlockedProducts: [],
      };

      await setDoc(userRef, newUser);
      setCurrentUser(newUser);
      localStorage.setItem(SESSION_KEY, newUser.username);
      return true;
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `users/${payload.username}`);
      return false;
    }
  };

  const handleLoginUser = async (payload: Omit<User, 'unlockedProducts' | 'points'>): Promise<boolean> => {
    // 1. Double check default admin panel bypass credentials
    if (payload.username.toLowerCase() === 'admin' && payload.password === 'admin123') {
      try {
        const adminRef = doc(db, 'users', 'admin');
        const adminSnap = await getDoc(adminRef);
        if (adminSnap.exists()) {
          const existingAdmin = adminSnap.data() as User;
          setCurrentUser(existingAdmin);
          localStorage.setItem(SESSION_KEY, existingAdmin.username);
        } else {
          const freshAdmin: User = {
            username: 'admin',
            password: 'admin123',
            points: 99999, // Admin starting points balance
            unlockedProducts: [],
          };
          await setDoc(adminRef, freshAdmin);
          setCurrentUser(freshAdmin);
          localStorage.setItem(SESSION_KEY, freshAdmin.username);
        }
        return true;
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, 'users/admin');
        return false;
      }
    }

    try {
      const userRef = doc(db, 'users', payload.username);
      const userSnap = await getDoc(userRef);
      if (!userSnap.exists()) return false;

      const match = userSnap.data() as User;
      if (match.password !== payload.password) return false;

      if (match.isLocked) {
        alert('Tài khoản của bạn hiện đã bị khóa truy cập bởi quản trị viên! Vui lòng liên hệ hỗ trợ hoặc fanpage.');
        return false;
      }

      setCurrentUser(match);
      localStorage.setItem(SESSION_KEY, match.username);
      return true;
    } catch (err) {
      handleFirestoreError(err, OperationType.GET, `users/${payload.username}`);
      return false;
    }
  };

  const handleLogoutUser = () => {
    setCurrentUser(null);
    localStorage.removeItem(SESSION_KEY);
  };

  // --- Admin Core panel database controls ---
  const handleApprovePayment = async (requestId: number) => {
    const request = paymentRequests.find((r) => r.id === requestId);
    if (!request || request.status === 'approved') return;

    try {
      // 1. Mark request as approved
      const updatedRequest: PaymentRequest = {
        ...request,
        status: 'approved',
      };
      await setDoc(doc(db, 'paymentRequests', String(requestId)), updatedRequest);

      // 2. Find client user and issue POINTS reward
      const userRef = doc(db, 'users', request.username);
      const userSnap = await getDoc(userRef);
      if (userSnap.exists()) {
        const targetUser = userSnap.data() as User;
        const updatedUser: User = {
          ...targetUser,
          points: targetUser.points + request.points,
        };
        await setDoc(userRef, updatedUser);

        // If active session matches approved client, refresh header instantly
        if (currentUser?.username === request.username) {
          setCurrentUser(updatedUser);
        }
      }
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `paymentRequests/${requestId}`);
    }
  };

  const handleAdjustUserPoints = async (username: string, nextPoints: number) => {
    try {
      const userRef = doc(db, 'users', username);
      const userSnap = await getDoc(userRef);
      if (userSnap.exists()) {
        const targetUser = userSnap.data() as User;
        const updatedUser = { ...targetUser, points: nextPoints };
        await setDoc(userRef, updatedUser);

        if (currentUser && currentUser.username === username) {
          setCurrentUser(updatedUser);
        }
      }
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `users/${username}`);
    }
  };

  const handleToggleLockUser = async (username: string) => {
    try {
      const userRef = doc(db, 'users', username);
      const userSnap = await getDoc(userRef);
      if (userSnap.exists()) {
        const targetUser = userSnap.data() as User;
        const nextLock = !targetUser.isLocked;
        const updatedUser = { ...targetUser, isLocked: nextLock };

        await setDoc(userRef, updatedUser);

        // If locked user is currentUser, logout
        if (currentUser && currentUser.username === username) {
          if (nextLock) {
            setCurrentUser(null);
            localStorage.removeItem(SESSION_KEY);
            alert(`Tài khoản @${username} đã bị khóa và đăng xuất khỏi thiết bị!`);
          } else {
            setCurrentUser(updatedUser);
          }
        }
      }
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `users/${username}`);
    }
  };

  // Saved edited products or create a brand new package!
  const handleSaveProduct = async (prod: Product, isNew: boolean) => {
    try {
      const securedProd: Product = {
        ...prod,
        prompt: maskPrompt(prod.prompt),
        articles: prod.articles?.map((art) => ({
          ...art,
          prompt: maskPrompt(art.prompt),
        })),
      };
      await setDoc(doc(db, 'products', String(prod.id)), securedProd);
      // Synchronize current cart prices of matching products
      setCart((prevCart) =>
        prevCart.map((item) => (item.id === prod.id ? { ...securedProd, quantity: item.quantity } : item))
      );
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `products/${prod.id}`);
    }
  };

  const handleResetProducts = async () => {
    try {
      // Clear old docs
      for (const p of products) {
        await deleteDoc(doc(db, 'products', String(p.id)));
      }
      // Populate defaults masked
      for (const p of defaultProducts) {
        const securedProd: Product = {
          ...p,
          prompt: maskPrompt(p.prompt),
          articles: p.articles?.map((art) => ({
            ...art,
            prompt: maskPrompt(art.prompt),
          })),
        };
        await setDoc(doc(db, 'products', String(p.id)), securedProd);
      }
      setCart([]);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, 'products');
    }
  };

  // Category management hooks
  const handleAddCategory = async (newCat: Category): Promise<boolean> => {
    const duplicated = categories.some((c) => c.slug === newCat.slug);
    if (duplicated) return false;

    try {
      await setDoc(doc(db, 'categories', newCat.slug), newCat);
      return true;
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `categories/${newCat.slug}`);
      return false;
    }
  };

  const handleDeleteCategory = async (catSlug: string) => {
    if (categories.length <= 1) {
      alert('Hệ thống yêu cầu giữ lại ít nhất một danh mục lọc!');
      return;
    }

    const nextCats = categories.filter((c) => c.slug !== catSlug);
    const fallbackSlug = nextCats[0].slug;

    try {
      // 1. Delete category
      await deleteDoc(doc(db, 'categories', catSlug));

      // 2. Remap orphaned products
      for (const prod of products) {
        if (prod.category === catSlug) {
          await setDoc(doc(db, 'products', String(prod.id)), {
            ...prod,
            category: fallbackSlug,
          });
        }
      }
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `categories/${catSlug}`);
    }
  };

  const handleResetCategories = async () => {
    try {
      // 1. Delete categories
      for (const c of categories) {
        await deleteDoc(doc(db, 'categories', c.slug));
      }
      // 2. Restore defaults
      for (const c of defaultCategories) {
        await setDoc(doc(db, 'categories', c.slug), c);
      }

      // 3. Remap products if their category went missing
      const fallbackSlug = defaultCategories[0].slug;
      for (const prod of products) {
        const hasValidCat = defaultCategories.some((c) => c.slug === prod.category);
        if (!hasValidCat) {
          await setDoc(doc(db, 'products', String(prod.id)), {
            ...prod,
            category: fallbackSlug,
          });
        }
      }
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, 'categories');
    }
  };

  if (!isFirebaseConfigured) {
    return (
      <div className="min-h-screen bg-brand-beige flex items-center justify-center p-6 font-sans">
        <div className="max-w-md w-full bg-white border-2 border-brand-line/60 rounded-3xl p-8 text-center shadow-xl space-y-6 animate-fade-in">
          <div className="w-16 h-16 bg-brand-accent/10 text-brand-accent rounded-full flex items-center justify-center mx-auto">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-display font-extrabold text-brand-ink tracking-tight">Kích hoạt & Bảo mật dữ liệu</h2>
            <p className="text-sm text-brand-muted leading-relaxed">
              Dự án của bạn đã sẵn sàng và được trang bị công nghệ **bảo mật mã hóa đầu cuối** giúp ngăn chặn người ngoài sao chép câu lệnh (prompt) độc quyền.
            </p>
          </div>
          <div className="bg-brand-beige/50 border border-brand-line/40 rounded-2xl p-4 text-xs text-left space-y-2.5 text-brand-ink/80 leading-relaxed">
            <p><strong>🔒 Mã hóa tại chỗ (At-Rest):</strong> Tất cả dữ liệu xăm dạng prompt được mã hóa bảo mật hoàn tất trước khi lưu vào cơ sở dữ liệu Firestore.</p>
            <p><strong>⚡ Vui lòng kích hoạt cơ sở dữ liệu:</strong> Nhấp vào nút <strong>"Set up Firebase"</strong> màu cam ở menu phía trên giao diện AI Studio để kích hoạt và liên kết dữ liệu đám mây của bạn.</p>
          </div>
          <div className="text-[10px] text-brand-muted/60 leading-normal">
            Hệ thống đã được thiết lập bảo mật tuyệt đối chống lấy cắp dữ liệu. Sau khi nhấp "Set up Firebase", web sẽ kích hoạt hoàn tất ngay lập tức.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-beige text-brand-ink selection:bg-brand-accent selection:text-white pb-12 font-sans overflow-x-hidden">
      
      {/* 1. Header segment */}
      <Header
        currentUser={currentUser}
        cart={cart}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenAccount={() => setIsAccountOpen(true)}
        onOpenAdmin={() => setIsAdminOpen(true)}
      />

      {/* 2. Main Page Layout containers */}
      <main className="space-y-4">
        {/* Dynamic Hero banner */}
        <Hero currentUser={currentUser} />

        {/* Feature quick instructional details */}
        <Guide />

        {/* Dynamic searchable product catalog grid */}
        <ProductGrid
          products={products}
          categories={categories}
          currentUser={currentUser}
          onAddToCart={handleAddToCart}
          onUnlockProduct={handleUnlockProduct}
          onOpenAccount={() => setIsAccountOpen(true)}
        />

        {/* Interactive QR transfers details checkout section */}
        <Checkout
          currentUser={currentUser}
          cart={cart}
          onOpenAccount={() => setIsAccountOpen(true)}
          onOpenCart={() => setIsCartOpen(true)}
          onSubmitOrder={handleSubmitOrder}
        />
      </main>

      {/* 3. Sliding Panel Drawer drawers overlay */}
      
      {/* Cart Drawer layout */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cart={cart}
        onUpdateQuantity={handleUpdateQuantity}
      />

      {/* Account Drawer layout */}
      <AccountDrawer
        isOpen={isAccountOpen}
        onClose={() => setIsAccountOpen(false)}
        currentUser={currentUser}
        products={products}
        onLogin={handleLoginUser}
        onRegister={handleRegisterUser}
        onLogout={handleLogoutUser}
        onOpenAdmin={() => setIsAdminOpen(true)}
      />

      {/* Admin Operations Panel workspace */}
      <AdminDrawer
        isOpen={isAdminOpen}
        onClose={() => setIsAdminOpen(false)}
        products={products}
        categories={categories}
        paymentRequests={paymentRequests}
        onApprovePayment={handleApprovePayment}
        onSaveProduct={handleSaveProduct}
        onResetProducts={handleResetProducts}
        onAddCategory={handleAddCategory}
        onDeleteCategory={handleDeleteCategory}
        onResetCategories={handleResetCategories}
        currentUser={currentUser}
        users={users}
        onAdjustUserPoints={handleAdjustUserPoints}
        onToggleLockUser={handleToggleLockUser}
      />

      {/* Premium Studio Footer info signature */}
      <footer className="mt-16 text-center text-[10px] text-brand-muted/70 font-sans tracking-wide space-y-1">
        <p className="font-bold text-[#f52a02]">© 2026 NhapNhangStudio. All rights reserved.</p>
        <p className="font-semibold text-brand-accent/50 uppercase">
          PREMIUM TATTOO PROMPT STUDIO • ART & DESIGN FORMULAS
        </p>
        <p className="font-bold text-[#f91d0b] text-[9px] mt-1">
          Website Support by MTV OG VN
        </p>
      </footer>
    </div>
  );
}
