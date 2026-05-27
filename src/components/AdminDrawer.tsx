/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Product, Category, PaymentRequest, User } from '../types';
import { X, Key, ShieldAlert, CheckCircle2, FileEdit, Plus, Trash2, FolderEdit, Undo2, Users, Lock, Unlock, Eye, EyeOff, Image as ImageIcon } from 'lucide-react';
import { formatVND } from '../data';
import { unmaskPrompt } from '../utils';

interface AdminDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  categories: Category[];
  paymentRequests: PaymentRequest[];
  onApprovePayment: (requestId: number) => void;
  onSaveProduct: (product: Product, isNew: boolean) => void;
  onResetProducts: () => void;
  onAddCategory: (category: Category) => boolean | Promise<boolean>;
  onDeleteCategory: (slug: string) => void;
  onResetCategories: () => void;
  currentUser: User | null;
  users: User[];
  onAdjustUserPoints: (username: string, nextPoints: number) => void;
  onToggleLockUser: (username: string) => void;
  onDeleteProduct: (id: number) => void;
}

export default function AdminDrawer({
  isOpen,
  onClose,
  products,
  categories,
  paymentRequests,
  onApprovePayment,
  onSaveProduct,
  onResetProducts,
  onAddCategory,
  onDeleteCategory,
  onResetCategories,
  currentUser,
  users = [],
  onAdjustUserPoints,
  onToggleLockUser,
  onDeleteProduct,
}: AdminDrawerProps) {
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [visiblePasswords, setVisiblePasswords] = useState<Record<string, boolean>>({});
  
  // Selected tab helper
  const [activeTab, setActiveTab] = useState<'approvals' | 'products' | 'categories' | 'users'>('approvals');

  // Product edit states
  const [editingProductId, setEditingProductId] = useState<number>(products[0]?.id || 1);
  const [productFormName, setProductFormName] = useState('');
  const [productFormCategory, setProductFormCategory] = useState('');
  const [productFormTag, setProductFormTag] = useState('');
  const [productFormPrice, setProductFormPrice] = useState(0);
  const [productFormPoints, setProductFormPoints] = useState(0);
  const [productFormSold, setProductFormSold] = useState(0);
  const [productFormImage, setProductFormImage] = useState('');
  const [productFormPrompt, setProductFormPrompt] = useState('');
  const [productFormDescription, setProductFormDescription] = useState('');
  
  // Multiple articles support
  const [productFormArticles, setProductFormArticles] = useState<any[]>([]);
  const [editingArticleIdx, setEditingArticleIdx] = useState<number | null>(null);
  const [articleTitleInput, setArticleTitleInput] = useState('');
  const [articleDescInput, setArticleDescInput] = useState('');
  const [articlePromptInput, setArticlePromptInput] = useState('');
  const [articleImageUrlInput, setArticleImageUrlInput] = useState('');
  const [articleVideoUrlInput, setArticleVideoUrlInput] = useState('');

  const handleArticleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setArticleImageUrlInput(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  // Category states
  const [newCatName, setNewCatName] = useState('');
  const [newCatSlug, setNewCatSlug] = useState('');
  const [catMsg, setCatMsg] = useState('');

  // Notification feedbacks
  const [productFormMsg, setProductFormMsg] = useState('');

  // Populate products parameters into editor fields
  const loadProductToForm = (id: number) => {
    setEditingProductId(id);
    setEditingArticleIdx(null);
    setArticleTitleInput('');
    setArticleDescInput('');
    setArticlePromptInput('');
    setArticleImageUrlInput('');
    setArticleVideoUrlInput('');
    const prod = products.find((p) => p.id === id);
    if (prod) {
      setProductFormName(prod.name);
      setProductFormCategory(prod.category);
      setProductFormTag(prod.tag);
      setProductFormPrice(prod.price);
      setProductFormPoints(prod.pointsCost);
      setProductFormSold(prod.sold);
      setProductFormImage(prod.image);
      setProductFormPrompt(unmaskPrompt(prod.prompt));
      setProductFormDescription(prod.description);
      setProductFormArticles(
        (prod.articles || []).map((art) => ({
          ...art,
          prompt: unmaskPrompt(art.prompt),
        }))
      );
    }
  };

  // Sync admin login status
  useEffect(() => {
    if (currentUser?.username.toLowerCase() === 'admin') {
      setIsAdminLoggedIn(true);
    } else {
      setIsAdminLoggedIn(false);
    }
  }, [currentUser]);

  // Initial form loading when drawer opens or admin logs in
  useEffect(() => {
    if (isOpen && isAdminLoggedIn && products.length > 0) {
      const currentExists = products.some((p) => p.id === editingProductId);
      if (!currentExists && editingProductId !== -999) {
        loadProductToForm(products[0].id);
      }
    }
  }, [isOpen, isAdminLoggedIn, products, editingProductId]);

  if (!isOpen) return null;

  // Login handler
  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    if (password === 'admin123') {
      setIsAdminLoggedIn(true);
      // Populate first product details info
      if (products.length > 0) {
        loadProductToForm(products[0].id);
      }
    } else {
      setLoginError('Sai mật khẩu! Mật khẩu mặc định demo là: admin123');
    }
  };

  // Convert uploaded details image to base64
  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setProductFormImage(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  // Save product form handler (supports edit or creating new)
  const handleProductSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setProductFormMsg('');

    const targetId = editingProductId;
    const isNew = targetId === -999; // -999 as sentinel for new item insertion
    const resolvedId = isNew ? Date.now() : targetId;

    const payload: Product = {
      id: resolvedId,
      name: productFormName.trim(),
      category: productFormCategory,
      tag: productFormTag.trim(),
      price: Number(productFormPrice),
      pointsCost: Number(productFormPoints),
      sold: Math.min(3000000, Number(productFormSold)),
      image: productFormImage,
      prompt: productFormPrompt.trim(),
      description: productFormDescription.trim(),
      articles: productFormArticles,
    };

    onSaveProduct(payload, isNew);
    setProductFormMsg('Nhật ký: Đã lưu thông tin sản phẩm thành công!');
    // Tự động tải lại form để đồng bộ chính xác với master list
    setTimeout(() => {
      loadProductToForm(resolvedId);
    }, 50);
  };

  // Create new template setup trigger
  const triggerCreateNewProduct = () => {
    setEditingProductId(-999);
    setEditingArticleIdx(null);
    setProductFormName('Gói thiết kế mới');
    setProductFormCategory(categories[0]?.slug || 'blackwork');
    setProductFormTag('Custom');
    setProductFormPrice(150000);
    setProductFormPoints(150);
    setProductFormSold(45);
    setProductFormImage('https://images.unsplash.com/photo-1560707303-4e980c87f847?auto=format&fit=crop&w=900&q=80');
    setProductFormPrompt('midjourney prompt xăm nghệ thuật ...');
    setProductFormDescription('Mô tả ngắn gọn về gói xăm mới tạo.');
    setProductFormArticles([]);
    setArticleTitleInput('');
    setArticleDescInput('');
    setArticlePromptInput('');
    setArticleImageUrlInput('');
    setArticleVideoUrlInput('');
    setProductFormMsg('');
  };

  // Add custom design category
  const handleCategorySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCatMsg('');

    const slug = newCatSlug.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-');
    if (!slug) {
      setCatMsg('Lỗi: Slug không hợp lệ.');
      return;
    }

    const payload: Category = {
      name: newCatName.trim(),
      slug,
    };

    const success = await onAddCategory(payload);
    if (success) {
      setCatMsg(`Đã thêm thành công danh mục ${newCatName}!`);
      setNewCatName('');
      setNewCatSlug('');
    } else {
      setCatMsg('Lỗi: Danh mục trùng lặp hoặc đã tồn tại.');
    }
  };

  // Filter pending lists
  const pendingBills = paymentRequests.filter((r) => r.status === 'pending');

  return (
    <aside className="fixed inset-0 z-50 flex justify-end animate-fade-in" aria-hidden={!isOpen}>
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-brand-ink/40 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Slide body */}
      <section className="relative w-full max-w-xl h-full bg-white shadow-2xl flex flex-col z-10 animate-slide-in overflow-hidden">
        
        {/* Header segment */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-brand-line/80">
          <div className="space-y-0.5">
            <h2 className="font-display font-extrabold text-lg text-brand-ink flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-brand-accent" />
              <span>Quản Trị Nhóm Studio (Admin)</span>
            </h2>
            <p className="text-[10px] text-brand-muted tracking-wide font-sans">
              Công cụ phê duyệt hóa đơn ngân hàng và cập nhật danh sản phẩm.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 px-1.5 rounded-lg bg-brand-beige border border-brand-line/60 hover:text-brand-accent transition-colors font-bold cursor-pointer"
            aria-label="Đóng admin panel"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Dynamic Inner displays */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {!isAdminLoggedIn ? (
            /* ADMIN LOGIN SCREEN */
            <form onSubmit={handleAdminLogin} className="space-y-4 max-w-md mx-auto pt-8">
              <div className="text-center space-y-2 pb-4">
                <span className="text-3xl">🔑</span>
                <p className="text-xs text-brand-muted leading-relaxed font-sans">
                  Nhập mật khẩu demo để cấp quyền truy cập hệ thống quản trị hóa đơn & sản phẩm.
                </p>
              </div>

              <label className="flex flex-col space-y-1.5 text-xs font-extrabold text-brand-ink/90">
                <span>Mật khẩu Admin</span>
                <input
                  type="password"
                  placeholder="Mật khẩu demo: admin123"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="px-3.5 py-3 border border-brand-line rounded-lg bg-brand-beige/25 outline-0 focus:border-brand-accent text-xs font-sans font-medium"
                />
              </label>

              {loginError && (
                <p className="text-xs text-brand-danger font-semibold bg-red-50 p-2.5 rounded-lg border border-red-200">
                  {loginError}
                </p>
              )}

              <button
                type="submit"
                className="w-full inline-flex items-center justify-center py-3 bg-brand-accent hover:bg-brand-accent-dark text-white font-extrabold text-xs rounded-xl tracking-tight transition-all cursor-pointer shadow"
              >
                Vào Bảng Quản Trị
              </button>
            </form>
          ) : (
            /* ADMIN CONTAINER PANELS WORKSPACE */
            <div className="space-y-6">
              
              {/* Tab options controllers */}
              <div className="flex flex-wrap border-b border-brand-line/60 pb-1 gap-1 md:gap-2 text-[11px] md:text-xs font-bold text-brand-muted">
                <button
                  onClick={() => setActiveTab('approvals')}
                  className={`px-3 md:px-4 py-2 border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
                    activeTab === 'approvals'
                      ? 'border-brand-accent text-brand-accent'
                      : 'border-transparent hover:text-brand-ink'
                  }`}
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Duyệt Bill ({pendingBills.length})
                </button>

                <button
                  onClick={() => {
                    setActiveTab('products');
                    if (products.length > 0) {
                      loadProductToForm(products[0].id);
                    }
                  }}
                  className={`px-3 md:px-4 py-2 border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
                    activeTab === 'products'
                      ? 'border-brand-accent text-brand-accent'
                      : 'border-transparent hover:text-brand-ink'
                  }`}
                >
                  <FileEdit className="w-3.5 h-3.5" />
                  Sản Phẩm ({products.length})
                </button>

                <button
                  onClick={() => setActiveTab('categories')}
                  className={`px-3 md:px-4 py-2 border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
                    activeTab === 'categories'
                      ? 'border-brand-accent text-brand-accent'
                      : 'border-transparent hover:text-brand-ink'
                  }`}
                >
                  <FolderEdit className="w-3.5 h-3.5" />
                  Danh Mục ({categories.length})
                </button>

                <button
                  onClick={() => setActiveTab('users')}
                  className={`px-3 md:px-4 py-2 border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
                    activeTab === 'users'
                      ? 'border-brand-accent text-brand-accent'
                      : 'border-transparent hover:text-brand-ink'
                  }`}
                >
                  <Users className="w-3.5 h-3.5" />
                  Thành viên ({users.length})
                </button>
              </div>

              {/* VIEW 1: RECEIPTS APPROVALS LIST */}
              {activeTab === 'approvals' && (
                <div className="space-y-4">
                  <div className="space-y-1">
                    <h3 className="font-display font-extrabold text-sm text-brand-ink">
                      Danh sách hóa đơn chờ duyệt
                    </h3>
                    <p className="text-[10px] text-brand-muted font-sans text-left">
                      Nhấp duyệt khi tài khoản ngân hàng của bạn đã nhận đủ số tiền ghi trên bill.
                    </p>
                  </div>

                  {pendingBills.length === 0 ? (
                    <div className="p-8 border border-dashed border-brand-line rounded-xl text-center text-brand-muted text-xs font-sans">
                      Hiện tại chưa có hóa đơn thanh toán nào đang chờ phê duyệt.
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {pendingBills.map((req) => (
                        <article
                          key={req.id}
                          className="p-4 border border-brand-line rounded-xl bg-[#faf9f6] space-y-3 shadow-xs font-sans"
                        >
                          <div className="flex justify-between items-start text-xs">
                            <div className="space-y-1">
                              <p className="font-bold text-brand-ink">
                                Mã GD: <span className="font-mono text-brand-accent text-sm font-black">{req.orderCode}</span>
                              </p>
                              <p className="text-[11px] text-brand-muted">
                                Thành viên: <strong>@{req.username}</strong> | Ngày gửi: {req.createdAt}
                              </p>
                            </div>
                            <span className="font-bold text-[11px] bg-amber-50 text-amber-700 px-2 py-0.5 rounded border border-amber-200 uppercase tracking-wider">
                              Pending
                            </span>
                          </div>

                          <div className="p-3 bg-white rounded-lg border border-brand-line/60 grid grid-cols-2 gap-4 text-xs font-sans">
                            <div>
                              <p className="text-brand-muted">Tổng số lượng:</p>
                              <strong className="text-brand-ink text-sm font-bold">{req.quantity} gói</strong>
                            </div>
                            <div>
                              <p className="text-brand-muted">Số tiền chuyển:</p>
                              <strong className="text-brand-accent text-sm font-extrabold">{formatVND(req.total)}</strong>
                            </div>
                            <div className="col-span-2">
                              <p className="text-brand-muted">Points yêu cầu nạp:</p>
                              <strong className="text-brand-gold text-sm font-black">+{req.points} Points Gốc</strong>
                            </div>
                          </div>

                          {/* Invoice Image attachment screenshot */}
                          <div className="space-y-1">
                            <span className="text-[10px] font-bold text-brand-muted block">
                              Màn hình biên lai thanh toán thành công:
                            </span>
                            <div className="bg-white border rounded-lg p-2 max-h-56 overflow-auto">
                              <img
                                src={req.receipt}
                                alt={`Bill ${req.orderCode}`}
                                className="w-full object-contain max-h-48 rounded"
                              />
                            </div>
                          </div>

                          <button
                            onClick={() => onApprovePayment(req.id)}
                            className="w-full py-2 bg-brand-accent hover:bg-brand-accent-dark text-white font-bold text-xs rounded-lg shadow transition-colors cursor-pointer"
                          >
                            Xác Nhận Đã Nhận Đủ - Duyệt Cộng {req.points} Điểm
                          </button>
                        </article>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* VIEW 2: PRODUCTS CREATOR/EDITOR */}
              {activeTab === 'products' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between gap-3 flex-wrap">
                    <label className="flex items-center gap-2 text-xs font-bold text-brand-ink/90 flex-1">
                      <span>Chọn gói xăm:</span>
                      <select
                        value={editingProductId}
                        onChange={(e) => loadProductToForm(Number(e.target.value))}
                        className="p-1 px-2 border border-brand-line bg-white text-xs font-semibold rounded-lg flex-1 cursor-pointer outline-none"
                      >
                        {products.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.name}
                          </option>
                        ))}
                      </select>
                    </label>

                    <button
                      type="button"
                      onClick={triggerCreateNewProduct}
                      className="px-3 py-1.5 bg-brand-ink hover:bg-brand-accent text-white rounded-lg text-xs font-extrabold shadow flex items-center gap-1 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Thêm Mới</span>
                    </button>
                  </div>

                  {/* Core Form editors element */}
                  <form onSubmit={handleProductSubmit} className="space-y-3.5 p-4 border border-brand-line bg-[#faf9f6] rounded-xl text-xs">
                    <div className="font-bold text-brand-ink text-sm pb-1 border-b border-brand-line flex items-center justify-between">
                      <span>{editingProductId === -999 ? '➕ Thêm Gói Mới' : `📝 Sửa: #${editingProductId}`}</span>
                      {editingProductId !== -999 && (
                        <span className="text-[10px] font-sans font-normal text-brand-muted">
                          id gốc: {editingProductId}
                        </span>
                      )}
                    </div>

                    <label className="flex flex-col space-y-1 font-bold text-brand-ink/90">
                      <span>Tên gói prompt xăm</span>
                      <input
                        type="text"
                        required
                        value={productFormName}
                        onChange={(e) => setProductFormName(e.target.value)}
                        className="p-2 border border-brand-line bg-white rounded-lg outline-none font-sans"
                      />
                    </label>

                    <div className="grid grid-cols-2 gap-3">
                      <label className="flex flex-col space-y-1 font-bold text-brand-ink/90">
                        <span>Danh mục lọc</span>
                        <select
                          value={productFormCategory}
                          onChange={(e) => setProductFormCategory(e.target.value)}
                          className="p-2 border border-brand-line bg-white rounded-lg outline-none cursor-pointer"
                        >
                          {categories.map((c, i) => (
                            <option key={i} value={c.slug}>
                              {c.name}
                            </option>
                          ))}
                        </select>
                      </label>

                      <label className="flex flex-col space-y-1 font-bold text-brand-ink/90">
                        <span>Nhãn hiển thị (Tag)</span>
                        <input
                          type="text"
                          required
                          value={productFormTag}
                          onChange={(e) => setProductFormTag(e.target.value)}
                          className="p-2 border border-brand-line bg-white rounded-lg outline-none font-sans"
                        />
                      </label>
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                      <label className="flex flex-col space-y-1 font-bold text-brand-ink/90">
                        <span>Giá tiền bán (VNĐ)</span>
                        <input
                          type="number"
                          required
                          value={productFormPrice}
                          onChange={(e) => setProductFormPrice(Number(e.target.value))}
                          className="p-2 border border-brand-line bg-white rounded-lg outline-none font-mono"
                        />
                      </label>

                      <label className="flex flex-col space-y-1 font-bold text-brand-ink/90">
                        <span>Số điềm để unlock</span>
                        <input
                          type="number"
                          required
                          value={productFormPoints}
                          onChange={(e) => setProductFormPoints(Number(e.target.value))}
                          className="p-2 border border-brand-line bg-white rounded-lg outline-none font-mono"
                        />
                      </label>

                      <label className="flex flex-col space-y-1 font-bold text-brand-ink/90">
                        <span>Lượt mua ảo</span>
                        <input
                          type="number"
                          required
                          max={3000000}
                          value={productFormSold}
                          onChange={(e) => {
                            const val = Number(e.target.value);
                            setProductFormSold(val > 3000000 ? 3000000 : val);
                          }}
                          className="p-2 border border-brand-line bg-white rounded-lg outline-none font-mono"
                        />
                        <span className="text-[10px] text-brand-muted/80 font-normal">
                          Tối đa 3.000.000 lượt mua
                        </span>
                      </label>
                    </div>

                    {/* Image selector */}
                    <div className="space-y-1.5 font-bold text-brand-ink">
                      <span>Ảnh minh họa</span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <label className="flex flex-col space-y-1 text-[10px] text-brand-muted">
                          <span>Url ảnh Online</span>
                          <input
                            type="url"
                            value={productFormImage}
                            onChange={(e) => setProductFormImage(e.target.value)}
                            className="p-1 px-2 border border-brand-line bg-white rounded-md text-brand-ink outline-none"
                          />
                        </label>
                        
                        <label className="flex flex-col space-y-1 text-[10px] text-brand-muted relative bg-brand-line/20 hover:bg-brand-line/45 p-1 rounded-md text-center justify-center cursor-pointer min-h-[46px] border border-dashed border-brand-line mt-4">
                          <span className="flex items-center justify-center gap-1 font-sans">
                            <ImageIcon className="w-3.5 h-3.5" /> Chọn từ file máy
                          </span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageFileChange}
                            className="absolute inset-0 opacity-0 cursor-pointer"
                          />
                        </label>
                      </div>
                    </div>

                    <label className="flex flex-col space-y-1 font-bold text-brand-ink/90">
                      <span>Mô tả ngắn hình xăm</span>
                      <textarea
                        required
                        rows={2}
                        value={productFormDescription}
                        onChange={(e) => setProductFormDescription(e.target.value)}
                        className="p-2 border border-brand-line bg-white rounded-lg outline-none font-sans font-medium resize-y"
                      />
                    </label>

                    <label className="flex flex-col space-y-1 font-bold text-brand-ink/90">
                      <span>Công thức Midjourney / Imagine Prompt</span>
                      <textarea
                        required
                        rows={2}
                        value={productFormPrompt}
                        onChange={(e) => setProductFormPrompt(e.target.value)}
                        className="p-2 border border-brand-line bg-white rounded-lg outline-none font-mono font-medium resize-y"
                      />
                    </label>

                    {/* Nested Articles Editor Block */}
                    <div className="p-3 bg-brand-beige/50 border border-brand-line rounded-xl space-y-3">
                      <div className="flex justify-between items-center pb-2 border-b border-brand-line/60">
                        <span className="font-extrabold text-[10.5px] text-brand-ink uppercase tracking-tight">
                          Danh sách bài viết phụ trong gói ({productFormArticles.length})
                        </span>
                        <span className="text-[10px] text-brand-muted">
                          (Tùy chọn)
                        </span>
                      </div>

                      {/* Display added articles */}
                      {productFormArticles.length === 0 ? (
                        <p className="text-[10.5px] text-brand-muted text-center py-2 font-sans italic">
                          Chưa có bài viết phụ nào. Gói xăm này hiển thị 1 bài gốc mặc định ở trên.
                        </p>
                      ) : (
                        <div className="space-y-2 max-h-48 overflow-y-auto">
                          {productFormArticles.map((art, idx) => {
                            const isBeingEdited = editingArticleIdx === idx;
                            return (
                              <div
                                key={idx}
                                className={`p-2 bg-white rounded-lg border flex justify-between items-start gap-2 text-[10.5px] transition-all ${
                                  isBeingEdited
                                    ? 'border-brand-accent/85 bg-brand-accent/5 ring-1 ring-brand-accent/30'
                                    : 'border-brand-line/50'
                                }`}
                              >
                                <div className="space-y-0.5 flex-1 min-w-0">
                                  <div className="flex items-center gap-1.5 flex-wrap">
                                    <p className="font-bold text-brand-ink truncate">
                                      {art.title}
                                    </p>
                                    {isBeingEdited && (
                                      <span className="text-[8px] bg-brand-accent text-white px-1.5 py-0.5 rounded font-black animate-pulse">
                                        📝 Đang Sửa
                                      </span>
                                    )}
                                    {art.imageUrl && (
                                      <span className="text-[9px] bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded font-black">🖼️ Có ảnh</span>
                                    )}
                                    {art.videoUrl && (
                                      <span className="text-[9px] bg-sky-100 text-sky-800 px-1.5 py-0.5 rounded font-black">🎥 Có video</span>
                                    )}
                                  </div>
                                  <p className="text-brand-muted font-sans truncate text-[10px]">
                                    {art.description}
                                  </p>
                                </div>
                                <div className="flex items-center gap-1 shrink-0">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setEditingArticleIdx(idx);
                                      setArticleTitleInput(art.title || '');
                                      setArticleDescInput(art.description || '');
                                      setArticlePromptInput(art.prompt || '');
                                      setArticleImageUrlInput(art.imageUrl || '');
                                      setArticleVideoUrlInput(art.videoUrl || '');
                                    }}
                                    className={`p-1 bg-brand-beige hover:bg-brand-accent hover:text-white rounded-md transition-colors cursor-pointer text-brand-ink`}
                                    title="Sửa bài viết này"
                                  >
                                    <FileEdit className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      if (editingArticleIdx === idx) {
                                        setEditingArticleIdx(null);
                                        setArticleTitleInput('');
                                        setArticleDescInput('');
                                        setArticlePromptInput('');
                                        setArticleImageUrlInput('');
                                        setArticleVideoUrlInput('');
                                      }
                                      setProductFormArticles(productFormArticles.filter((_, i) => i !== idx));
                                    }}
                                    className="p-1 text-brand-danger bg-red-50 hover:bg-red-100 rounded-md transition-colors cursor-pointer"
                                    title="Xóa bài viết này"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}

                      {/* Add article fields segment */}
                      <div className="p-2.5 bg-white rounded-lg border border-brand-line/70 space-y-2.5">
                        <span className="text-[10px] font-extrabold text-brand-ink/90 block">
                          {editingArticleIdx !== null ? '📝 Chỉnh sửa bài viết phụ này:' : '➕ Thêm nhanh bài viết/prompt phụ:'}
                        </span>

                        <label className="flex flex-col space-y-1 text-[10px] font-bold text-brand-muted">
                          <span>Tiêu đề bài viết (Ví dụ: 1. Dragon Rising Classic)</span>
                          <input
                            type="text"
                            placeholder="Nhập tiêu đề mẫu..."
                            value={articleTitleInput}
                            onChange={(e) => setArticleTitleInput(e.target.value)}
                            className="p-1.5 border border-brand-line bg-white rounded-md text-brand-ink outline-none"
                          />
                        </label>

                        <label className="flex flex-col space-y-1 text-[10px] font-bold text-brand-muted">
                          <span>Mô tả ngắn gọn mẫu xăm</span>
                          <input
                            type="text"
                            placeholder="Nhập mô tả cụ thể..."
                            value={articleDescInput}
                            onChange={(e) => setArticleDescInput(e.target.value)}
                            className="p-1.5 border border-brand-line bg-white rounded-md text-brand-ink outline-none"
                          />
                        </label>

                        <label className="flex flex-col space-y-1 text-[10px] font-bold text-brand-muted">
                          <span>Công thức câu lệnh (Prompt)</span>
                          <textarea
                            placeholder="Nhập prompt Midjourney..."
                            rows={2}
                            value={articlePromptInput}
                            onChange={(e) => setArticlePromptInput(e.target.value)}
                            className="p-1.5 border border-brand-line bg-white rounded-md text-brand-ink outline-none font-mono font-medium"
                          />
                        </label>

                        {/* Attached Image source */}
                        <div className="p-2 bg-brand-beige/25 rounded-md border border-brand-line/40 space-y-1.5">
                          <span className="text-[10px] font-bold text-brand-ink/80 block">Hình ảnh đính kèm (Tùy chọn)</span>
                          
                          <label className="flex flex-col space-y-1 text-[9px] text-brand-muted">
                            <span>Upload File ảnh (.png, .jpg, .webp...)</span>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handleArticleImageFileChange}
                              className="text-[10px] text-brand-muted file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-[10px] file:font-bold file:bg-brand-ink file:text-white hover:file:bg-brand-accent cursor-pointer"
                            />
                          </label>

                          <div className="flex items-center gap-1">
                            <span className="text-[9px] text-brand-muted shrink-0">Hoặc URL ảnh:</span>
                            <input
                              type="text"
                              placeholder="https://example.com/image.jpg..."
                              value={articleImageUrlInput}
                              onChange={(e) => setArticleImageUrlInput(e.target.value)}
                              className="flex-1 p-1 text-[10px] border border-brand-line/70 bg-white rounded text-brand-ink outline-none"
                            />
                          </div>

                          {articleImageUrlInput && (
                            <div className="relative w-12 h-12 border border-brand-line rounded overflow-hidden bg-white">
                              <img src={articleImageUrlInput} alt="Preview" referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                              <button
                                type="button"
                                onClick={() => setArticleImageUrlInput('')}
                                className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-3.5 h-3.5 flex items-center justify-center text-[8px] font-bold hover:bg-red-600 border border-white"
                              >
                                ×
                              </button>
                            </div>
                          )}
                        </div>

                        {/* Attached Video link */}
                        <label className="flex flex-col space-y-1 text-[10px] font-bold text-brand-muted">
                          <span>Đường dẫn Video đính kèm (YouTube hoặc link trực tiếp .mp4...)</span>
                          <input
                            type="text"
                            placeholder="Ví dụ: https://www.youtube.com/watch?v=... hoặc link mp4"
                            value={articleVideoUrlInput}
                            onChange={(e) => setArticleVideoUrlInput(e.target.value)}
                            className="p-1.5 border border-brand-line bg-white rounded-md text-brand-ink outline-none text-[10px]"
                          />
                        </label>

                        {editingArticleIdx !== null ? (
                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={() => {
                                if (!articleTitleInput.trim()) {
                                  alert('Xin vui lòng nhập tiêu đề cho bài viết phụ!');
                                  return;
                                }
                                const updatedArticles = [...productFormArticles];
                                updatedArticles[editingArticleIdx] = {
                                  title: articleTitleInput.trim(),
                                  description: articleDescInput.trim(),
                                  prompt: articlePromptInput.trim(),
                                  imageUrl: articleImageUrlInput.trim() || undefined,
                                  videoUrl: articleVideoUrlInput.trim() || undefined,
                                };
                                setProductFormArticles(updatedArticles);
                                setEditingArticleIdx(null);
                                setArticleTitleInput('');
                                setArticleDescInput('');
                                setArticlePromptInput('');
                                setArticleImageUrlInput('');
                                setArticleVideoUrlInput('');
                              }}
                              className="flex-1 py-1.5 bg-brand-accent hover:bg-brand-accent-dark text-white font-bold text-[10px] rounded-md transition-colors cursor-pointer flex items-center justify-center gap-1"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" /> Lưu Cập Nhật
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setEditingArticleIdx(null);
                                setArticleTitleInput('');
                                setArticleDescInput('');
                                setArticlePromptInput('');
                                setArticleImageUrlInput('');
                                setArticleVideoUrlInput('');
                              }}
                              className="px-3 py-1.5 bg-brand-line/45 hover:bg-brand-line/60 text-brand-ink font-bold text-[10px] rounded-md transition-colors cursor-pointer"
                            >
                              Hủy
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => {
                              if (!articleTitleInput.trim()) {
                                  alert('Xin vui lòng nhập tiêu đề cho bài viết phụ!');
                                  return;
                              }
                              const newArt = {
                                title: articleTitleInput.trim(),
                                description: articleDescInput.trim(),
                                prompt: articlePromptInput.trim(),
                                imageUrl: articleImageUrlInput.trim() || undefined,
                                videoUrl: articleVideoUrlInput.trim() || undefined,
                              };
                              setProductFormArticles([...productFormArticles, newArt]);
                              setArticleTitleInput('');
                              setArticleDescInput('');
                              setArticlePromptInput('');
                              setArticleImageUrlInput('');
                              setArticleVideoUrlInput('');
                            }}
                            className="w-full py-1.5 bg-brand-ink hover:bg-brand-accent text-white font-bold text-[10px] rounded-md transition-colors cursor-pointer flex items-center justify-center gap-1"
                          >
                            <Plus className="w-3.5 h-3.5" /> Thêm Bài Viết Này Vào Gói
                          </button>
                        )}
                      </div>
                    </div>

                    {productFormMsg && (
                      <p className="text-emerald-800 bg-emerald-50 border border-emerald-200 p-2.5 rounded-lg font-bold">
                        {productFormMsg}
                      </p>
                    )}

                    <div className="flex gap-2">
                      <button
                        type="submit"
                        className="flex-1 py-2.5 bg-brand-accent hover:bg-brand-accent-dark text-white font-extrabold rounded-lg shadow cursor-pointer transition-colors text-center"
                      >
                        {editingProductId === -999 ? 'Thêm Gói Mới' : 'Lưu Thay Đổi'}
                      </button>

                      {editingProductId !== -999 && (
                        <button
                          type="button"
                          onClick={() => {
                            if (window.confirm(`Bạn có chắc chắn muốn xóa gói prompt "${productFormName}" này không?`)) {
                              onDeleteProduct(editingProductId);
                              setProductFormMsg('Nhật ký: Đã xóa sản phẩm thành công!');
                              const remaining = products.filter((p) => p.id !== editingProductId);
                              if (remaining.length > 0) {
                                loadProductToForm(remaining[0].id);
                              } else {
                                triggerCreateNewProduct();
                              }
                            }
                          }}
                          className="px-4 py-2.5 bg-brand-danger bg-red-600 hover:bg-red-700 text-white font-extrabold rounded-lg shadow cursor-pointer transition-colors text-center flex items-center justify-center gap-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Xóa</span>
                        </button>
                      )}
                    </div>
                  </form>

                  {/* Reset defaults parameters */}
                  <div className="pt-3 border-t border-brand-line/50 flex justify-end">
                    <button
                      onClick={() => {
                        onResetProducts();
                        setProductFormMsg('Nhật ký: Đã khôi phục hoàn toàn danh sách sản phẩm mặc định!');
                      }}
                      className="px-3 py-1.5 text-[10.5px] font-bold text-brand-muted hover:text-brand-accent border border-brand-line hover:border-brand-accent bg-white rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      <Undo2 className="w-3.5 h-3.5" />
                      <span>Khôi phục catalog gốc</span>
                    </button>
                  </div>
                </div>
              )}

              {/* VIEW 3: CATEGORY MANAGER */}
              {activeTab === 'categories' && (
                <div className="space-y-4">
                  <div className="space-y-1">
                    <h3 className="font-display font-extrabold text-sm text-brand-ink">
                      Quản lý chuyên mục xăm
                    </h3>
                    <p className="text-[10px] text-brand-muted font-sans my-1">
                      Thêm chuyên mục xăm hoặc xóa bỏ các chuyên mục ít tương tác.
                    </p>
                  </div>

                  {/* Category inserts */}
                  <form onSubmit={handleCategorySubmit} className="p-4 border border-brand-line bg-[#faf9f6] rounded-xl text-xs space-y-3">
                    <div className="font-bold text-brand-ink text-sm pb-1 border-b border-brand-line">
                      ➕ Thêm chuyên mục mới
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <label className="flex flex-col space-y-1 font-bold text-brand-ink/90">
                        <span>Tên danh mục</span>
                        <input
                          type="text"
                          required
                          placeholder="Ví dụ: Realistic"
                          value={newCatName}
                          onChange={(e) => {
                            setNewCatName(e.target.value);
                            // Precompute fallback slug
                            setNewCatSlug(e.target.value.toLowerCase().replace(/[^a-zA-Z0-9]+/g, '-'));
                          }}
                          className="p-2 border border-brand-line bg-white rounded-lg outline-none font-sans"
                        />
                      </label>

                      <label className="flex flex-col space-y-1 font-bold text-brand-ink/90">
                        <span>Mã Slug liên kết</span>
                        <input
                          type="text"
                          required
                          placeholder="Ví dụ: realistic"
                          value={newCatSlug}
                          onChange={(e) => setNewCatSlug(e.target.value)}
                          className="p-2 border border-brand-line bg-white rounded-lg outline-none font-sans font-mono"
                        />
                      </label>
                    </div>

                    {catMsg && (
                      <p className="p-2 bg-brand-beige border rounded-lg font-bold text-brand-ink font-sans">
                        {catMsg}
                      </p>
                    )}

                    <button
                      type="submit"
                      className="w-full py-2 bg-brand-ink hover:bg-brand-accent text-white font-bold rounded-lg transition-colors cursor-pointer"
                    >
                      Thêm Chuyên Mục
                    </button>
                  </form>

                  {/* Current categories row listing */}
                  <div className="space-y-2">
                    <span className="block text-xs font-bold text-brand-ink">
                      Danh mục hiện có ({categories.length})
                    </span>

                    <div className="space-y-2">
                      {categories.map((c, i) => (
                        <div
                          key={i}
                          className="flex justify-between items-center p-3 bg-brand-beige/30 border border-brand-line/60 rounded-xl text-xs font-sans"
                        >
                          <div className="space-y-0.5">
                            <strong>{c.name}</strong>
                            <span className="block text-[10px] text-brand-muted font-mono">slug: {c.slug}</span>
                          </div>

                          <button
                            onClick={() => onDeleteCategory(c.slug)}
                            className="p-1 px-2 border border-brand-line rounded-lg text-brand-danger bg-white hover:bg-red-50 text-[10.5px] font-bold transition-colors cursor-pointer"
                            title="Xóa chuyên mục"
                          >
                            Xóa
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Reset default categories */}
                  <div className="pt-3 border-t border-brand-line/50 flex justify-end">
                    <button
                      onClick={() => {
                        onResetCategories();
                        setCatMsg('Đã phục hồi danh mục gốc.');
                      }}
                      className="px-3 py-1.5 text-[10.5px] font-bold text-brand-muted hover:text-brand-accent border border-brand-line hover:border-brand-accent bg-white rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      <Undo2 className="w-3.5 h-3.5" />
                      <span>Khôi phục danh mục gốc</span>
                    </button>
                  </div>
                </div>
              )}

              {/* VIEW 4: USER ACCOUNTS AND POINT AWARDING */}
              {activeTab === 'users' && (
                <div className="space-y-4">
                  <div className="space-y-1">
                    <h3 className="font-display font-extrabold text-sm text-brand-ink">
                      Quản lý tài khoản thành viên ({users.length})
                    </h3>
                    <p className="text-[10px] text-brand-muted font-sans text-left">
                      Danh sách các thành viên đăng ký. Admin có thể xem số điểm hiện tại và trực tiếp điều chỉnh hoặc cộng điểm cho họ.
                    </p>
                  </div>

                  {users.length === 0 ? (
                    <div className="p-8 border border-dashed border-brand-line rounded-xl text-center text-brand-muted text-xs font-sans">
                      Chưa có tài khoản thành viên nào đăng ký ngoài tài khoản admin của bạn.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {users.map((u) => {
                        const isUserAdmin = u.username.toLowerCase() === 'admin';
                        return (
                          <div
                            key={u.username}
                            className={`p-4 border rounded-xl bg-brand-beige/25 space-y-3 font-sans ${
                              isUserAdmin ? 'border-brand-accent/40 bg-brand-accent/5' : 'border-brand-line/60'
                            }`}
                          >
                            <div className="flex justify-between items-start text-xs">
                              <div className="space-y-1">
                                <p className="font-bold text-brand-ink text-sm">
                                  {u.username} {isUserAdmin && <span className="ml-1 text-[9px] font-black bg-brand-accent text-white px-1.5 py-0.5 rounded tracking-wider uppercase animate-pulse">ADMIN</span>}
                                </p>
                                <p className="text-[10.5px] text-brand-muted">
                                  Gói đã mở khóa: <strong className="text-brand-ink">{u.unlockedProducts?.length || 0} gói</strong>
                                </p>
                              </div>
                              <div className="text-right">
                                <span className="text-[10px] text-brand-muted block uppercase font-bold tracking-tight">Số dư hiện tại</span>
                                <strong className="text-brand-accent text-sm font-black">{u.points} Points</strong>
                              </div>
                            </div>

                            {/* Password Viewer & Block Status line */}
                            <div className="flex flex-wrap items-center justify-between gap-2 p-2.5 bg-white border border-brand-line/55 rounded-lg text-xs">
                              <div className="flex items-center gap-1.5">
                                <span className="text-[10px] text-brand-muted font-bold uppercase">Mật khẩu:</span>
                                <span className="font-mono font-bold text-brand-ink bg-brand-beige/20 px-1.5 py-0.5 rounded border border-brand-line/30">
                                  {visiblePasswords[u.username] ? (u.password || 'admin123') : '••••••••'}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => setVisiblePasswords(prev => ({ ...prev, [u.username]: !prev[u.username] }))}
                                  className="p-1 hover:text-brand-accent text-brand-muted transition-colors cursor-pointer flex items-center"
                                  title={visiblePasswords[u.username] ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                                >
                                  {visiblePasswords[u.username] ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                                </button>
                              </div>

                              <div className="flex items-center gap-1.5 ml-auto">
                                <span className="text-[10px] text-brand-muted font-bold uppercase">Trạng thái:</span>
                                {u.isLocked ? (
                                  <span className="text-[9px] font-black bg-red-100 text-red-800 px-1.5 py-0.5 rounded flex items-center gap-1">
                                    <Lock className="w-2.5 h-2.5 text-red-800" /> KHÓA
                                  </span>
                                ) : (
                                  <span className="text-[9px] font-black bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded flex items-center gap-1">
                                    <Unlock className="w-2.5 h-2.5 text-emerald-800" /> HOẠT ĐỘNG
                                  </span>
                                )}

                                {!isUserAdmin && (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      onToggleLockUser(u.username);
                                    }}
                                    className={`px-2 py-1 text-[9.5px] font-extrabold rounded-md shadow-xs transition-all cursor-pointer select-none active:scale-95 ${
                                      u.isLocked 
                                        ? 'bg-emerald-600 hover:bg-emerald-700 text-white' 
                                        : 'bg-red-600 hover:bg-red-700 text-white'
                                    }`}
                                  >
                                    {u.isLocked ? 'Mở Khóa' : 'Khóa'}
                                  </button>
                                )}
                              </div>
                            </div>

                            {/* Adjust Points inline */}
                            <div className="p-2.5 bg-white border border-brand-line/50 rounded-lg flex flex-col sm:flex-row items-center gap-2 text-xs">
                              <span className="text-[10px] text-brand-muted font-bold shrink-0 sm:text-left text-center">
                                Cộng/Sửa điểm:
                              </span>
                              <div className="flex w-full items-center gap-1.5">
                                <input
                                  id={`points-input-${u.username}`}
                                  type="number"
                                  defaultValue={u.points}
                                  placeholder="Điểm số..."
                                  className="w-full max-w-[90px] p-1.5 border border-brand-line/80 rounded bg-brand-beige/10 font-sans font-bold text-xs"
                                />
                                <button
                                  type="button"
                                  onClick={() => {
                                    const inputNode = document.getElementById(`points-input-${u.username}`) as HTMLInputElement;
                                    if (inputNode) {
                                      const nextPoints = parseInt(inputNode.value, 10);
                                      if (isNaN(nextPoints) || nextPoints < 0) {
                                        alert('Vui lòng nhập điểm số hợp lệ lớn hơn hoặc bằng 0!');
                                        return;
                                      }
                                      onAdjustUserPoints(u.username, nextPoints);
                                      alert(`Đã cập nhật số điểm của @${u.username} thành ${nextPoints} points thành công!`);
                                    }
                                  }}
                                  className="px-3 py-1.5 bg-brand-accent hover:bg-brand-accent-dark text-white text-[10.5px] font-black rounded transition-colors cursor-pointer whitespace-nowrap animate-pulse"
                                >
                                  Lưu Điểm
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    const inputNode = document.getElementById(`points-input-${u.username}`) as HTMLInputElement;
                                    if (inputNode) {
                                      const currentVal = parseInt(inputNode.value, 10) || 0;
                                      inputNode.value = String(currentVal + 100);
                                    }
                                  }}
                                  className="px-2 py-1.5 bg-brand-beige hover:bg-brand-line/50 text-brand-ink text-[10px] font-bold border border-brand-line rounded whitespace-nowrap cursor-pointer"
                                >
                                  +100
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    const inputNode = document.getElementById(`points-input-${u.username}`) as HTMLInputElement;
                                    if (inputNode) {
                                      const currentVal = parseInt(inputNode.value, 10) || 0;
                                      inputNode.value = String(currentVal + 500);
                                    }
                                  }}
                                  className="px-2 py-1.5 bg-brand-beige hover:bg-brand-line/50 text-brand-ink text-[10px] font-bold border border-brand-line rounded whitespace-nowrap cursor-pointer"
                                >
                                  +500
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

            </div>
          )}
        </div>
      </section>
    </aside>
  );
}
