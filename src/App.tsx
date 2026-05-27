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
    if (!isFirebaseConfigured) {
      // 1. Initial Session Loader
      const loggedUsername = localStorage.getItem(SESSION_KEY);
      if (loggedUsername) {
        const storedUsers = localStorage.getItem('local_users');
        const localUsersList: User[] = storedUsers ? JSON.parse(storedUsers) : [];
        const match = localUsersList.find((u) => u.username === loggedUsername);
        if (match) {
          if (match.isLocked) {
            localStorage.removeItem(SESSION_KEY);
            setCurrentUser(null);
          } else {
            setCurrentUser(match);
          }
        } else if (loggedUsername.toLowerCase() === 'admin') {
          const defaultAdmin: User = {
            username: 'admin',
            password: 'admin123',
            points: 99999,
            unlockedProducts: [],
          };
          setCurrentUser(defaultAdmin);
        } else {
          localStorage.removeItem(SESSION_KEY);
          setCurrentUser(null);
        }
      }

      // 2. Load products from localStorage or defaults
      const storedProds = localStorage.getItem('local_products');
      if (storedProds) {
        let parsedList: Product[] = JSON.parse(storedProds);
        parsedList = parsedList.map((p) => {
          if (p.id === 7 && (!p.image || p.image.includes('1590246814883-57c511f124fd'))) {
            return {
              ...p,
              image: 'https://images.unsplash.com/photo-1560707303-4e980c87f847?auto=format&fit=crop&w=900&q=80',
            };
          }
          return p;
        });
        setProducts(parsedList);
        localStorage.setItem('local_products', JSON.stringify(parsedList));
      } else {
        const seededProds = defaultProducts.map((p) => ({
          ...p,
          prompt: maskPrompt(p.prompt),
          articles: p.articles?.map((art) => ({
            ...art,
            prompt: maskPrompt(art.prompt),
          })),
        }));
        setProducts(seededProds);
        localStorage.setItem('local_products', JSON.stringify(seededProds));
      }

      // 3. Load categories from localStorage or defaults
      const storedCats = localStorage.getItem('local_categories');
      if (storedCats) {
        setCategories(JSON.parse(storedCats));
      } else {
        setCategories(defaultCategories);
        localStorage.setItem('local_categories', JSON.stringify(defaultCategories));
      }
      return;
    }

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
          const p = d.data() as Product;
          if (p.id === 7 && (!p.image || p.image.includes('1590246814883-57c511f124fd'))) {
            p.image = 'https://images.unsplash.com/photo-1560707303-4e980c87f847?auto=format&fit=crop&w=900&q=80';
          }
          prodsList.push(p);
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
    if (!isFirebaseConfigured) return;

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

    if (!isFirebaseConfigured) {
      const storedUsers = localStorage.getItem('local_users');
      setUsers(storedUsers ? JSON.parse(storedUsers) : []);
      const storedPayments = localStorage.getItem('local_payments');
      setPaymentRequests(storedPayments ? JSON.parse(storedPayments) : []);
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

    const updatedUser = {
      ...currentUser,
      points: currentUser.points - product.pointsCost,
      unlockedProducts: [...currentUser.unlockedProducts, product.id],
    };

    if (!isFirebaseConfigured) {
      setCurrentUser(updatedUser);
      const storedUsers = localStorage.getItem('local_users');
      const localUsersList: User[] = storedUsers ? JSON.parse(storedUsers) : [];
      const updatedList = localUsersList.map(u => u.username === updatedUser.username ? updatedUser : u);
      if (!updatedList.some(u => u.username === updatedUser.username)) {
        updatedList.push(updatedUser);
      }
      localStorage.setItem('local_users', JSON.stringify(updatedList));
      return;
    }

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

    if (!isFirebaseConfigured) {
      const storedPayments = localStorage.getItem('local_payments');
      const localPaymentsList: PaymentRequest[] = storedPayments ? JSON.parse(storedPayments) : [];
      const updatedList = [freshRequest, ...localPaymentsList];
      localStorage.setItem('local_payments', JSON.stringify(updatedList));
      setPaymentRequests(updatedList);
      setCart([]);
      return;
    }

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

    if (!isFirebaseConfigured) {
      const storedUsers = localStorage.getItem('local_users');
      const localUsersList: User[] = storedUsers ? JSON.parse(storedUsers) : [];
      if (localUsersList.some(u => u.username.toLowerCase() === payload.username.toLowerCase())) {
        return false;
      }
      const newUser: User = {
        username: payload.username,
        password: payload.password,
        points: 100, // Give free starter points
        unlockedProducts: [],
      };
      localUsersList.push(newUser);
      localStorage.setItem('local_users', JSON.stringify(localUsersList));
      setCurrentUser(newUser);
      localStorage.setItem(SESSION_KEY, newUser.username);
      return true;
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
      if (!isFirebaseConfigured) {
        const defaultAdmin: User = {
          username: 'admin',
          password: 'admin123',
          points: 99999, // Admin starting points balance
          unlockedProducts: [],
        };
        setCurrentUser(defaultAdmin);
        localStorage.setItem(SESSION_KEY, defaultAdmin.username);
        return true;
      }
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

    if (!isFirebaseConfigured) {
      const storedUsers = localStorage.getItem('local_users');
      const localUsersList: User[] = storedUsers ? JSON.parse(storedUsers) : [];
      const match = localUsersList.find(u => u.username === payload.username);
      if (!match || match.password !== payload.password) return false;

      if (match.isLocked) {
        alert('Tài khoản của bạn hiện đã bị khóa truy cập bởi quản trị viên! Vui lòng liên hệ hỗ trợ hoặc fanpage.');
        return false;
      }

      setCurrentUser(match);
      localStorage.setItem(SESSION_KEY, match.username);
      return true;
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

    if (!isFirebaseConfigured) {
      // 1. Mark status approved local
      const storedPayments = localStorage.getItem('local_payments');
      const localList: PaymentRequest[] = storedPayments ? JSON.parse(storedPayments) : [];
      const updatedList = localList.map(r => r.id === requestId ? { ...r, status: 'approved' as const } : r);
      localStorage.setItem('local_payments', JSON.stringify(updatedList));
      setPaymentRequests(updatedList);

      // 2. Adjust points locally
      const storedUsers = localStorage.getItem('local_users');
      const localUsersList: User[] = storedUsers ? JSON.parse(storedUsers) : [];
      const userMatch = localUsersList.find(u => u.username === request.username);
      if (userMatch) {
        const updatedUser = { ...userMatch, points: userMatch.points + request.points };
        const updatedUsersList = localUsersList.map(u => u.username === request.username ? updatedUser : u);
        localStorage.setItem('local_users', JSON.stringify(updatedUsersList));
        setUsers(updatedUsersList);
        if (currentUser?.username === request.username) {
          setCurrentUser(updatedUser);
        }
      }
      return;
    }

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
    if (!isFirebaseConfigured) {
      const storedUsers = localStorage.getItem('local_users');
      const localUsersList: User[] = storedUsers ? JSON.parse(storedUsers) : [];
      const userMatch = localUsersList.find(u => u.username === username);
      if (userMatch) {
        const updatedUser = { ...userMatch, points: nextPoints };
        const updatedUsersList = localUsersList.map(u => u.username === username ? updatedUser : u);
        localStorage.setItem('local_users', JSON.stringify(updatedUsersList));
        setUsers(updatedUsersList);
        if (currentUser && currentUser.username === username) {
          setCurrentUser(updatedUser);
        }
      }
      return;
    }

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
    if (!isFirebaseConfigured) {
      const storedUsers = localStorage.getItem('local_users');
      const localUsersList: User[] = storedUsers ? JSON.parse(storedUsers) : [];
      const userMatch = localUsersList.find(u => u.username === username);
      if (userMatch) {
        const nextLock = !userMatch.isLocked;
        const updatedUser = { ...userMatch, isLocked: nextLock };
        const updatedUsersList = localUsersList.map(u => u.username === username ? updatedUser : u);
        localStorage.setItem('local_users', JSON.stringify(updatedUsersList));
        setUsers(updatedUsersList);

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
      return;
    }

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
    const securedProd: Product = {
      ...prod,
      sold: Math.min(3000000, prod.sold || 0),
      prompt: maskPrompt(prod.prompt),
      articles: prod.articles?.map((art) => ({
        ...art,
        prompt: maskPrompt(art.prompt),
      })),
    };

    if (!isFirebaseConfigured) {
      const updatedProds = products.map((item) => (item.id === prod.id ? securedProd : item));
      if (!products.some((item) => item.id === prod.id)) {
        updatedProds.push(securedProd);
      }
      updatedProds.sort((a, b) => a.id - b.id);
      setProducts(updatedProds);
      localStorage.setItem('local_products', JSON.stringify(updatedProds));
      setCart((prevCart) =>
        prevCart.map((item) => (item.id === prod.id ? { ...securedProd, quantity: item.quantity } : item))
      );
      return;
    }

    try {
      await setDoc(doc(db, 'products', String(prod.id)), securedProd);
      // Update state locally instantly to ensure immediate UI synchronization on save
      setProducts((prev) => {
        const updated = prev.map((item) => (item.id === prod.id ? securedProd : item));
        if (!prev.some((item) => item.id === prod.id)) {
          updated.push(securedProd);
        }
        return updated.sort((a, b) => a.id - b.id);
      });
      // Synchronize current cart prices of matching products
      setCart((prevCart) =>
        prevCart.map((item) => (item.id === prod.id ? { ...securedProd, quantity: item.quantity } : item))
      );
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `products/${prod.id}`);
    }
  };

  const handleDeleteProduct = async (productId: number) => {
    if (products.length <= 1) {
      alert('Hệ thống yêu cầu giữ lại ít nhất một sản phẩm!');
      return;
    }

    if (!isFirebaseConfigured) {
      const updatedProds = products.filter((item) => item.id !== productId);
      setProducts(updatedProds);
      localStorage.setItem('local_products', JSON.stringify(updatedProds));
      setCart((prevCart) => prevCart.filter((item) => item.id !== productId));
      return;
    }

    try {
      await deleteDoc(doc(db, 'products', String(productId)));
      // Update state locally instantly to ensure immediate UI synchronization on delete
      setProducts((prev) => prev.filter((item) => item.id !== productId));
      setCart((prevCart) => prevCart.filter((item) => item.id !== productId));
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `products/${productId}`);
    }
  };

  const handleResetProducts = async () => {
    const securedDefaults = defaultProducts.map((p) => ({
      ...p,
      prompt: maskPrompt(p.prompt),
      articles: p.articles?.map((art) => ({
        ...art,
        prompt: maskPrompt(art.prompt),
      })),
    }));

    if (!isFirebaseConfigured) {
      setProducts(securedDefaults);
      localStorage.setItem('local_products', JSON.stringify(securedDefaults));
      setCart([]);
      return;
    }

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

    if (!isFirebaseConfigured) {
      const updatedCats = [...categories, newCat];
      setCategories(updatedCats);
      localStorage.setItem('local_categories', JSON.stringify(updatedCats));
      return true;
    }

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

    if (!isFirebaseConfigured) {
      setCategories(nextCats);
      localStorage.setItem('local_categories', JSON.stringify(nextCats));
      const updatedProds = products.map((prod) => {
        if (prod.category === catSlug) {
          return { ...prod, category: fallbackSlug };
        }
        return prod;
      });
      setProducts(updatedProds);
      localStorage.setItem('local_products', JSON.stringify(updatedProds));
      return;
    }

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
    if (!isFirebaseConfigured) {
      setCategories(defaultCategories);
      localStorage.setItem('local_categories', JSON.stringify(defaultCategories));
      const fallbackSlug = defaultCategories[0].slug;
      const updatedProds = products.map((prod) => {
        const hasValidCat = defaultCategories.some((c) => c.slug === prod.category);
        if (!hasValidCat) {
          return { ...prod, category: fallbackSlug };
        }
        return prod;
      });
      setProducts(updatedProds);
      localStorage.setItem('local_products', JSON.stringify(updatedProds));
      return;
    }

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
        onDeleteProduct={handleDeleteProduct}
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
