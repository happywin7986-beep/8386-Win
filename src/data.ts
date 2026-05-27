/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Product, Category } from './types';

export const defaultProducts: Product[] = [
  {
    id: 1,
    name: "Blackwork Dragon Prompt Pack",
    category: "blackwork",
    tag: "Blackwork",
    price: 149000,
    pointsCost: 149,
    sold: 7380,
    prompt: "blackwork dragon tattoo, forearm placement, clean stencil line art, high contrast ink, negative space, detailed scales --v 6.0",
    description: "Bộ sưu tập 30+ prompt rồng, oni và sinh vật huyền thoại với mảng tối sắc lạnh.",
    image: "https://images.unsplash.com/photo-1598371839696-5c5bb00bdc28?auto=format&fit=crop&w=900&q=80",
    articles: [
      {
        title: "1. Dragon Tattoo Stencil Classic",
        description: "Gợi ý thiết kế rồng cổ điển uốn lượn sắc nét với mảng đen tương phản cao làm nền.",
        prompt: "blackwork dragon tattoo, forearm placement, clean stencil line art, high contrast ink, negative space, detailed scales --v 6.0"
      },
      {
        title: "2. Cyberpunk Oni & Dragon style",
        description: "Sự kết hợp đột phá giữa rồng phong cách Nhật và quỷ dạ xoa mặt nạ Hannya bóng bẩy.",
        prompt: "dark cyberpunk oni dragon style tattoo, heavy ink blackwork, geometric accents, mechanical scales, ultra fine detail --v 6.0"
      },
      {
        title: "3. Geometric Sacred Dragon",
        description: "Hình thiết kế rồng cuộn kết hợp các họa tiết đối xứng tinh xảo đa điểm.",
        prompt: "tribal dragon with sacred geometry background, blackwork pattern, solid black ink, micro realism dotwork --v 6.0"
      }
    ]
  },
  {
    id: 2,
    name: "Minimal Fine Line Pack",
    category: "minimal",
    tag: "Minimal",
    price: 99000,
    pointsCost: 99,
    sold: 5120,
    prompt: "minimal fine line peony tattoo, wrist placement, delicate botanical linework, clean white background, tattoo flash --style raw",
    description: "40 prompt hình xăm phái nữ tinh vi, thanh lịch và tối giản.",
    image: "https://images.unsplash.com/photo-1562962230-16e4623d36e6?auto=format&fit=crop&w=900&q=80",
    articles: [
      {
        title: "1. Classic Peony Wrist Line",
        description: "Hoa mẫu đơn tối giản nét thanh tú, phù hợp cổ tay hoặc xương quai xanh.",
        prompt: "minimal fine line peony tattoo, wrist placement, delicate botanical linework, clean white background, tattoo flash --style raw"
      },
      {
        title: "2. Crescent Moon & Micro Stars",
        description: "Vầng trăng khuyết tinh xảo điểm thêm chòm sao bụi li ti điệu đà.",
        prompt: "dainty miniature crescent moon tattoo with micro stars, fine linework, minimal elegant style, clean black stencil --v 6.0"
      }
    ]
  },
  {
    id: 3,
    name: "Neo Traditional Flash Sheet",
    category: "bundle",
    tag: "Bundle",
    price: 179000,
    pointsCost: 179,
    sold: 2860,
    prompt: "neo traditional tattoo flash sheet, bold colors, dagger, swallow bird, peony flower, vintage tattoo composition --style fine",
    description: "Bộ prompt tạo flash sheet màu đậm: hoa, dao găm, chiêm én, đầu sói.",
    image: "https://images.unsplash.com/photo-1565058379802-bbe93b2f703a?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: 4,
    name: "Japanese Sleeve Prompt Kit",
    category: "blackwork",
    tag: "Blackwork",
    price: 219000,
    pointsCost: 219,
    sold: 804,
    prompt: "japanese sleeve tattoo, koi fish, hannya mask, chrysanthemums, waves, full arm layout, blackwork stencil --v 6.0",
    description: "Prompt full sleeve Nhật cổ: sóng, cá chép, hannya, hoa cúc, bố cục theo tay.",
    image: "https://images.unsplash.com/photo-1611501275019-9b5cda994e8d?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: 5,
    name: "Lettering & Script Prompts",
    category: "minimal",
    tag: "Minimal",
    price: 79000,
    pointsCost: 79,
    sold: 6450,
    prompt: "elegant script lettering tattoo, small quote, clean baseline, thin linework, collarbone placement --v 6.0",
    description: "Prompt chữ, quote ngắn, ngày tháng, tên riêng, script thanh và rõ bố cục.",
    image: "https://images.unsplash.com/photo-1617196034796-73dfa7b1fd56?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: 6,
    name: "Custom Tattoo Prompt 1:1",
    category: "bundle",
    tag: "Custom",
    price: 299000,
    pointsCost: 299,
    sold: 45,
    prompt: "custom tattoo prompt template: subject, placement, size, style, line weight, shading, negative prompt",
    description: "Bạn gửi ý tưởng, mình viết 10 prompt riêng theo vị trí xăm và style mong muốn.",
    image: "https://images.unsplash.com/photo-1541123437800-1bb1317badc2?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: 7,
    name: "Dark Ornamental Pack",
    category: "blackwork",
    tag: "Blackwork",
    price: 159000,
    pointsCost: 159,
    sold: 3910,
    prompt: "dark ornamental tattoo, gothic symmetry, mandala pattern, chest placement, black ink, high contrast stencil --ar 3:4",
    description: "Hoa văn đối xứng, gothic, mandala tối, hợp ngực, lưng và bắp tay.",
    image: "https://images.unsplash.com/photo-1568515045052-f9a854d70bfd?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: 8,
    name: "All Access Prompt Vault",
    category: "bundle",
    tag: "Bundle",
    price: 399000,
    pointsCost: 399,
    sold: 8000,
    prompt: "all access prompt vault: blackwork, minimal, japanese, lettering, ornamental, flash sheet prompt formulas --v 6.0 --s 200",
    description: "120+ prompt, template sửa nhanh, negative prompt và hướng dẫn dùng từng tool.",
    image: "https://images.unsplash.com/photo-1519408469771-2586093c3f14?auto=format&fit=crop&w=900&q=80",
  },
];

