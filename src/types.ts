/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface ProductArticle {
  title: string;
  description: string;
  prompt: string;
  imageUrl?: string;
  videoUrl?: string;
}

export interface Product {
  id: number;
  name: string;
  category: string;
  tag: string;
  price: number;
  pointsCost: number;
  sold: number;
  prompt: string;
  description: string;
  image: string;
  articles?: ProductArticle[];
}

export interface Category {
  name: string;
  slug: string;
}

export interface User {
  username: string;
  password?: string;
  points: number;
  unlockedProducts: number[]; // Product IDs
  isLocked?: boolean;
}

export interface CartItem extends Product {
  quantity: number;
}

export interface PaymentRequest {
  id: number;
  orderCode: string;
  username: string;
  quantity: number;
  total: number;
  points: number;
  receipt: string; // Base64 image
  status: 'pending' | 'approved';
  createdAt: string;
}
