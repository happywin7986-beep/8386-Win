/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { HelpCircle, Layers, CheckSquare, Coins } from 'lucide-react';

export default function Guide() {
  const steps = [
    {
      num: "01",
      title: "Chọn Gói Prompt Style",
      desc: "Lọc theo các trường phái xăm (Blackwork, Minimal, Brushstroke, vv), xem chi tiết số lượng rồi thêm gói sản phẩm bạn cần mua vào giỏ hàng.",
      icon: <Layers className="w-5 h-5 text-brand-gold" />,
    },
    {
      num: "02",
      title: "Quét QR & Chuyển Khoản",
      desc: "Chuyển khoản chính xác số tiền của giỏ hàng kèm mã hóa đơn (ví dụ: NN1234). Hệ thống sẽ tự cấp Token-Points tương ứng vào tài khoản của bạn.",
      icon: <Coins className="w-5 h-5 text-brand-gold" />,
    },
    {
      num: "03",
      title: "Đăng Tải Bill Nhận Điểm",
      desc: "Điền tên đăng nhập, tải ảnh chụp giao diện thành công của ngân hàng lên mục gửi đơn. Admin sẽ đối chiếu và duyệt điểm ngay lập tức.",
      icon: <CheckSquare className="w-5 h-5 text-brand-gold" />,
    },
  ];

  return (
    <section id="guide" className="px-6 md:px-12 lg:px-16 py-12 text-brand-ink max-w-7xl mx-auto scrolling-mt">
      {/* Section Heading info */}
      <div className="flex flex-col space-y-2 mb-10 max-w-xl">
        <div className="inline-flex items-center gap-1.5 text-xs tracking-wider uppercase font-extrabold text-brand-accent">
          <HelpCircle className="w-4 h-4" />
          <span>Làm thế nào để mua & dùng?</span>
        </div>
        <h2 className="font-display font-extrabold text-2xl md:text-3xl tracking-tight text-brand-ink">
          Hướng dẫn 3 bước sở hữu prompt xăm
        </h2>
        <p className="text-sm text-brand-muted font-sans">
          Quá trình thanh toán hoàn toàn minh bạch, hỗ trợ tối đa việc cộng điểm tự động thông qua duyệt bill thủ công.
        </p>
      </div>

      {/* Steps Row grids */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {steps.map((step, idx) => (
          <article
            key={idx}
            className="flex flex-col space-y-4 p-6 md:p-8 bg-white border border-brand-line hover:border-brand-accent rounded-2xl shadow-sm hover:shadow-md transition-all group"
          >
            <div className="flex items-center justify-between">
              <span className="font-display font-black text-3xl text-brand-line group-hover:text-brand-accent/20 transition-colors">
                {step.num}
              </span>
              <div className="p-2.5 rounded-xl bg-brand-beige border border-brand-line/60">
                {step.icon}
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="font-display font-extrabold text-base tracking-tight text-brand-ink">
                {step.title}
              </h3>
              <p className="text-xs text-brand-muted leading-relaxed font-sans">
                {step.desc}
              </p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
