/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { User, CartItem, PaymentRequest } from '../types';
import { QrCode, ClipboardCheck, ArrowRight, UserCheck, UploadCloud, FileImage, ShieldCheck } from 'lucide-react';
import { formatVND } from '../data';

interface CheckoutProps {
  currentUser: User | null;
  cart: CartItem[];
  onOpenAccount: () => void;
  onOpenCart: () => void;
  onSubmitOrder: (request: Omit<PaymentRequest, 'id' | 'createdAt' | 'status'>) => void;
}

export default function Checkout({
  currentUser,
  cart,
  onOpenAccount,
  onOpenCart,
  onSubmitOrder,
}: CheckoutProps) {
  const [orderCode, setOrderCode] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [note, setNote] = useState('');
  const [receiptBase64, setReceiptBase64] = useState<string | null>(null);
  const [receiptFileName, setReceiptFileName] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Auto generate order code on load
  const generateOrderCode = () => {
    const randomNum = String(Math.floor(Math.random() * 10000)).padStart(4, '0');
    setOrderCode(`NN${randomNum}`);
  };

  useEffect(() => {
    generateOrderCode();
  }, [cart]);

  // Calculate cart metrics
  const totalQuantity = cart.reduce((acc, item) => acc + item.quantity, 0);
  const totalPrice = cart.reduce((acc, item) => acc + item.quantity * item.price, 0);
  const totalPoints = cart.reduce((acc, item) => acc + (item.pointsCost || 0) * item.quantity, 0);

  // Parse receipt image file input
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setReceiptFileName(file.name);
    const reader = new FileReader();
    reader.onload = () => {
      setReceiptBase64(reader.result as string);
    };
    reader.onerror = () => {
      setErrorMessage('Đã xảy ra lỗi khi đọc file ảnh biên lai.');
    };
    reader.readAsDataURL(file);
  };

  // Submit checkout form handler
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!currentUser) {
      setErrorMessage('Bạn cần ĐĂNG NHẬP tài khoản thành viên trước khi gửi đơn duyệt.');
      onOpenAccount();
      return;
    }

    if (cart.length === 0) {
      setErrorMessage('Giỏ hàng trống! Hãy thêm ít nhất một gói prompt để tiếp tục thanh toán.');
      onOpenCart();
      return;
    }

    if (!receiptBase64) {
      setErrorMessage('Vui lòng tải ảnh biên lai/hóa đơn chuyển khoản thành công lên để đối chiếu.');
      return;
    }

    // Submit validated payload up
    onSubmitOrder({
      orderCode,
      username: currentUser.username,
      quantity: totalQuantity,
      total: totalPrice,
      points: totalPoints,
      receipt: receiptBase64,
    });

    // Reset fields
    setSuccessMessage(`Đã gửi yêu cầu thanh toán thành công với mã đơn ${orderCode}! Admin sẽ đối chiếu hóa đơn và cộng ngay ${totalPoints} điểm vào tài khoản của bạn.`);
    setName('');
    setPhone('');
    setNote('');
    setReceiptBase64(null);
    setReceiptFileName('');
    generateOrderCode();
  };

  // MB Bank Dynamic API QR generator link
  const qrDataUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=NHAPNHANGSTUDIO-TRANSFER-CODE-${orderCode}-TOTAL-${totalPrice}`;

  return (
    <section id="checkout" className="px-6 md:px-12 lg:px-16 py-12 text-brand-ink max-w-7xl mx-auto scrolling-mt">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        
        {/* Left Column: Bank QR details (Span 5) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="space-y-1">
            <span className="inline-flex items-center gap-1 text-[10px] font-extrabold uppercase bg-brand-accent/10 text-brand-accent px-2.5 py-0.5 rounded-md tracking-wider">
              <QrCode className="w-3.5 h-3.5" />
              <span>Chuyển khoản an toàn</span>
            </span>
            <h2 className="font-display font-extrabold text-2xl md:text-3xl text-brand-ink tracking-tight">
              Quét mã QR thanh toán
            </h2>
            <p className="text-xs text-brand-muted font-sans leading-relaxed">
              Bạn có thể quét mã QR tự động để điền tiền và nội dung CK, hoặc nhập tay chi tiết tài khoản bên dưới.
            </p>
          </div>

          {/* QR Box Wrapper */}
          <div className="flex flex-col sm:flex-row items-center gap-6 p-6 bg-white border border-brand-line rounded-2xl shadow-sm">
            <div className="flex-shrink-0 grid w-40 h-40 place-items-center bg-brand-beige p-3 border border-brand-line/80 rounded-xl">
              <img
                src={qrDataUrl}
                alt={`Mã QR ${orderCode}`}
                className="w-full h-full object-contain"
              />
            </div>

            <div className="space-y-2 text-xs">
              <span className="inline-block px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded">
                VietQR Auto-Fill
              </span>
              <div className="space-y-1 font-sans text-brand-ink/90">
                <p>Ngân hàng: <strong className="font-semibold text-brand-ink">MB Bank (Quân Đội)</strong></p>
                <p>Số tài khoản: <strong className="font-semibold text-brand-ink">0971777729</strong></p>
                <p>Chủ tài khoản: <strong className="font-semibold text-brand-ink">TRAN HUU TAI</strong></p>
                <p className="pt-2 border-t border-brand-line/50">Mã đơn hàng: <strong className="font-mono text-brand-accent text-sm font-extrabold">{orderCode}</strong></p>
                <p>Cú pháp CK: <strong className="text-brand-accent text-sm font-mono font-extrabold">{orderCode}</strong></p>
              </div>
            </div>
          </div>

          {/* Prompt Order Cart status card */}
          <div className="p-6 bg-[#faf9f6] border border-brand-line/80 rounded-2xl text-xs space-y-4">
            <h3 className="font-display font-extrabold text-sm text-brand-ink flex items-center gap-1.5 pb-2.5 border-b border-brand-line/60">
              <ShieldCheck className="w-4 h-4 text-brand-gold" />
              <span>Tóm tắt đơn hàng thanh toán</span>
            </h3>

            {cart.length === 0 ? (
              <p className="text-brand-muted text-center py-2">
                Giỏ hàng trống. Thêm gói prompt để hiển thị đơn hoàn hảo.
              </p>
            ) : (
              <div className="space-y-3">
                <div className="space-y-2">
                  {cart.map((item) => (
                    <div key={item.id} className="flex justify-between items-center text-brand-ink/90">
                      <span>{item.name} <strong className="text-[10px] text-brand-muted">x{item.quantity}</strong></span>
                      <span className="font-mono font-bold">{formatVND(item.price * item.quantity)}</span>
                    </div>
                  ))}
                </div>

                <div className="pt-3 border-t border-brand-line/50 space-y-2 font-sans font-medium">
                  <div className="flex justify-between items-center text-brand-muted">
                    <span>Tổng số lượng:</span>
                    <span>{totalQuantity} gói</span>
                  </div>
                  <div className="flex justify-between items-center text-brand-muted">
                    <span>Điểm cộng tích luỹ:</span>
                    <span className="text-brand-gold font-bold">+{totalPoints} points</span>
                  </div>
                  <div className="flex justify-between items-center text-sm font-bold text-brand-ink pt-1.5 border-t border-brand-line/30">
                    <span className="text-brand-accent">Tổng CK thực tế:</span>
                    <span className="text-brand-accent font-display text-base font-black">
                      {formatVND(totalPrice)}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Interactive Form Upload Client (Span 7) */}
        <form onSubmit={handleSubmit} className="lg:col-span-7 bg-white p-6 md:p-8 border border-brand-line rounded-2xl shadow-md space-y-5">
          <div className="space-y-1 pb-3 border-b border-brand-line/50">
            <h3 className="font-display font-extrabold text-lg text-brand-ink">
              Thông tin nhận file & biên lai chuyển khoản
            </h3>
            <p className="text-xs text-brand-muted font-sans leading-relaxed">
              Điền địa chỉ nhận và tải lên ảnh chụp xác minh đã chuyển tiền thành công để chúng tôi đổi điểm mở khóa prompt ngay tức khắc.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Full Name */}
            <label className="flex flex-col space-y-2 text-xs font-extrabold text-brand-ink/90">
              <span>Họ và tên</span>
              <input
                type="text"
                placeholder="Nguyễn Văn A"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="px-3.5 py-3 border border-brand-line rounded-xl outline-0 bg-brand-beige/20 focus:border-brand-accent transition-colors font-sans font-medium focus:bg-white text-xs"
              />
            </label>

            {/* Email/Zalo */}
            <label className="flex flex-col space-y-2 text-xs font-extrabold text-brand-ink/90">
              <span>Số Zalo hoặc Email nhận file</span>
              <input
                type="text"
                placeholder="0912.345.678 hoặc email@example.com"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="px-3.5 py-3 border border-brand-line rounded-xl outline-0 bg-brand-beige/20 focus:border-brand-accent transition-colors font-sans font-medium focus:bg-white text-xs"
              />
            </label>
          </div>

          {/* Notes */}
          <label className="flex flex-col space-y-2 text-xs font-extrabold text-brand-ink/90">
            <span>Ghi chú thêm (Không bắt buộc)</span>
            <textarea
              placeholder="Yêu cầu riêng về độ phân giải, định dạng hoặc hỗ trợ đặc thù..."
              rows={2}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="px-3.5 py-3 border border-brand-line rounded-xl outline-0 bg-brand-beige/20 focus:border-brand-accent transition-colors font-sans font-medium focus:bg-white text-xs resize-y"
            />
          </label>

          {/* Receipt File Upload */}
          <div className="space-y-2">
            <span className="block text-xs font-extrabold text-brand-ink/90">
              Biên lai chuyển khoản thành công (Ảnh màn hình CK)
            </span>
            <div className="relative border-2 border-dashed border-brand-line hover:border-brand-accent rounded-xl p-5 bg-brand-beige/20 transition-all flex flex-col items-center justify-center text-center cursor-pointer">
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                title="Tải bill lên"
              />
              <UploadCloud className="w-8 h-8 text-brand-muted/70 mb-2" />
              <p className="text-xs font-bold text-brand-ink">
                {receiptFileName || 'Kéo thả hoặc click để chọn ảnh bill'}
              </p>
              <p className="text-[10px] text-brand-muted mt-1 font-sans">
                Hỗ trợ PNG, JPG, WEBP chụp màn hình ngân hàng/MoMo
              </p>
            </div>
          </div>

          {/* Upload Status Image Preview */}
          {receiptBase64 && (
            <div className="p-4 border border-brand-line/80 rounded-xl bg-brand-beige/30 flex items-center gap-4">
              <FileImage className="w-10 h-10 text-brand-accent" />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-brand-ink truncate">
                  {receiptFileName}
                </p>
                <span className="text-[10px] text-brand-accent font-bold">
                  File ảnh đã sẵn sàng gửi đi
                </span>
              </div>
              <img
                src={receiptBase64}
                alt="Receipt preview"
                className="w-16 h-16 object-cover rounded-lg border border-brand-line"
              />
            </div>
          )}

          {/* Form alert states feedback */}
          {errorMessage && (
            <div className="p-3 bg-red-100 border border-red-200 text-red-700 font-bold rounded-xl text-xs">
              {errorMessage}
            </div>
          )}

          {successMessage && (
            <div className="p-3 bg-emerald-100 border border-emerald-200 text-emerald-800 font-bold rounded-xl text-xs space-y-1">
              <div className="flex items-center gap-1.5">
                <span className="inline-block w-2 h-2 rounded-full bg-emerald-600"></span>
                <span className="font-extrabold">Gửi đơn thành công!</span>
              </div>
              <p className="font-normal text-[11px] leading-relaxed text-emerald-700 font-sans">
                {successMessage}
              </p>
            </div>
          )}

          {/* Submit btn */}
          <button
            type="submit"
            className="w-full inline-flex items-center justify-center gap-2 py-3 bg-brand-accent hover:bg-brand-accent-dark text-white rounded-xl shadow font-extrabold text-sm tracking-tight transition-all cursor-pointer active:scale-98"
          >
            <span>Gửi đơn duyệt cộng điểm</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      </div>
    </section>
  );
}
