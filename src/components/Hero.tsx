/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { Phone, MessageSquare, Facebook, ChevronRight, Bookmark, Music, Flame, Edit2, Save, X } from 'lucide-react';
import { User } from '../types';
import { db } from '../firebase';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';
// Default premium tattoo background fallback from Unsplash
const DEFAULT_BANNER_URL = "https://images.unsplash.com/photo-1598371839696-5c5bb00bdc28?auto=format&fit=crop&q=80&w=1200";

interface HeroProps {
  currentUser?: User | null;
}

interface HeroConfig {
  badge: string;
  title: string;
  description: string;
  dealTag: string;
  dealTitle: string;
  dealDesc: string;
  imageUrl: string;
}

export default function Hero({ currentUser }: HeroProps) {
  const [heroConfig, setHeroConfig] = useState<HeroConfig>({
    badge: "/imagine Prompt",
    title: "NN STUDIO premium tattoo prompt collection",
    description: "Công thức prompt có cấu trúc chặt chẽ: Chủ thể, style đặc thù, vị trí giải phẫu xăm, chi tiết nét kim rải, cường độ tương phản, và negative prompt chống rác hình.",
    dealTag: "Ưu đãi hôm nay",
    dealTitle: "Gói 120+ Prompt",
    dealDesc: "Full combo Blackwork, Minimal, Lettering và Neo-traditional giá cực hời.",
    imageUrl: ""
  });

  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<HeroConfig>({ ...heroConfig });

  useEffect(() => {
    const unsub = onSnapshot(doc(db, 'config', 'hero'), (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data() as HeroConfig;
        setHeroConfig(data);
        setEditForm(data);
      }
    });
    return () => unsub();
  }, []);

  const handleStartEdit = () => {
    setEditForm({ ...heroConfig });
    setIsEditing(true);
  };

  const handleSave = async () => {
    try {
      await setDoc(doc(db, 'config', 'hero'), editForm);
      setIsEditing(false);
    } catch (err) {
      alert("Lỗi khi lưu bài viết: " + (err as Error).message);
    }
  };
  return (
    <section className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center px-6 md:px-12 lg:px-16 py-12 md:py-20 max-w-7xl mx-auto">
      {/* Left Column: Visual description & Actions */}
      <div className="flex flex-col space-y-6">
        <div className="inline-flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-brand-accent animate-pulse"></span>
          <p className="font-display font-extrabold text-xs uppercase tracking-widest text-brand-accent">
            Premium Tattoo Prompt Collection
          </p>
        </div>

        <h1 className="font-display font-extrabold text-4xl md:text-6xl text-brand-ink leading-[0.95] tracking-tight">
          NhapNhang<br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-accent to-brand-gold">
            Studio
          </span>
        </h1>

        <p className="text-base text-brand-muted leading-relaxed max-w-xl">
          Sở hữu ngay các bộ prompt chuẩn tối ưu nhất cho Midjourney & Stable Diffusion. Chọn style, mở khóa công thức và nhận gói file hướng dẫn chuyên nghiệp để biến ý tưởng xăm thành concept 4K sắc nét gửi tặng thợ xăm thiết kế lại.
        </p>

        {/* Contact Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 w-full max-w-3xl pt-2">
          {/* Hotline */}
          <a
            href="tel:0971777729"
            className="flex items-center gap-3 p-3 bg-gradient-to-br from-[#222529] to-[#0d0f11] border border-brand-gold/30 rounded-xl hover:border-brand-gold hover:-translate-y-0.5 transition-all text-white shadow-md cursor-pointer group"
          >
            <div className="flex-shrink-0 grid w-8.5 h-8.5 place-items-center rounded-full border border-brand-gold/50 text-brand-gold group-hover:scale-110 transition-transform">
              <Phone className="w-4 h-4" />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-[9px] uppercase tracking-wider font-extrabold text-white/50">
                Hotline 24/7
              </span>
              <span className="text-xs font-bold font-mono tracking-tight text-white group-hover:text-brand-gold transition-colors">
                0971.777.729
              </span>
            </div>
          </a>

          {/* Zalo */}
          <a
            href="https://zalo.me/0971777729"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 p-3 bg-gradient-to-br from-[#222529] to-[#0d0f11] border border-brand-gold/30 rounded-xl hover:border-brand-gold hover:-translate-y-0.5 transition-all text-white shadow-md cursor-pointer group"
          >
            <div className="flex-shrink-0 grid w-8.5 h-8.5 place-items-center rounded-full border border-brand-gold/50 text-brand-gold group-hover:scale-110 transition-transform">
              <MessageSquare className="w-4 h-4" />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-[9px] uppercase tracking-wider font-extrabold text-white/50">
                Zalo chat
              </span>
              <span className="text-xs font-bold font-mono tracking-tight text-white group-hover:text-brand-gold transition-colors">
                DepLao
              </span>
            </div>
          </a>

          {/* Facebook */}
          <a
            href="https://www.facebook.com/TaiTattooBaoLoc"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 p-3 bg-gradient-to-br from-[#222529] to-[#0d0f11] border border-brand-gold/30 rounded-xl hover:border-brand-gold hover:-translate-y-0.5 transition-all text-white shadow-md cursor-pointer group"
          >
            <div className="flex-shrink-0 grid w-8.5 h-8.5 place-items-center rounded-full border border-brand-gold/50 text-brand-gold group-hover:scale-110 transition-transform">
              <Facebook className="w-4 h-4" />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-[9px] uppercase tracking-wider font-extrabold text-white/50">
                Facebook Admin
              </span>
              <span className="text-xs font-bold tracking-tight text-white group-hover:text-brand-gold transition-colors truncate">
                TranHuuTai
              </span>
            </div>
          </a>

          {/* TikTok */}
          <a
            href="https://www.tiktok.com/@nhangnhang95"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 p-3 bg-gradient-to-br from-[#222529] to-[#0d0f11] border border-brand-gold/30 rounded-xl hover:border-brand-gold hover:-translate-y-0.5 transition-all text-white shadow-md cursor-pointer group"
          >
            <div className="flex-shrink-0 grid w-8.5 h-8.5 place-items-center rounded-full border border-brand-gold/50 text-brand-gold group-hover:scale-110 transition-transform">
              <Music className="w-4 h-4" />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-[9px] uppercase tracking-wider font-extrabold text-white/50">
                TikTok Studio
              </span>
              <span className="text-xs font-bold tracking-tight text-white group-hover:text-brand-gold transition-colors truncate">
                @nhangnhang95
              </span>
            </div>
          </a>
        </div>

        {/* Action Link Row */}
        <div className="flex flex-wrap gap-3 pt-2">
          <a
            href="#products"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-brand-accent text-white font-bold text-sm tracking-tight shadow-md hover:bg-brand-accent-dark active:scale-98 transition-all cursor-pointer"
          >
            Khám Phá Style
            <ChevronRight className="w-4 h-4" />
          </a>
          <a
            href="#guide"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white border border-brand-line hover:border-brand-accent text-brand-ink font-bold text-sm tracking-tight active:scale-98 transition-all cursor-pointer"
          >
            Xem Hướng Dẫn
          </a>
        </div>
      </div>

      {/* Right Column: Premium prompt preview visual & Daily deal */}
      <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-brand-line/80 group">
        <div className="relative min-h-[380px] md:min-h-[460px] flex flex-col justify-end p-8 md:p-10 text-[#19fbce] border border-[#f20e0e] bg-blend-multiply bg-zinc-900/60 overflow-hidden">
          {/* Unsplash tattoo backdrop */}
          <img
            src={heroConfig.imageUrl || DEFAULT_BANNER_URL}
            alt="Tattoo artwork preview"
            referrerPolicy="no-referrer"
            className="absolute inset-0 object-cover w-full h-full -z-10 group-hover:scale-105 transition-transform duration-700"
          />

          <div className="absolute inset-x-0 bottom-0 top-1/2 bg-gradient-to-t from-black/95 via-black/50 to-transparent -z-10" />

          {/* Admin Edit Trigger Pin */}
          {currentUser?.username === 'admin' && !isEditing && (
            <button
              onClick={handleStartEdit}
              className="absolute top-4 left-4 z-40 flex items-center gap-1.5 px-3 py-1.5 bg-brand-accent hover:bg-brand-accent-dark text-white rounded-lg font-bold text-[11px] shadow-lg transition-all uppercase cursor-pointer"
            >
              <Edit2 className="w-3 h-3" />
              Sửa bài viết
            </button>
          )}

          {isEditing ? (
            <div className="space-y-3 z-30 w-full bg-brand-ink/95 p-4 rounded-xl border border-brand-gold/30 text-white mt-8">
              <span className="text-[10px] uppercase font-bold text-brand-gold tracking-widest block border-b border-white/10 pb-1.5">
                Bảng sửa nội dung Banner (Chỉ Admin)
              </span>

              <div className="space-y-2.5 max-h-[220px] overflow-y-auto pr-1">
                <div>
                  <label className="block text-[10px] text-white/50 uppercase font-bold mb-1">Thẻ tag nhỏ</label>
                  <input
                    type="text"
                    value={editForm.badge}
                    onChange={(e) => setEditForm({ ...editForm, badge: e.target.value })}
                    className="w-full bg-zinc-900 text-white text-xs border border-zinc-700 rounded p-1.5 focus:border-brand-gold focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] text-white/50 uppercase font-bold mb-1">Tiêu đề chính</label>
                  <input
                    type="text"
                    value={editForm.title}
                    onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                    className="w-full bg-zinc-900 text-white text-xs border border-zinc-700 rounded p-1.5 focus:border-brand-gold focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] text-white/50 uppercase font-bold mb-1">Nội dung chi tiết</label>
                  <textarea
                    rows={2}
                    value={editForm.description}
                    onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                    className="w-full bg-zinc-900 text-white text-xs border border-zinc-700 rounded p-1.5 focus:border-brand-gold focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] text-white/50 uppercase font-bold mb-1">Đường dẫn Hình Banner (imageUrl)</label>
                  <input
                    type="text"
                    placeholder="Bỏ trống để dùng hình mặc định"
                    value={editForm.imageUrl}
                    onChange={(e) => setEditForm({ ...editForm, imageUrl: e.target.value })}
                    className="w-full bg-zinc-900 text-white text-xs border border-zinc-700 rounded p-1.5 focus:border-brand-gold focus:outline-none placeholder-white/30"
                  />
                </div>
              </div>
            </div>
          ) : (
            /* /imagine details */
            <div className="space-y-3 z-10">
              <span className="inline-flex px-3 py-1 text-xs font-extrabold font-mono rounded-lg bg-white/10 border border-white/20 uppercase tracking-widest text-[#e8e8e8]">
                {heroConfig.badge}
              </span>

              <h2 className="font-display font-extrabold text-2xl md:text-3xl tracking-tight leading-tight max-w-lg">
                {heroConfig.title}
              </h2>

              <p className="text-sm text-[#ec8888] leading-relaxed max-w-md font-sans">
                {heroConfig.description}
              </p>
            </div>
          )}
        </div>

        {isEditing ? (
          <div className="absolute right-4 top-4 w-[220px] p-3.5 rounded-xl bg-brand-ink/95 border border-brand-gold/40 text-white shadow-xl space-y-2.5 z-40">
            <span className="text-[10px] uppercase font-bold text-brand-gold block border-b border-white/10 pb-1">Chỉnh sửa ưu đãi</span>
            
            <div>
              <label className="block text-[9px] text-white/40 uppercase font-bold mb-0.5">Tag ưu đãi</label>
              <input
                type="text"
                value={editForm.dealTag}
                onChange={(e) => setEditForm({ ...editForm, dealTag: e.target.value })}
                className="w-full bg-zinc-900 text-white text-[11px] border border-zinc-700 rounded p-1 focus:outline-none focus:border-brand-gold"
              />
            </div>

            <div>
              <label className="block text-[9px] text-white/40 uppercase font-bold mb-0.5">Tiêu đề ưu đãi</label>
              <input
                type="text"
                value={editForm.dealTitle}
                onChange={(e) => setEditForm({ ...editForm, dealTitle: e.target.value })}
                className="w-full bg-zinc-900 text-white text-[11px] border border-zinc-700 rounded p-1 focus:outline-none focus:border-brand-gold"
              />
            </div>

            <div>
              <label className="block text-[9px] text-white/40 uppercase font-bold mb-0.5">Nội dung ưu đãi</label>
              <textarea
                rows={2}
                value={editForm.dealDesc}
                onChange={(e) => setEditForm({ ...editForm, dealDesc: e.target.value })}
                className="w-full bg-zinc-900 text-white text-[10px] border border-zinc-700 rounded p-1 focus:outline-none focus:border-brand-gold"
              />
            </div>

            <div className="flex gap-2 pt-1 border-t border-white/10">
              <button
                onClick={handleSave}
                className="flex-1 py-1.5 rounded bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] flex items-center justify-center gap-1 cursor-pointer"
              >
                <Save className="w-3 h-3" /> Lưu
              </button>
              <button
                onClick={() => setIsEditing(false)}
                className="flex-1 py-1.5 rounded bg-zinc-700 hover:bg-zinc-600 text-zinc-300 font-bold text-[10px] flex items-center justify-center gap-1 cursor-pointer"
              >
                <X className="w-3 h-3" /> Hủy
              </button>
            </div>
          </div>
        ) : (
          /* Absolute Banner: Bundle Deal badge */
          <div className="absolute right-6 top-6 max-w-[210px] p-4 rounded-xl bg-brand-ink/90 border border-white/10 text-white backdrop-blur-md shadow-lg space-y-1">
            <div className="flex items-center gap-1 text-[10px] uppercase font-extrabold text-brand-gold tracking-widest">
              <Bookmark className="w-3 h-3 text-brand-gold fill-brand-gold" />
              <span>{heroConfig.dealTag}</span>
            </div>
            <div className="font-display font-extrabold text-lg text-[#f71313] leading-tight">
              {heroConfig.dealTitle}
            </div>
            <p className="text-[10px] text-white/70 leading-normal font-sans">
              {heroConfig.dealDesc}
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
