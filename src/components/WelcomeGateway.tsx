import React, { useState } from 'react';
import { 
  Cloud, 
  User, 
  Lock, 
  Mail, 
  Briefcase, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  ArrowRight, 
  ShieldCheck, 
  Sparkles,
  BookOpen,
  MapPin,
  FileText,
  Copy,
  ExternalLink,
  Eye
} from 'lucide-react';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signInWithPopup, 
  updateProfile 
} from 'firebase/auth';
import { auth, googleProvider, saveUserProfile } from '../firebase';

interface WelcomeGatewayProps {
  onSuccess: (message: string) => void;
  onBypassGuest?: () => void;
}

export const WelcomeGateway: React.FC<WelcomeGatewayProps> = ({ onSuccess, onBypassGuest }) => {
  // Always default to 'register' per user request: "klo blom register gk bisalog in jadi harus register dlu"
  const [mode, setMode] = useState<'register' | 'login'>('register');

  // Form fields
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('Divisi Program & Penyaluran');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // UI state
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [notRegisteredHint, setNotRegisteredHint] = useState(false);
  const [isUnauthorizedDomain, setIsUnauthorizedDomain] = useState(false);
  const [isOperationNotAllowed, setIsOperationNotAllowed] = useState(false);
  const [domainCopied, setDomainCopied] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setNotRegisteredHint(false);

    if (!displayName.trim()) {
      setErrorMsg('Harap masukkan nama lengkap Anda.');
      return;
    }
    if (!email.trim()) {
      setErrorMsg('Harap masukkan alamat email.');
      return;
    }
    if (password.length < 6) {
      setErrorMsg('Kata sandi minimal 6 karakter demi keamanan akun.');
      return;
    }
    if (password !== confirmPassword) {
      setErrorMsg('Konfirmasi kata sandi tidak cocok. Harap periksa kembali.');
      return;
    }

    setLoading(true);
    setIsUnauthorizedDomain(false);
    setIsOperationNotAllowed(false);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email.trim(), password);
      const user = userCredential.user;

      // Update auth displayName
      await updateProfile(user, { displayName: displayName.trim() });

      // Save user profile to Firestore
      await saveUserProfile(user.uid, {
        displayName: displayName.trim(),
        email: user.email || email.trim(),
        role: role.trim(),
      });

      onSuccess(`Pendaftaran berhasil! Selamat datang di sistem, ${displayName}. Seluruh data Anda kini otomatis disimpan di Cloud.`);
    } catch (err: any) {
      console.error('Registration error:', err);
      if (err.code === 'auth/email-already-in-use') {
        setErrorMsg('Email ini sudah terdaftar sebelumnya. Silakan pindah ke tab "2. Log In (Masuk)".');
        setMode('login');
      } else if (err.code === 'auth/invalid-email') {
        setErrorMsg('Format email tidak valid. Harap gunakan format nama@domain.com.');
      } else if (err.code === 'auth/operation-not-allowed') {
        setIsOperationNotAllowed(true);
        setErrorMsg('Fitur pendaftaran Email/Password belum diaktifkan di Firebase Console.');
      } else if (err.code === 'auth/unauthorized-domain') {
        setIsUnauthorizedDomain(true);
        setErrorMsg(`Domain ${typeof window !== 'undefined' ? window.location.hostname : 'ini'} belum diizinkan di Firebase Authentication.`);
      } else if (err.code === 'auth/weak-password') {
        setErrorMsg('Kata sandi terlalu pendek/lemah. Buat minimal 6 karakter.');
      } else {
        setErrorMsg(err.message || 'Gagal mendaftar. Periksa koneksi internet Anda dan coba lagi.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setNotRegisteredHint(false);
    setIsUnauthorizedDomain(false);
    setIsOperationNotAllowed(false);

    if (!email.trim() || !password) {
      setErrorMsg('Harap masukkan email dan kata sandi yang telah didaftarkan.');
      return;
    }

    setLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email.trim(), password);
      const user = userCredential.user;

      // Ensure profile exists
      await saveUserProfile(user.uid, {
        displayName: user.displayName || email.split('@')[0],
        email: user.email || email,
      });

      onSuccess(`Berhasil masuk! Selamat datang kembali, ${user.displayName || user.email}.`);
    } catch (err: any) {
      console.error('Login error:', err);
      if (err.code === 'auth/user-not-found' || err.code === 'auth/invalid-credential' || err.code === 'auth/wrong-password') {
        setNotRegisteredHint(true);
        setErrorMsg('Akun belum terdaftar atau email/kata sandi salah. Anda harus mendaftar (Register) terlebih dahulu sebelum bisa Log In.');
      } else if (err.code === 'auth/operation-not-allowed') {
        setIsOperationNotAllowed(true);
        setErrorMsg('Masuk Email/Password belum diaktifkan di Firebase Console.');
      } else if (err.code === 'auth/unauthorized-domain') {
        setIsUnauthorizedDomain(true);
        setErrorMsg(`Domain ${typeof window !== 'undefined' ? window.location.hostname : 'ini'} belum diizinkan di Firebase Authentication.`);
      } else {
        setErrorMsg(err.message || 'Gagal masuk. Pastikan akun sudah terdaftar dan kredensial sudah benar.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setErrorMsg(null);
    setNotRegisteredHint(false);
    setIsUnauthorizedDomain(false);
    setIsOperationNotAllowed(false);
    setLoading(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;

      await saveUserProfile(user.uid, {
        displayName: user.displayName || user.email?.split('@')[0] || 'Pengguna',
        email: user.email || '',
        role: 'Staff Program',
      });

      onSuccess(`Berhasil masuk dengan akun Google: ${user.displayName || user.email}!`);
    } catch (err: any) {
      console.error('Google Sign-In error:', err);
      if (err.code === 'auth/popup-closed-by-user') {
        setErrorMsg('Jendela pop-up autentikasi ditutup sebelum selesai.');
      } else if (err.code === 'auth/unauthorized-domain') {
        setIsUnauthorizedDomain(true);
        setErrorMsg(`Domain ${typeof window !== 'undefined' ? window.location.hostname : 'ini'} belum diizinkan di Firebase Authentication.`);
      } else {
        setErrorMsg(err.message || 'Gagal masuk dengan Google.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-emerald-950 to-slate-900 flex items-center justify-center p-4 sm:p-6 md:p-10 font-sans relative overflow-hidden">
      {/* Subtle Background Glow & Grid Accents */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-emerald-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-teal-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:24px_24px] opacity-10 pointer-events-none" />

      {/* Main Container Card */}
      <div className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-emerald-500/30 overflow-hidden flex flex-col my-auto z-10 animate-in fade-in zoom-in-95 duration-300">
        
        {/* Top Header / Portal Branding */}
        <div className="bg-gradient-to-tr from-emerald-800 via-teal-800 to-emerald-900 text-white p-6 sm:p-8 text-center relative border-b border-emerald-700/50">
          
          {/* Logo Emblem */}
          <div className="mx-auto w-16 h-16 sm:w-20 sm:h-20 rounded-2xl sm:rounded-3xl bg-gradient-to-br from-emerald-500 to-teal-400 text-slate-950 flex items-center justify-center font-black text-2xl sm:text-3xl shadow-xl shadow-emerald-950/40 border-2 border-emerald-200/50 mb-3.5 transform hover:scale-105 transition-transform">
            YSB
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950/50 border border-emerald-400/30 text-emerald-200 text-xs font-semibold mb-2">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-300" />
            <span>Portal Resmi Divisi Program & Penyaluran</span>
          </div>

          <h1 className="text-xl sm:text-2xl font-black tracking-tight uppercase text-white font-sans">
            YAYASAN SARANA BERBAGI
          </h1>
          <p className="text-xs sm:text-sm text-emerald-100 font-medium max-w-md mx-auto mt-1 leading-relaxed">
            Sistem Terpadu Penyaluran Wakaf Al-Qur'an, Rencana Kerja 12 Bulan, dan Laporan Eksekutif Resmi
          </p>

          {/* Value Props Bar */}
          <div className="mt-4 pt-3.5 border-t border-emerald-700/50 flex flex-wrap items-center justify-center gap-2 text-[11px] text-emerald-100">
            <span className="flex items-center gap-1 bg-white/10 px-2.5 py-1 rounded-lg border border-white/10">
              <Cloud className="w-3 h-3 text-emerald-300" />
              <span>Simpan Cloud Otomatis</span>
            </span>
            <span className="flex items-center gap-1 bg-white/10 px-2.5 py-1 rounded-lg border border-white/10">
              <BookOpen className="w-3 h-3 text-teal-300" />
              <span>Data Selalu Tersimpan</span>
            </span>
            <span className="flex items-center gap-1 bg-white/10 px-2.5 py-1 rounded-lg border border-white/10">
              <Sparkles className="w-3 h-3 text-amber-300" />
              <span>Multi-Perangkat</span>
            </span>
          </div>
        </div>

        {/* Step Indicator & Tab Switcher */}
        <div className="bg-slate-100/90 p-2 border-b border-slate-200">
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => { setMode('register'); setErrorMsg(null); setNotRegisteredHint(false); }}
              className={`py-3 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all flex flex-col items-center justify-center gap-0.5 ${
                mode === 'register'
                  ? 'bg-white text-emerald-800 shadow-md border border-emerald-600/30 ring-2 ring-emerald-500/20 font-black'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              <div className="flex items-center gap-1.5">
                <User className="w-4 h-4 text-emerald-600" />
                <span>1. Register (Daftar Akun)</span>
              </div>
              <span className="text-[10px] text-emerald-600 font-medium">Pengguna Baru (Wajib Pertama)</span>
            </button>

            <button
              type="button"
              onClick={() => { setMode('login'); setErrorMsg(null); setNotRegisteredHint(false); }}
              className={`py-3 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all flex flex-col items-center justify-center gap-0.5 ${
                mode === 'login'
                  ? 'bg-white text-emerald-800 shadow-md border border-emerald-600/30 ring-2 ring-emerald-500/20 font-black'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              <div className="flex items-center gap-1.5">
                <Lock className="w-4 h-4 text-emerald-600" />
                <span>2. Log In (Masuk)</span>
              </div>
              <span className="text-[10px] text-slate-500 font-medium">Jika Sudah Punya Akun</span>
            </button>
          </div>
        </div>

        {/* Gate Body / Forms */}
        <div className="p-6 sm:p-8 space-y-4 max-h-[60vh] overflow-y-auto">
          
          {/* Notice: Must Register First */}
          {mode === 'login' && !notRegisteredHint && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-2.5 text-amber-900 text-xs">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <p className="leading-relaxed">
                <strong>Catatan:</strong> Jika Anda belum pernah mendaftar sebelumnya, Anda <strong>harus mendaftar (Register) terlebih dahulu</strong> di tab sebelah kiri sebelum bisa masuk.
              </p>
            </div>
          )}

          {/* Error Message with Specific Guidance */}
          {errorMsg && (
            <div className="p-4 bg-red-50/90 border border-red-200 rounded-2xl space-y-3 text-red-800 text-xs shadow-2xs">
              <div className="flex items-start gap-2.5">
                <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="font-bold text-red-900">{errorMsg}</p>
                </div>
              </div>

              {/* Special Guide: Unauthorized Domain (Vercel) */}
              {isUnauthorizedDomain && (
                <div className="bg-white p-3.5 rounded-xl border border-red-200/80 space-y-2.5 text-[11px] text-slate-700">
                  <div className="flex items-center justify-between gap-2 bg-slate-100 p-2 rounded-lg border border-slate-200">
                    <span className="font-mono text-slate-800 font-bold select-all truncate">
                      {typeof window !== 'undefined' ? window.location.hostname : 'programysb.vercel.app'}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        if (typeof window !== 'undefined' && navigator?.clipboard) {
                          navigator.clipboard.writeText(window.location.hostname);
                          setDomainCopied(true);
                          setTimeout(() => setDomainCopied(false), 2500);
                        }
                      }}
                      className="shrink-0 px-2.5 py-1 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded text-[10px] flex items-center gap-1 transition-all"
                    >
                      <Copy className="w-3 h-3" />
                      <span>{domainCopied ? 'Tersalin!' : 'Salin Domain'}</span>
                    </button>
                  </div>
                  
                  <div className="space-y-1 text-slate-600 leading-relaxed">
                    <p className="font-semibold text-slate-800">Cara Mengaktifkan di Firebase Console (Hanya 1 Menit):</p>
                    <ol className="list-decimal list-inside space-y-1 pl-1">
                      <li>Buka <a href="https://console.firebase.google.com" target="_blank" rel="noreferrer" className="text-emerald-700 font-bold underline inline-flex items-center gap-0.5">console.firebase.google.com <ExternalLink className="w-2.5 h-2.5" /></a></li>
                      <li>Pilih Project: <code className="bg-slate-100 px-1 rounded font-bold text-emerald-800">dotted-clarity-lc9s2</code></li>
                      <li>Klik <strong>Build</strong> → <strong>Authentication</strong> → Tab <strong>Settings</strong></li>
                      <li>Pilih <strong>Authorized domains</strong> → Klik <strong>Add domain</strong></li>
                      <li>Tempel domain yang Anda salin di atas, lalu klik <strong>Save (Simpan)</strong>.</li>
                    </ol>
                  </div>

                  {onBypassGuest && (
                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                      <span className="text-[10px] text-slate-500">Ingin langsung melihat dan mencoba sistem sekarang?</span>
                      <button
                        type="button"
                        onClick={onBypassGuest}
                        className="text-[11px] text-emerald-800 font-black hover:underline flex items-center gap-1"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Akses Mode Tamu (Tanpa Login)</span>
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Special Guide: Operation Not Allowed (Email/Password disabled) */}
              {isOperationNotAllowed && (
                <div className="bg-white p-3.5 rounded-xl border border-red-200/80 space-y-2 text-[11px] text-slate-700">
                  <p className="font-semibold text-slate-800">Cara Mengaktifkan Email & Sandi di Firebase:</p>
                  <ol className="list-decimal list-inside space-y-1 pl-1 text-slate-600">
                    <li>Buka <a href="https://console.firebase.google.com" target="_blank" rel="noreferrer" className="text-emerald-700 font-bold underline inline-flex items-center gap-0.5">console.firebase.google.com <ExternalLink className="w-2.5 h-2.5" /></a></li>
                    <li>Pilih menu <strong>Authentication</strong> → Tab <strong>Sign-in method</strong></li>
                    <li>Klik penyedia <strong>Email/Password</strong></li>
                    <li>Nyalakan toggle <strong>Enable (Aktifkan)</strong> lalu klik <strong>Save</strong>.</li>
                  </ol>
                  <p className="text-[10px] text-slate-500 italic">
                    Atau gunakan tombol Google Sign-In setelah domain Vercel diotorisasi di atas.
                  </p>
                </div>
              )}

              {notRegisteredHint && (
                <button
                  type="button"
                  onClick={() => { setMode('register'); setErrorMsg(null); setNotRegisteredHint(false); setIsUnauthorizedDomain(false); }}
                  className="mt-1 w-full py-2 px-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl transition-all text-center flex items-center justify-center gap-1.5 shadow-2xs"
                >
                  <User className="w-3.5 h-3.5" />
                  <span>Klik di Sini untuk Daftar Akun Baru (Register)</span>
                </button>
              )}
            </div>
          )}

          {/* 1-Click Google Sign In */}
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full py-3 px-4 bg-white hover:bg-slate-50 border border-slate-300 hover:border-slate-400 text-slate-700 font-bold rounded-xl text-xs sm:text-sm transition-all flex items-center justify-center gap-3 shadow-2xs group"
          >
            <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>{mode === 'register' ? 'Daftar / Masuk Instan dengan Akun Google (1-Klik)' : 'Masuk Cepat dengan Akun Google'}</span>
          </button>

          <div className="flex items-center gap-3">
            <div className="h-px bg-slate-200 flex-1" />
            <span className="text-[11px] text-slate-400 uppercase font-bold tracking-wider">Atau dengan Email Yayasan</span>
            <div className="h-px bg-slate-200 flex-1" />
          </div>

          {/* Form Content */}
          {mode === 'register' ? (
            <form onSubmit={handleRegister} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Nama Lengkap <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="Contoh: Ahmad Fauzan"
                    className="w-full pl-9 pr-3 py-2.5 text-xs sm:text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-slate-50/50 focus:bg-white transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Alamat Email <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="nama@yayasan.org"
                    className="w-full pl-9 pr-3 py-2.5 text-xs sm:text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-slate-50/50 focus:bg-white transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Jabatan / Divisi Yayasan
                </label>
                <div className="relative">
                  <Briefcase className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 text-xs sm:text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-slate-50/50 focus:bg-white transition-all text-slate-700"
                  >
                    <option value="Divisi Program & Penyaluran">Divisi Program & Penyaluran</option>
                    <option value="Kepala Divisi Program">Kepala Divisi Program</option>
                    <option value="Ketua Yayasan">Ketua Yayasan</option>
                    <option value="Sekretaris Yayasan">Sekretaris Yayasan</option>
                    <option value="Bendahara / Keuangan">Bendahara / Keuangan</option>
                    <option value="Relawan & Surveior Lapangan">Relawan & Surveior Lapangan</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Kata Sandi <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Min. 6 karakter"
                      className="w-full pl-9 pr-3 py-2.5 text-xs sm:text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-slate-50/50 focus:bg-white transition-all"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Ulangi Kata Sandi <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="password"
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Ketik ulang sandi"
                      className="w-full pl-9 pr-3 py-2.5 text-xs sm:text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-slate-50/50 focus:bg-white transition-all"
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 py-3 px-4 bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white font-extrabold rounded-xl text-xs sm:text-sm shadow-lg shadow-emerald-700/25 transition-all flex items-center justify-center gap-2"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <CheckCircle2 className="w-4 h-4" />
                )}
                <span>{loading ? 'Mendaftarkan Akun...' : 'Daftar Akun Baru & Aktifkan Cloud'}</span>
              </button>
            </form>
          ) : (
            <form onSubmit={handleLogin} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Alamat Email Terdaftar <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="nama@yayasan.org"
                    className="w-full pl-9 pr-3 py-2.5 text-xs sm:text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-slate-50/50 focus:bg-white transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Kata Sandi <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Masukkan kata sandi Anda"
                    className="w-full pl-9 pr-3 py-2.5 text-xs sm:text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-slate-50/50 focus:bg-white transition-all"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 py-3 px-4 bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white font-extrabold rounded-xl text-xs sm:text-sm shadow-lg shadow-emerald-700/25 transition-all flex items-center justify-center gap-2"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <ArrowRight className="w-4 h-4" />
                )}
                <span>{loading ? 'Memeriksa Kredensial...' : 'Masuk ke Sistem Program'}</span>
              </button>
            </form>
          )}
        </div>

        {/* Footer info & switch */}
        <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 text-center text-xs text-slate-600">
          {mode === 'register' ? (
            <p>
              Sudah pernah mendaftar akun sebelumnya?{' '}
              <button
                type="button"
                onClick={() => { setMode('login'); setErrorMsg(null); setNotRegisteredHint(false); setIsUnauthorizedDomain(false); }}
                className="text-emerald-700 font-bold hover:underline"
              >
                Masuk (Log In) di sini
              </button>
            </p>
          ) : (
            <p>
              Belum pernah mendaftar akun?{' '}
              <button
                type="button"
                onClick={() => { setMode('register'); setErrorMsg(null); setNotRegisteredHint(false); setIsUnauthorizedDomain(false); }}
                className="text-emerald-700 font-extrabold hover:underline"
              >
                Harus mendaftar (Register) di sini dahulu
              </button>
            </p>
          )}

          {onBypassGuest && (
            <div className="mt-2.5 pt-2 border-t border-slate-200/70 flex items-center justify-center">
              <button
                type="button"
                onClick={onBypassGuest}
                className="text-[11px] text-slate-500 hover:text-emerald-800 underline font-medium transition-colors"
              >
                Lanjutkan sementara dalam Mode Tamu (Pratinjau Langsung Tanpa Akun) →
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