export const defaultCategories: Category[] = [
  { name: "Blackwork", slug: "blackwork" },
  { name: "Minimal", slug: "minimal" },
  { name: "Bundle", slug: "bundle" },
];

export const PRODUCTS_KEY = "nhapnhangstudio_products";
export const CATEGORIES_KEY = "nhapnhangstudio_categories";
export const USERS_KEY = "nhapnhangstudio_users";
export const SESSION_KEY = "nhapnhangstudio_session";
export const PAYMENT_REQUESTS_KEY = "nhapnhangstudio_payment_requests";

export function getStoredProducts(): Product[] {
  const data = localStorage.getItem(PRODUCTS_KEY);
  if (!data) return [...defaultProducts];
  try {
    const parsed = JSON.parse(data);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : [...defaultProducts];
  } catch {
    return [...defaultProducts];
  }
}

export function saveStoredProducts(products: Product[]) {
  localStorage.setItem(PRODUCTS_KEY, JSON.stringify(products));
}

export function getStoredCategories(): Category[] {
  const data = localStorage.getItem(CATEGORIES_KEY);
  if (!data) return [...defaultCategories];
  try {
    const parsed = JSON.parse(data);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : [...defaultCategories];
  } catch {
    return [...defaultCategories];
  }
}

export function saveStoredCategories(categories: Category[]) {
  localStorage.setItem(CATEGORIES_KEY, JSON.stringify(categories));
}

export function formatVND(value: number): string {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(value).replace("₫", "đ");
}
