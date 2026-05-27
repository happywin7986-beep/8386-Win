/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { User, Product } from '../types';
import { X, LogOut, Award, Clipboard, Check, Key, UserPlus, ShieldAlert } from 'lucide-react';

interface AccountDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User | null;
  products: Product[];
  onLogin: (user: Omit<User, 'unlockedProducts' | 'points'>) => boolean | Promise<boolean>;
  onRegister: (user: Omit<User, 'unlockedProducts' | 'points'>) => boolean | Promise<boolean>;
  onLogout: () => void;
  onOpenAdmin: () => void;
}

export default function AccountDrawer({
  isOpen,
  onClose,
  currentUser,
  products,
  onLogin,
  onRegister,
  onLogout,
  onOpenAdmin,
}: AccountDrawerProps) {
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const [feedbackMsg, setFeedbackMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  // Handle local registration/login submission
  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedbackMsg('');
    setErrorMsg('');

    const payload = {
      username: username.trim(),
      password,
    };

    if (!payload.username || !payload.password) {
      setErrorMsg('Vui lòng điền đầy đủ thông tin đăng nhập.');
      return;
    }

    if (authMode === 'register') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(payload.username)) {
        setErrorMsg('Vui lòng sử dụng địa chỉ email hợp lệ (ví dụ: user@gmail.com) để đăng ký.');
        return;
      }

      const success = await onRegister(payload);
      if (success) {
        setFeedbackMsg('Đăng ký thành viên thành công! Bạn hiện đã được đăng nhập.');
        setUsername('');
        setPassword('');
      } else {
        setErrorMsg('Email đăng ký này đã tồn tại trên hệ thống.');
      }
    } else {
      const success = await onLogin(payload);
      if (success) {
        setFeedbackMsg('Đăng nhập thành công!');
        setUsername('');
        setPassword('');
      } else {
        setErrorMsg('Sai email hoặc mật khẩu, vui lòng thử lại.');
      }
    }
  };

  // List unlocked items
  const unlockedTemplates = products.filter((p) =>
    currentUser?.unlockedProducts.includes(p.id)
  );

  // Copy unlocked prompt to clipboard
  const handleCopyPrompt = (id: number, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <aside className="fixed inset-0 z-50 flex justify-end" aria-hidden={!isOpen}>
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-brand-ink/40 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Slide body */}
      <section className="relative w-full max-w-md h-full bg-white shadow-2xl flex flex-col z-10 animate-slide-in overflow-hidden">
        
        {/* Header segment */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-brand-line/80">
          <div className="space-y-0.5">
            <h2 className="font-display font-extrabold text-lg text-brand-ink">
              Tài Khoản Thành Viên
            </h2>
            <p className="text-[10px] text-brand-muted tracking-wide font-sans">
              Quản lý số điểm nạp và các bộ prompt xăm của riêng bạn.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 px-1.5 rounded-lg bg-brand-beige border border-brand-line/60 hover:text-brand-accent transition-colors font-bold cursor-pointer"
            aria-label="Đóng bảng tài khoản"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Dynamic Inner views */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {currentUser ? (
            /* LOGGED IN VIEW */
            <div className="space-y-6">
              {/* Member points card info */}
              <div className="p-5 rounded-2xl bg-gradient-to-br from-brand-accent to-brand-accent-dark text-white space-y-4 shadow-md">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <span className="text-[9px] uppercase tracking-wider text-white/70 font-bold font-sans">
                      Hạng Thành Viên
                    </span>
                    <h3 className="text-base font-extrabold leading-tight">
                      @{currentUser.username}
                    </h3>
                  </div>

                  <div className="p-2 rounded-xl bg-white/10 border border-white/20">
                    <Award className="w-5 h-5 text-brand-gold" />
                  </div>
                </div>

                <div className="pt-2 border-t border-white/10 flex justify-between items-end">
                  <div className="space-y-0.5">
                    <span className="text-[9px] uppercase tracking-wider text-white/70 font-sans">
                      Số Điểm Khả Dụng (Points)
                    </span>
                    <p className="font-display font-black text-2xl tracking-tight text-white leading-none">
                      {currentUser.points} <span className="text-xs font-bold text-brand-gold">động</span>
                    </p>
                  </div>

                  <a
                    href="#checkout"
                    onClick={onClose}
                    className="px-3 py-1.5 rounded-lg bg-white hover:bg-brand-beige text-brand-accent text-[10.5px] font-bold tracking-tight shadow-sm transition-colors cursor-pointer"
                  >
                    Nạp Thêm Điểm
                  </a>
                </div>
              </div>

              {currentUser.username.toLowerCase() === 'admin' && (
                <div className="p-4 rounded-xl bg-brand-accent/5 border border-brand-accent/20 space-y-3 shadow-sm">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-brand-accent/10 text-brand-accent">
                      <ShieldAlert className="w-5 h-5 animate-pulse" />
                    </div>
                    <div className="text-left">
                      <h4 className="text-xs font-black tracking-tight text-brand-ink uppercase">
                        Quyền Quản Trị Tối Cao
                      </h4>
                      <p className="text-[10px] text-brand-muted font-sans">
                        Hệ thống đã nhận diện tài khoản Admin của bạn.
                      </p>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => {
                      onClose();
                      onOpenAdmin();
                    }}
                    type="button"
                    className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-brand-accent text-white hover:bg-brand-accent-dark font-sans text-xs font-bold rounded-lg tracking-tight transition-colors shadow-sm cursor-pointer"
                  >
                    <ShieldAlert className="w-4 h-4" /> Mở Bảng Quản Trị Admin
                  </button>
                </div>
              )}

              {/* Unlocked items lists */}
              <div className="space-y-3">
                <div className="flex justify-between items-center pb-2 border-b border-brand-line/50">
                  <span className="text-xs font-extrabold tracking-tight text-brand-ink uppercase">
                    Bộ prompt đã mở khóa ({unlockedTemplates.length})
                  </span>
                </div>

                {unlockedTemplates.length === 0 ? (
                  <div className="p-8 border border-dashed border-brand-line rounded-xl text-center text-brand-muted text-xs font-sans">
                    Bạn chưa sử dụng điểm để mở khóa bất kỳ prompt nào. 
                    <br />Hãy chọn style yêu thích bên ngoài để đổi điểm lấy prompt 4K.
                  </div>
                ) : (
                  <div className="space-y-3.5">
                    {unlockedTemplates.map((p) => (
                      <article
                        key={p.id}
                        className="p-4 bg-brand-beige/30 border border-brand-line/80 rounded-xl space-y-2 relative group"
                      >
                        <div className="flex justify-between items-start gap-4">
                          <strong className="text-xs font-extrabold text-brand-ink truncate pr-16 block">
                            {p.name}
                          </strong>
                          
                          <button
                            onClick={() => handleCopyPrompt(p.id, p.prompt)}
                            className="absolute top-3.5 right-3.5 p-1 px-1.5 rounded-md bg-white border border-brand-line text-[10px] font-bold shadow-sm hover:text-brand-accent transition-colors flex items-center gap-1 cursor-pointer"
                            title="Sao chép prompt"
                          >
                            {copiedId === p.id ? (
                              <>
                                <Check className="w-3 h-3 text-emerald-600" />
                                <span className="text-emerald-600">Copied</span>
                              </>
                            ) : (
                              <>
                                <Clipboard className="w-3" />
                                <span>Copy</span>
                              </>
                            )}
                          </button>
                        </div>

                        <code className="text-[11px] font-mono leading-relaxed text-brand-ink/90 block bg-[#faf9f6] p-2.5 rounded-lg border border-brand-line/50 break-all whitespace-pre-wrap">
                          {p.prompt}
                        </code>
                      </article>
                    ))}
                  </div>
                )}
              </div>

              {/* Log out option */}
              <button
                onClick={onLogout}
                className="w-full inline-flex items-center justify-center gap-2 py-3 bg-zinc-100 hover:bg-red-50 hover:text-brand-danger text-zinc-700 rounded-xl text-xs font-extrabold tracking-tight transition-all cursor-pointer border border-zinc-200 hover:border-red-200"
              >
                <LogOut className="w-4 h-4" />
                <span>Đăng xuất tài khoản</span>
              </button>
            </div>
          ) : (
            /* LOGIN / REGISTER FORM */
            <form onSubmit={handleAuthSubmit} className="space-y-4">
              <div className="flex bg-brand-beige border border-brand-line rounded-xl p-1">
                <button
                  type="button"
                  onClick={() => setAuthMode('login')}
                  className={`flex-1 py-1.5 text-xs font-extrabold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    authMode === 'login'
                      ? 'bg-white text-brand-ink shadow-sm'
                      : 'text-brand-muted hover:text-brand-ink'
                  }`}
                >
                  <Key className="w-3.5 h-3.5" />
                  Đăng nhập
                </button>
                <button
                  type="button"
                  onClick={() => setAuthMode('register')}
                  className={`flex-1 py-1.5 text-xs font-extrabold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    authMode === 'register'
                      ? 'bg-white text-brand-ink shadow-sm'
                      : 'text-brand-muted hover:text-brand-ink'
                  }`}
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  Đăng ký mới
                </button>
              </div>

              <div className="space-y-3.5 pt-2">
                <label className="flex flex-col space-y-1 text-xs font-extrabold text-brand-ink/90">
                  <span>{authMode === 'register' ? 'Email đăng ký' : 'Email hoặc tên đăng nhập'}</span>
                  <input
                    type={authMode === 'register' ? 'email' : 'text'}
                    required
                    placeholder={authMode === 'register' ? 'Ví dụ: accounts@gmail.com' : 'Nhập Email của bạn (hoặc "admin")'}
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="px-3.5 py-2.5 border border-brand-line rounded-lg outline-0 bg-brand-beige/25 focus:border-brand-accent focus:bg-white text-xs font-sans font-medium"
                  />
                </label>

                <label className="flex flex-col space-y-1 text-xs font-extrabold text-brand-ink/90">
                  <span>Mật khẩu</span>
                  <input
                    type="password"
                    required
                    placeholder="Mật khẩu của bạn"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="px-3.5 py-2.5 border border-brand-line rounded-lg outline-0 bg-brand-beige/25 focus:border-brand-accent focus:bg-white text-xs font-sans"
                  />
                </label>
              </div>

              {/* Status messages indicator */}
              {errorMsg && (
                <div className="p-3 bg-red-100 border border-red-200 text-red-700 font-bold rounded-xl text-xs">
                  {errorMsg}
                </div>
              )}

              {feedbackMsg && (
                <div className="p-3 bg-emerald-100 border border-emerald-200 text-emerald-800 font-bold rounded-xl text-xs">
                  {feedbackMsg}
                </div>
              )}

              <button
                type="submit"
                className="w-full inline-flex items-center justify-center py-3 bg-brand-ink hover:bg-brand-accent text-white font-extrabold text-xs tracking-tight rounded-xl transition-colors cursor-pointer"
              >
                {authMode === 'login' ? 'Đăng Nhập Ngay' : 'Kích Hoạt Đăng Ký'}
              </button>
            </form>
          )}
        </div>
      </section>
    </aside>
  );
}
