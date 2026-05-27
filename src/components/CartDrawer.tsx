/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { CartItem } from '../types';
import { X, Plus, Minus, Trash2, ArrowRight } from 'lucide-react';
import { formatVND } from '../data';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cart: CartItem[];
  onUpdateQuantity: (productId: number, action: 'increase' | 'decrease' | 'remove') => void;
}

export default function CartDrawer({
  isOpen,
  onClose,
  cart,
  onUpdateQuantity,
}: CartDrawerProps) {
  if (!isOpen) return null;

  const totalPrice = cart.reduce((acc, item) => acc + item.quantity * item.price, 0);

  return (
    <aside className="fixed inset-0 z-50 flex justify-end" aria-hidden={!isOpen}>
      {/* Backdrop overlay */}
      <div
        className="absolute inset-0 bg-brand-ink/40 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Slide out drawer panel */}
      <section className="relative w-full max-w-md h-full bg-white shadow-2xl flex flex-col z-10 animate-slide-in">
        
        {/* Header segment */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-brand-line/80">
          <div className="space-y-0.5">
            <h2 className="font-display font-extrabold text-lg text-brand-ink">
              Giỏ Hàng Của Bạn
            </h2>
            <p className="text-[10px] text-brand-muted tracking-wide font-sans">
              Chọn mua prompt và thanh toán để tích lũy points.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 px-1.5 rounded-lg bg-brand-beige border border-brand-line/60 hover:text-brand-accent transition-colors font-bold cursor-pointer"
            aria-label="Đóng giỏ hàng"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Itemized contents listing */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-2">
              <span className="text-4xl">🛒</span>
              <p className="text-brand-muted font-bold text-xs font-sans">
                Giỏ hàng của bạn đang trống!
              </p>
              <p className="text-[10px] text-brand-muted/70 max-w-[200px] leading-relaxed font-sans">
                Hãy thêm một vài style tattoo ấn tượng bên ngoài để chuẩn bị tạo tài nguyên xăm.
              </p>
            </div>
          ) : (
            cart.map((item) => (
              <article
                key={item.id}
                className="flex gap-4 p-3 bg-brand-beige/20 border border-brand-line/50 rounded-xl relative group"
              >
                {/* Thumb icon cover */}
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-16 h-16 object-cover rounded-lg border border-brand-line/80"
                />

                {/* Info block */}
                <div className="flex-1 min-w-0 flex flex-col justify-between">
                  <div>
                    <h3 className="text-xs font-bold text-brand-ink truncate pr-6">
                      {item.name}
                    </h3>
                    <p className="text-[10px] text-brand-muted font-sans font-medium">
                      {formatVND(item.price)} / gói
                    </p>
                  </div>

                  {/* Quantity and Actions panel */}
                  <div className="flex items-center justify-between mt-2.5">
                    <div className="flex items-center gap-2 border border-brand-line rounded-lg overflow-hidden bg-white">
                      <button
                        onClick={() => onUpdateQuantity(item.id, 'decrease')}
                        className="p-1 hover:bg-brand-beige text-brand-ink transition-colors cursor-pointer"
                        aria-label="Giảm số lượng"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <strong className="text-xs font-bold font-mono px-1">
                        {item.quantity}
                      </strong>
                      <button
                        onClick={() => onUpdateQuantity(item.id, 'increase')}
                        className="p-1 hover:bg-brand-beige text-brand-ink transition-colors cursor-pointer"
                        aria-label="Tăng số lượng"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>

                    {/* Delete direct btn */}
                    <button
                      onClick={() => onUpdateQuantity(item.id, 'remove')}
                      className="p-1 text-brand-danger/80 hover:text-brand-danger transition-colors cursor-pointer"
                      title="Xóa khỏi giỏ hàng"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </article>
            ))
          )}
        </div>

        {/* Footer actions block */}
        <div className="p-6 border-t border-brand-line/80 bg-[#faf9f6]">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold text-brand-muted">Tổng thành tiền:</span>
            <strong className="font-display font-black text-lg text-brand-accent">
              {formatVND(totalPrice)}
            </strong>
          </div>

          <a
            href="#checkout"
            onClick={onClose}
            className={`w-full inline-flex items-center justify-center gap-2 py-3 bg-brand-accent hover:bg-brand-accent-dark text-white font-extrabold text-sm rounded-xl tracking-tight transition-all active:scale-98 shadow ${
              cart.length === 0 ? 'opacity-50 pointer-events-none' : ''
            }`}
          >
            <span>Đi tới thanh toán</span>
            <ArrowRight className="w-4 h-4" />
          </a>
        </div>
      </section>
    </aside>
  );
}
