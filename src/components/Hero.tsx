/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Phone, MessageSquare, Facebook, ChevronRight, Bookmark, Music, Flame } from 'lucide-react';
// @ts-ignore
import nhapnhangBanner from '../assets/images/nhapnhang_banner_1779858504097.png';

export default function Hero() {
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
            src={nhapnhangBanner}
            alt="Tattoo artwork preview"
            referrerPolicy="no-referrer"
            className="absolute inset-0 object-cover w-full h-full -z-10 group-hover:scale-105 transition-transform duration-700"
          />

          <div className="absolute inset-x-0 bottom-0 top-1/2 bg-gradient-to-t from-black/90 via-black/40 to-transparent -z-10" />

          {/* /imagine details */}
          <div className="space-y-3 z-10">
            <span className="inline-flex px-3 py-1 text-xs font-extrabold font-mono rounded-lg bg-white/10 border border-white/20 uppercase tracking-widest text-[#e8e8e8]">
              /imagine Prompt
            </span>

            <h2 className="font-display font-extrabold text-2xl md:text-3xl tracking-tight leading-tight max-w-lg">
              NN STUDIO premium tattoo prompt collection
            </h2>

            <p className="text-sm text-[#ec8888] leading-relaxed max-w-md font-sans">
              Công thức prompt có cấu trúc chặt chẽ: Chủ thể, style đặc thù, vị trí giải phẫu xăm, chi tiết nét kim rải, cường độ tương phản, và negative prompt chống rác hình.
            </p>
          </div>
        </div>

        {/* Absolute Banner: Bundle Deal badge */}
        <div className="absolute right-6 top-6 max-w-[210px] p-4 rounded-xl bg-brand-ink/90 border border-white/10 text-white backdrop-blur-md shadow-lg space-y-1">
          <div className="flex items-center gap-1 text-[10px] uppercase font-extrabold text-brand-gold tracking-widest">
            <Bookmark className="w-3 h-3 text-brand-gold fill-brand-gold" />
            <span>Ưu đãi hôm nay</span>
          </div>
          <div className="font-display font-extrabold text-lg text-[#f71313] leading-tight">
            Gói 120+ Prompt
          </div>
          <p className="text-[10px] text-white/70 leading-normal font-sans">
            Full combo Blackwork, Minimal, Lettering và Neo-traditional giá cực hời.
          </p>
        </div>
      </div>
    </section>
  );
}
