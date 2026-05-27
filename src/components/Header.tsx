/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { User, CartItem } from '../types';
import { ShoppingCart, User as UserIcon, ShieldAlert, Sparkles, PhoneCall } from 'lucide-react';
import { formatVND } from '../data';

interface HeaderProps {
  currentUser: User | null;
  cart: CartItem[];
  onOpenCart: () => void;
  onOpenAccount: () => void;
  onOpenAdmin: () => void;
}

export default function Header({
  currentUser,
  cart,
  onOpenCart,
  onOpenAccount,
  onOpenAdmin,
}: HeaderProps) {
  const totalItems = cart.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <header className="sticky top-0 z-40 flex flex-col md:flex-row items-center justify-between gap-4 px-6 py-4 bg-brand-beige/95 border-b border-brand-line/80 backdrop-blur-md">
      {/* Brand logo & title */}
      <div className="flex items-center justify-between w-full md:w-auto">
        <a href="#" className="flex items-center gap-3 group" aria-label="NhapNhangStudio">
          <div className="grid w-10 h-10 place-items-center text-white font-serif font-extrabold text-base tracking-wide rounded-lg bg-gradient-to-br from-[#2f3338] to-[#090a0b] border border-white/10 group-hover:scale-105 transition-transform">
            NN
          </div>
          <div className="flex flex-col">
            <span className="font-display font-extrabold text-lg tracking-tight leading-none text-brand-ink">
              NhapNhangStudio
            </span>
            <span className="text-[10px] uppercase tracking-wider text-brand-accent font-semibold mt-0.5">
              Tattoo Prompt Vault
            </span>
          </div>
        </a>

        {/* Mobile controls display */}
        <div className="flex md:hidden items-center gap-2">
          <button
            onClick={onOpenCart}
            className="flex items-center gap-1.5 px-3 py-2 bg-brand-ink hover:bg-brand-accent text-white rounded-lg transition-colors font-medium text-xs cursor-pointer"
          >
            <ShoppingCart className="w-3.5 h-3.5" />
            <span>{totalItems}</span>
          </button>
        </div>
      </div>

      {/* Navigation center segment */}
      <nav className="hidden md:flex items-center gap-6 text-sm font-semibold text-brand-ink/80">
        <a href="#products" className="hover:text-brand-accent transition-colors">
          Bộ Sưu Tập
        </a>
        <a href="#guide" className="hover:text-brand-accent transition-colors flex items-center gap-1">
          <Sparkles className="w-3.5 h-3.5" /> Hướng Dẫn
        </a>
        <a href="#checkout" className="hover:text-brand-accent transition-colors">
          Thanh Toán
        </a>
        <a 
          href="tel:0971777729" 
          className="flex items-center gap-1 text-xs text-brand-accent/90 bg-brand-accent/5 hover:bg-brand-accent/10 px-2.5 py-1 rounded-full transition-all"
        >
          <PhoneCall className="w-3 h-3" /> 0971.777.729
        </a>
      </nav>

      {/* Desktop action buttons */}
      <div className="flex items-center gap-3 w-full md:w-auto justify-end">
        {currentUser?.username.toLowerCase() === 'admin' && (
          <button
            onClick={onOpenAdmin}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg bg-white border border-brand-line hover:border-brand-accent hover:text-brand-accent transition-colors cursor-pointer text-brand-ink/80"
            id="openAdmin"
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Admin</span>
          </button>
        )}

        <button
          onClick={onOpenAccount}
          className="flex items-center gap-2 px-3.5 py-2 bg-gradient-to-br from-brand-accent to-brand-accent-dark text-white rounded-lg hover:shadow-md hover:brightness-110 active:scale-98 transition-all font-semibold text-xs text-left cursor-pointer"
          id="openAccount"
        >
          <UserIcon className="w-3.5 h-3.5 stroke-[2.5]" />
          <div className="flex flex-col">
            <span className="leading-tight truncate max-w-[80px]">
              {currentUser ? currentUser.username : "Tài khoản"}
            </span>
            <span className="text-[10px] text-white/80 font-normal leading-tight">
              {currentUser ? `${currentUser.points} điểm` : "Đăng nhập / Đăng ký"}
            </span>
          </div>
        </button>

        <button
          onClick={onOpenCart}
          className="hidden md:flex items-center gap-2.5 px-4 py-2 bg-brand-ink hover:bg-brand-accent text-white rounded-lg transition-all font-bold text-xs shadow-sm hover:shadow active:scale-98 cursor-pointer"
          id="openCart"
        >
          <span>Giỏ hàng</span>
          <span className="bg-white text-brand-ink rounded-full w-5 h-5 flex items-center justify-center font-extrabold text-[10px]">
            {totalItems}
          </span>
        </button>
      </div>
    </header>
  );
}
