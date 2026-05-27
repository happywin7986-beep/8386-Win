/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Product, Category, User } from '../types';
import { Search, Tag, Eye, Lock, Unlock, ClipboardCopy, Check, ShoppingCart, Award, X, ExternalLink, Sparkles, Film, Image as ImageIcon } from 'lucide-react';
import { formatVND } from '../data';
import { unmaskPrompt } from '../utils';

interface ProductGridProps {
  products: Product[];
  categories: Category[];
  currentUser: User | null;
  onAddToCart: (product: Product) => void;
  onUnlockProduct: (product: Product) => void;
  onOpenAccount: () => void;
}

export default function ProductGrid({
  products,
  categories,
  currentUser,
  onAddToCart,
  onUnlockProduct,
  onOpenAccount,
}: ProductGridProps) {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [activeArticleIndices, setActiveArticleIndices] = useState<Record<number, number>>({});
  
  // Modal viewer state for unlocked articles
  const [selectedUnlockedProduct, setSelectedUnlockedProduct] = useState<Product | null>(null);
  const [modalActiveArticleIdx, setModalActiveArticleIdx] = useState<number>(0);

  // Check if current product is unlocked by user
  const isUnlocked = (productId: number) => {
    if (!currentUser) return false;
    return currentUser.unlockedProducts.includes(productId);
  };

  const currentPoints = currentUser ? currentUser.points : 0;

  // Filter products by keyword & category list
  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name.toLowerCase().includes(search.toLowerCase()) ||
                          product.tag.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Handle clipboard copying
  const handleCopyPrompt = (key: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <section id="products" className="px-6 md:px-12 lg:px-16 py-12 max-w-7xl mx-auto scrolling-mt">
      {/* Filtering header controller */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider text-brand-accent">
            <Award className="w-4 h-4" />
            <span>Danh mục sản phẩm</span>
          </div>
          <h2 className="font-display font-extrabold text-2xl md:text-3xl text-brand-ink tracking-tight">
            Gói prompt bán chạy hôm nay
          </h2>
          <p className="text-xs text-brand-muted font-sans">
            Mỗi gói chứa hàng chục cấu trúc câu lệnh độc quyền giúp kiến tạo nét xăm hoàn hảo.
          </p>
        </div>

        {/* Search and filters controls */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Key word input search */}
          <div className="flex items-center gap-2 px-3.5 py-2 bg-white border border-brand-line rounded-xl shadow-sm text-sm text-brand-muted font-medium w-full sm:w-auto">
            <Search className="w-4 h-4 text-brand-muted" />
            <input
              type="search"
              placeholder="Tìm kiếm style xăm..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-transparent border-0 outline-0 text-brand-ink text-xs placeholder:text-brand-muted/70 w-full sm:w-52"
            />
          </div>

          {/* Category Selector dropdown */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3.5 py-2 bg-white border border-brand-line rounded-xl text-xs font-semibold text-brand-ink outline-0 cursor-pointer shadow-sm w-full sm:w-auto"
            aria-label="Lọc danh mục"
          >
            <option value="all">Tất cả style</option>
            {categories.map((cat, idx) => (
              <option key={idx} value={cat.slug}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Grid displays */}
      {filteredProducts.length === 0 ? (
        <div className="text-center p-16 bg-white border border-brand-line rounded-2xl shadow-sm">
          <p className="text-brand-muted font-semibold text-sm">
            Không tìm thấy sản phẩm xăm nào khớp với điều kiện lọc của bạn.
          </p>
          <button
            onClick={() => {
              setSearch('');
              setSelectedCategory('all');
            }}
            className="text-xs font-bold text-brand-accent hover:underline mt-2 cursor-pointer"
          >
            Đặt lại bộ lọc
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map((p) => {
            const unlocked = isUnlocked(p.id);
            const canUnlock = currentUser && currentPoints >= p.pointsCost;

            return (
              <article
                key={p.id}
                className="flex flex-col bg-white border border-brand-line rounded-2xl overflow-hidden shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all group"
              >
                {/* Product Cover image */}
                <div className="relative h-48 bg-zinc-200 overflow-hidden">
                  <img
                    src={p.image}
                    alt={p.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                  <div className="absolute top-3 left-3 flex gap-1.5 items-center">
                    <span className="px-2 py-0.5 text-[9px] font-extrabold uppercase bg-brand-accent text-white rounded-md tracking-wider">
                      {p.tag}
                    </span>
                  </div>
                </div>

                {/* Body details */}
                <div className="flex flex-col flex-1 p-5 space-y-4">
                  <div className="space-y-1">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-display font-extrabold text-sm text-brand-ink leading-tight">
                        {p.name}
                      </h3>
                    </div>
                    <p className="text-xs text-brand-muted leading-relaxed font-sans line-clamp-2">
                      {p.description}
                    </p>
                  </div>

                  {/* Sold count & point badges */}
                  <div className="flex items-center gap-2 text-[10px] font-extrabold">
                    <span className="px-2.5 py-1 text-brand-accent-dark bg-brand-accent/10 border border-brand-accent/20 rounded-full">
                      {p.sold.toLocaleString('vi-VN')} Lượt mua
                    </span>
                    <span className="px-2.5 py-1 text-brand-gold bg-brand-gold/10 border border-brand-gold/20 rounded-full">
                      {p.pointsCost} Points
                    </span>
                  </div>

                  {/* Prompt Box display */}
                  <div className="flex-1">
                    {unlocked ? (
                      p.articles && p.articles.length > 0 ? (
                        <div className="space-y-2.5">
                          {/* Article Selection Pills */}
                          <div className="flex gap-1 overflow-x-auto pb-1.5 scrollbar-thin">
                            {p.articles.map((art, idx) => {
                              const activeIdx = activeArticleIndices[p.id] || 0;
                              return (
                                <button
                                  key={idx}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setActiveArticleIndices((prev) => ({ ...prev, [p.id]: idx }));
                                  }}
                                  type="button"
                                  className={`px-2 py-0.5 text-[9px] font-black tracking-tight rounded-md whitespace-nowrap cursor-pointer transition-colors ${
                                    activeIdx === idx
                                      ? 'bg-brand-accent text-white shadow-xs'
                                      : 'bg-brand-beige text-brand-muted hover:bg-brand-line/50 border border-brand-line/30'
                                  }`}
                                >
                                  Mẫu {idx + 1}
                                </button>
                              );
                            })}
                          </div>

                          {/* Render selected article info */}
                          {(() => {
                            const activeIdx = activeArticleIndices[p.id] || 0;
                            const currentArt = p.articles[activeIdx] || p.articles[0];
                            const artCopiedKey = `${p.id}-art-${activeIdx}`;

                            const getYoutubeEmbed = (url: string) => {
                              if (!url) return null;
                              let videoId = '';
                              const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
                              const match = url.match(regExp);
                              if (match && match[2].length === 11) {
                                videoId = match[2];
                              }
                              if (videoId) {
                                return `https://www.youtube.com/embed/${videoId}`;
                              }
                              return null;
                            };

                            const embedUrl = currentArt.videoUrl ? getYoutubeEmbed(currentArt.videoUrl) : null;
                            const isDirectVideo = currentArt.videoUrl && (
                              currentArt.videoUrl.endsWith('.mp4') || 
                              currentArt.videoUrl.endsWith('.webm') || 
                              currentArt.videoUrl.toLowerCase().includes('video')
                            );

                            return (
                              <div className="p-3 bg-brand-beige rounded-xl border border-brand-line/80 relative group/prompt overflow-hidden text-left space-y-2.5">
                                <div className="absolute top-2.5 right-2.5 opacity-0 group-hover/prompt:opacity-100 transition-opacity">
                                  <button
                                    onClick={() => handleCopyPrompt(artCopiedKey, unmaskPrompt(currentArt.prompt))}
                                    type="button"
                                    className="p-1 px-1.5 rounded-md bg-white border border-brand-line shadow-sm hover:text-brand-accent transition-all text-[10px] font-bold inline-flex items-center gap-1 cursor-pointer"
                                    title="Sao chép câu lệnh"
                                  >
                                    {copiedKey === artCopiedKey ? (
                                      <>
                                        <Check className="w-3 h-3 text-emerald-600" />
                                        <span className="text-emerald-600">Copied</span>
                                      </>
                                    ) : (
                                      <>
                                        <ClipboardCopy className="w-3 h-3" />
                                        <span>Copy</span>
                                      </>
                                    )}
                                  </button>
                                </div>

                                <span className="text-[10px] uppercase font-bold text-brand-accent block pr-12 line-clamp-1">
                                  {currentArt.title}
                                </span>
                                <p className="text-[10.5px] text-brand-muted leading-relaxed font-sans">
                                  {currentArt.description}
                                </p>

                                {/* Attached Image Rendering */}
                                {currentArt.imageUrl && (
                                  <div className="my-2 bg-white rounded-lg overflow-hidden border border-brand-line p-1">
                                    <img
                                      src={currentArt.imageUrl}
                                      alt={currentArt.title}
                                      referrerPolicy="no-referrer"
                                      className="w-full h-auto max-h-[300px] object-contain rounded-md"
                                    />
                                  </div>
                                )}

                                {/* Attached Video Rendering */}
                                {currentArt.videoUrl && (
                                  <div className="my-2">
                                    {embedUrl ? (
                                      <div className="aspect-video w-full rounded-lg overflow-hidden border border-brand-line shadow-xs">
                                        <iframe
                                          src={embedUrl}
                                          title={currentArt.title}
                                          className="w-full h-full border-0"
                                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                          allowFullScreen
                                        />
                                      </div>
                                    ) : isDirectVideo ? (
                                      <div className="w-full rounded-lg overflow-hidden border border-brand-line bg-zinc-950 p-1">
                                        <video
                                          src={currentArt.videoUrl}
                                          controls
                                          className="w-full max-h-[250px] rounded"
                                        />
                                      </div>
                                    ) : (
                                      <a
                                        href={currentArt.videoUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-brand-accent/5 hover:bg-brand-accent/10 text-brand-accent hover:text-brand-accent-dark rounded-lg border border-brand-accent/20 text-xs font-bold transition-all cursor-pointer"
                                      >
                                        🎥 Xem Video đính kèm bộ mẫu
                                      </a>
                                    )}
                                  </div>
                                )}

                                <div className="p-2 bg-white/70 border border-brand-line/35 rounded-lg">
                                  <code className="text-[11px] font-mono font-medium text-brand-ink block whitespace-pre-wrap break-all leading-normal">
                                    {unmaskPrompt(currentArt.prompt)}
                                  </code>
                                </div>
                              </div>
                            );
                          })()}
                        </div>
                      ) : (
                        <div className="p-3 bg-brand-beige rounded-xl border border-brand-line/80 relative group/prompt overflow-hidden text-left">
                          <div className="absolute top-2.5 right-2.5 opacity-0 group-hover/prompt:opacity-100 transition-opacity">
                            <button
                              onClick={() => handleCopyPrompt(`${p.id}-fallback`, unmaskPrompt(p.prompt))}
                              type="button"
                              className="p-1 px-1.5 rounded-md bg-white border border-brand-line shadow-sm hover:text-brand-accent transition-all text-[10px] font-bold inline-flex items-center gap-1 cursor-pointer"
                              title="Sao chép câu lệnh"
                            >
                              {copiedKey === `${p.id}-fallback` ? (
                                <>
                                  <Check className="w-3 h-3 text-emerald-600" />
                                  <span className="text-emerald-600">Copied</span>
                                </>
                              ) : (
                                <>
                                  <ClipboardCopy className="w-3 h-3" />
                                  <span>Copy</span>
                                </>
                              )}
                            </button>
                          </div>
                          <span className="text-[10px] uppercase font-bold text-brand-accent block mb-1">
                            Copy prompt bên dưới:
                          </span>
                          <code className="text-xs font-mono font-medium text-brand-ink block whitespace-pre-wrap pr-4 break-words">
                            {unmaskPrompt(p.prompt)}
                          </code>
                        </div>
                      )
                    ) : (
                      <div className="p-3 bg-zinc-50 rounded-xl border border-zinc-200 flex flex-col items-center justify-center py-4 text-center space-y-2 relative group/locked-prompt">
                        <div className="flex flex-col items-center justify-center space-y-1">
                          <Lock className="w-4 h-4 text-brand-muted/70" />
                          <span className="text-[10px] font-bold text-brand-muted/80">
                            Prompt đang khóa
                          </span>
                          {p.articles && p.articles.length > 0 ? (
                            <div className="px-2 py-0.5 bg-brand-accent/5 border border-brand-accent/20 rounded-md text-[9px] text-brand-accent font-sans font-black">
                              🎁 Gồm {p.articles.length} bài mẫu thiết kế
                            </div>
                          ) : (
                            <p className="text-[9px] text-brand-muted/60 px-2 mt-0.5 font-sans">
                              Đăng nhập & sử dụng {p.pointsCost} điểm để xem chi tiết.
                            </p>
                          )}
                        </div>

                        {/* Quick copy prompt fallback button for easy access */}
                        <button
                          onClick={() => handleCopyPrompt(`${p.id}-quick`, unmaskPrompt(p.prompt))}
                          type="button"
                          className="w-full mt-1.5 py-1.5 px-3 rounded-lg bg-brand-accent/10 hover:bg-brand-accent hover:text-white transition-all text-[11px] font-bold inline-flex items-center justify-center gap-1.5 cursor-pointer text-brand-accent-dark border border-brand-accent/20 shadow-xs active:scale-95"
                          title="Sao chép nhanh câu lệnh gốc"
                        >
                          {copiedKey === `${p.id}-quick` ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-emerald-600 group-hover/locked-prompt:text-white" />
                              <span className="text-emerald-700 font-extrabold">Đã sao chép!</span>
                            </>
                          ) : (
                            <>
                              <ClipboardCopy className="w-3.5 h-3.5" />
                              <span>Sao chép nhanh Prompt</span>
                            </>
                          )}
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Action Purchase Button Footer */}
                  <div className="pt-2 border-t border-brand-line/50 space-y-2">
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex flex-col z-10">
                        <span className="text-[9px] uppercase tracking-wider text-brand-muted font-bold">
                          Mua trọn gói file
                        </span>
                        <span className="font-display font-black text-sm text-brand-accent">
                          {formatVND(p.price)}
                        </span>
                      </div>

                      <button
                        onClick={() => onAddToCart(p)}
                        className="inline-flex items-center gap-1 px-3.5 py-2 text-xs font-bold text-white bg-brand-ink hover:bg-brand-accent active:scale-95 transition-all rounded-lg cursor-pointer"
                      >
                        <ShoppingCart className="w-3.5 h-3.5" />
                        <span>Thêm</span>
                      </button>
                    </div>

                    {/* Unlock flow */}
                    {unlocked ? (
                      <button
                        onClick={() => {
                          setModalActiveArticleIdx(0);
                          setSelectedUnlockedProduct(p);
                        }}
                        type="button"
                        className="w-full inline-flex items-center justify-center gap-1.5 py-1.5 bg-brand-accent/5 hover:bg-brand-accent hover:text-white border border-brand-accent/30 text-brand-accent text-[11px] font-extrabold rounded-lg transition-all cursor-pointer shadow-sm active:scale-95"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Xem bài viết chi tiết</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => {
                          if (!currentUser) {
                            onOpenAccount();
                          } else if (currentPoints >= p.pointsCost) {
                            onUnlockProduct(p);
                            setModalActiveArticleIdx(0);
                            setSelectedUnlockedProduct(p);
                          } else {
                            onUnlockProduct(p);
                          }
                        }}
                        disabled={currentUser !== null && !canUnlock}
                        className={`w-full inline-flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-[10.5px] font-bold transition-all cursor-pointer ${
                          !currentUser
                            ? 'bg-zinc-100 hover:bg-zinc-200 text-zinc-700 border border-zinc-200'
                            : canUnlock
                            ? 'bg-brand-gold/10 hover:bg-brand-gold hover:text-white text-brand-gold border border-brand-gold/30'
                            : 'bg-zinc-100 text-zinc-400 border border-zinc-200 cursor-not-allowed'
                        }`}
                      >
                        {currentUser ? (
                          <>
                            <Unlock className="w-3 h-3" />
                            <span>Mở khóa với {p.pointsCost} Điểm</span>
                          </>
                        ) : (
                          <>
                            <Lock className="w-3 h-3" />
                            <span>Đăng nhập để mở khóa</span>
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {/* 🌟 PREMIUM ARTICLES DETAILS MODAL VIEW */}
      {selectedUnlockedProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-hidden">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-brand-ink/80 backdrop-blur-xs"
            onClick={() => setSelectedUnlockedProduct(null)}
          />

          {/* Modal Container */}
          <div className="relative bg-brand-beige w-full max-w-4xl max-h-[90vh] rounded-2xl border border-brand-line/80 shadow-2xl flex flex-col overflow-hidden z-10 animate-fade-in">
            {/* Header */}
            <div className="p-4 md:p-5 border-b border-brand-line/60 bg-white flex justify-between items-center shrink-0">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 text-[9px] font-black uppercase bg-brand-accent text-white rounded tracking-wider">
                    {selectedUnlockedProduct.tag}
                  </span>
                  <span className="px-2 py-0.5 text-[9px] font-black uppercase bg-brand-gold/25 text-brand-gold-dark border border-brand-gold/30 rounded tracking-wider flex items-center gap-1">
                    <Sparkles className="w-2.5 h-2.5" /> Đã Mở Khóa Chi Tiết
                  </span>
                </div>
                <h2 className="font-display font-black text-sm md:text-base text-brand-ink leading-tight">
                  {selectedUnlockedProduct.name}
                </h2>
              </div>
              <button
                onClick={() => setSelectedUnlockedProduct(null)}
                className="p-1.5 rounded-full bg-brand-beige/50 hover:bg-brand-accent hover:text-white transition-all cursor-pointer text-brand-ink"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Split Content View */}
            <div className="flex-1 overflow-y-auto flex flex-col md:flex-row min-h-0">
              
              {/* Left Column: Side navigation list of sub-articles */}
              {selectedUnlockedProduct.articles && selectedUnlockedProduct.articles.length > 0 && (
                <div className="w-full md:w-60 border-b md:border-b-0 md:border-r border-brand-line/60 bg-white/50 p-3 overflow-y-auto space-y-2 shrink-0">
                  <span className="text-[10px] font-bold text-brand-muted uppercase tracking-wider block px-1">
                    Danh sách bài viết ({selectedUnlockedProduct.articles.length})
                  </span>
                  <div className="space-y-1.5">
                    {selectedUnlockedProduct.articles.map((art, idx) => {
                      const isActive = modalActiveArticleIdx === idx;
                      return (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setModalActiveArticleIdx(idx)}
                          className={`w-full text-left p-2.5 rounded-xl border transition-all cursor-pointer flex items-start gap-2 ${
                            isActive
                              ? 'bg-brand-accent text-white border-brand-accent shadow-xs'
                              : 'bg-white border-brand-line/50 hover:border-brand-accent text-brand-ink'
                          }`}
                        >
                          <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black shrink-0 ${
                            isActive ? 'bg-white/25 text-white' : 'bg-brand-beige text-brand-muted/80'
                          }`}>
                            {idx + 1}
                          </span>
                          <div className="min-w-0 flex-1 space-y-0.5">
                            <p className="text-[11px] font-bold leading-tight truncate">{art.title}</p>
                            <div className="flex items-center gap-1.5 flex-wrap">
                              {art.imageUrl && (
                                <span className={`text-[8px] font-black px-1 rounded flex items-center gap-0.5 ${isActive ? 'bg-white/20 text-white' : 'bg-emerald-50 text-emerald-800'}`}>
                                  <ImageIcon className="w-2 h-2" /> Ảnh
                                </span>
                              )}
                              {art.videoUrl && (
                                <span className={`text-[8px] font-black px-1 rounded flex items-center gap-0.5 ${isActive ? 'bg-white/20 text-white' : 'bg-sky-50 text-sky-800'}`}>
                                  <Film className="w-2 h-2" /> Video
                                </span>
                              )}
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Right/Main Area: Focused Article Details View */}
              {(() => {
                const articlesList = selectedUnlockedProduct.articles || [];
                const hasArticles = articlesList.length > 0;
                
                const currentArt = hasArticles 
                  ? (articlesList[modalActiveArticleIdx] || articlesList[0])
                  : {
                      title: selectedUnlockedProduct.name,
                      description: selectedUnlockedProduct.description,
                      prompt: selectedUnlockedProduct.prompt,
                      imageUrl: selectedUnlockedProduct.image,
                      videoUrl: undefined
                    };

                const getYoutubeEmbed = (url: string) => {
                  if (!url) return null;
                  let videoId = '';
                  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
                  const match = url.match(regExp);
                  if (match && match[2].length === 11) {
                    videoId = match[2];
                  }
                  if (videoId) {
                    return `https://www.youtube.com/embed/${videoId}`;
                  }
                  return null;
                };

                const embedUrl = currentArt.videoUrl ? getYoutubeEmbed(currentArt.videoUrl) : null;
                const isDirectVideo = currentArt.videoUrl && (
                  currentArt.videoUrl.endsWith('.mp4') || 
                  currentArt.videoUrl.endsWith('.webm') || 
                  currentArt.videoUrl.toLowerCase().includes('video')
                );

                const modalCopiedKey = `modal-${selectedUnlockedProduct.id}-${modalActiveArticleIdx}`;

                return (
                  <div className="flex-1 p-5 md:p-6 overflow-y-auto space-y-5 bg-white">
                    {/* Title and Badge */}
                    <div className="space-y-1.5 border-b border-brand-line/40 pb-3">
                      <h3 className="font-display font-black text-sm md:text-base text-brand-ink leading-tight">
                        {currentArt.title}
                      </h3>
                      <p className="text-xs text-brand-muted leading-relaxed font-sans">
                        {currentArt.description}
                      </p>
                    </div>

                    {/* Media Renderers (Image & Video) layout */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Attached Image inside Modal */}
                      {currentArt.imageUrl && (
                        <div className="space-y-1">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-brand-muted flex items-center gap-1">
                            <ImageIcon className="w-3 h-3" /> Hình Ảnh Đính Kèm:
                          </span>
                          <div className="bg-brand-beige/30 p-2 rounded-xl border border-brand-line/50 overflow-hidden group/modalimg relative">
                            <img
                              src={currentArt.imageUrl}
                              alt={currentArt.title}
                              referrerPolicy="no-referrer"
                              className="w-full h-auto max-h-[320px] object-contain rounded-lg hover:scale-[1.01] transition-transform duration-300"
                            />
                            <div className="absolute bottom-2 right-2 opacity-0 group-hover/modalimg:opacity-100 transition-opacity">
                              <a
                                href={currentArt.imageUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-2.5 py-1 bg-brand-ink text-white rounded text-[10px] font-bold flex items-center gap-1 shadow hover:bg-brand-accent transition-colors"
                              >
                                <ExternalLink className="w-3 h-3" /> Mở ảnh gốc
                              </a>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Attached Video inside Modal */}
                      {currentArt.videoUrl && (
                        <div className="space-y-1">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-brand-muted flex items-center gap-1">
                            <Film className="w-3 h-3" /> Video Minh Họa/Hướng dẫn:
                          </span>
                          {embedUrl ? (
                            <div className="aspect-video w-full rounded-xl overflow-hidden border border-brand-line shadow-xs">
                              <iframe
                                src={embedUrl}
                                title={currentArt.title}
                                className="w-full h-full border-0"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                              />
                            </div>
                          ) : isDirectVideo ? (
                            <div className="w-full rounded-xl overflow-hidden border border-brand-line bg-zinc-950 p-1">
                              <video
                                src={currentArt.videoUrl}
                                controls
                                className="w-full max-h-[250px] rounded"
                              />
                            </div>
                          ) : (
                            <div className="p-4 rounded-xl border border-brand-line bg-brand-beige/25 flex flex-col items-center justify-center text-center space-y-2">
                              <Film className="w-8 h-8 text-brand-muted/70" />
                              <p className="text-xs text-brand-ink font-bold">Thao tác video đính kèm liên kết ngoài</p>
                              <a
                                href={currentArt.videoUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1.5 px-3 py-2 bg-brand-accent hover:bg-brand-accent/90 text-white rounded-lg text-xs font-bold transition-all cursor-pointer shadow-xs"
                              >
                                🎥 Mở và xem Video đính kèm <ExternalLink className="w-3.5 h-3.5" />
                              </a>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Premium Prompts Code Area */}
                    <div className="space-y-1.5 pt-2">
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-brand-muted flex items-center gap-1">
                          📋 Prompt tạo hình gốc (Copy để sử dụng):
                        </span>

                        <button
                          onClick={() => handleCopyPrompt(modalCopiedKey, unmaskPrompt(currentArt.prompt))}
                          type="button"
                          className="px-3 py-1.5 bg-brand-accent hover:bg-brand-accent/95 text-white text-xs font-black rounded-lg transition-all cursor-pointer shadow-xs inline-flex items-center gap-1.5 active:scale-95 text-center"
                        >
                          {copiedKey === modalCopiedKey ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-white" />
                              <span>Đã Sao Chép!</span>
                            </>
                          ) : (
                            <>
                              <ClipboardCopy className="w-3.5 h-3.5" />
                              <span>Sao Chép Prompt</span>
                            </>
                          )}
                        </button>
                      </div>

                      <div className="p-3.5 bg-brand-beige/50 border border-brand-line rounded-xl relative">
                        <code className="text-[12.5px] font-mono text-brand-ink block whitespace-pre-wrap break-all leading-relaxed">
                          {unmaskPrompt(currentArt.prompt)}
                        </code>
                      </div>
                    </div>

                    {/* Pro Tips / Note */}
                    <div className="p-3 bg-brand-gold/5 border border-brand-gold/20 rounded-xl flex items-start gap-2 text-xs">
                      <Sparkles className="w-4 h-4 text-brand-gold shrink-0 mt-0.5" />
                      <div className="text-[11px] text-brand-muted leading-normal">
                        <strong>Mẹo của thợ xăm:</strong> Bạn có thể copy câu prompt phía trên và dán trực tiếp vào các mô hình tạo ảnh AI (như Midjourney, Stable Diffusion, DALL-E) để tạo tiếp ra hàng ngàn biến thể hình ảnh độc đáo khác theo đúng phong cách riêng!
                      </div>
                    </div>
                  </div>
                );
              })()}

            </div>

            {/* Modal Footer actions */}
            <div className="p-3 bg-brand-beige/60 border-t border-brand-line/60 flex justify-end gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setSelectedUnlockedProduct(null)}
                className="px-5 py-2 bg-brand-ink hover:bg-brand-accent text-white text-xs font-bold rounded-lg transition-colors cursor-pointer"
              >
                Đóng cửa sổ
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
