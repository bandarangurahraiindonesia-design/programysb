import React, { useState } from 'react';
import { 
  X, 
  Mail, 
  Lock, 
  User, 
  Briefcase, 
  Cloud, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  ArrowRight,
  ShieldCheck,
  Sparkles
} from 'lucide-react';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signInWithPopup, 
  updateProfile 
} from 'firebase/auth';
import { auth, googleProvider, saveUserProfile } from '../firebase';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'register' | 'login';
  onSuccess: (message: string) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  initialMode = 'register',
  onSuccess,
}) => {
  const [mode, setMode] = useState<'register' | 'login'>(initialMode);
  
  // Form states
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('Divisi Program');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // UI status
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [providerTip, setProviderTip] = useState(false);

  if (!isOpen) return null;

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setProviderTip(false);

    if (!displayName.trim()) {
      setErrorMsg('Harap masukkan nama lengkap Anda.');
      return;
    }
    if (!email.trim()) {
      setErrorMsg('Harap masukkan alamat email yang valid.');
      return;
    }
    if (password.length < 6) {
      setErrorMsg('Kata sandi minimal terdiri dari 6 karakter.');
      return;
    }
    if (password !== confirmPassword) {
      setErrorMsg('Konfirmasi kata sandi tidak cocok.');
      return;
    }

    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email.trim(), password);
      const user = userCredential.user;

      // Update user display name in Auth
      await updateProfile(user, { displayName: displayName.trim() });

      // Save profile to Firestore
      await saveUserProfile(user.uid, {
        displayName: displayName.trim(),
        email: user.email || email.trim(),
        role: role.trim(),
      });

      onSuccess(`Pendaftaran berhasil! Selamat datang, ${displayName}. Data Anda kini otomatis tersimpan di Cloud.`);
      onClose();
    } catch (err: any) {
      console.error('Registration error:', err);
      if (err.code === 'auth/email-already-in-use') {
        setErrorMsg('Email ini sudah terdaftar. Silakan pindah ke tab "Masuk (Log In)".');
      } else if (err.code === 'auth/invalid-email') {
        setErrorMsg('Format email tidak valid.');
      } else if (err.code === 'auth/operation-not-allowed') {
        setProviderTip(true);
        setErrorMsg('Pendaftaran Email/Password belum diaktifkan di Firebase Console. Aktifkan di Firebase Console > Authentication > Sign-in method.');
      } else if (err.code === 'auth/unauthorized-domain') {
        setErrorMsg(`Domain (${typeof window !== 'undefined' ? window.location.hostname : 'website'}) belum diizinkan di Firebase. Tambahkan di Firebase Console > Authentication > Settings > Authorized domains.`);
      } else if (err.code === 'auth/weak-password') {
        setErrorMsg('Kata sandi terlalu mudah ditebak.');
      } else {
        setErrorMsg(err.message || 'Gagal mendaftarkan akun. Silakan coba lagi.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setProviderTip(false);

    if (!email.trim() || !password) {
      setErrorMsg('Harap isi email dan kata sandi.');
      return;
    }

    setLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email.trim(), password);
      const user = userCredential.user;

      // Ensure profile exists in Firestore
      await saveUserProfile(user.uid, {
        displayName: user.displayName || email.split('@')[0],
        email: user.email || email,
      });

      onSuccess(`Berhasil masuk! Selamat datang kembali, ${user.displayName || user.email}.`);
      onClose();
    } catch (err: any) {
      console.error('Login error:', err);
      if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        setErrorMsg('Email atau kata sandi tidak sesuai.');
      } else if (err.code === 'auth/operation-not-allowed') {
        setProviderTip(true);
        setErrorMsg('Masuk dengan Email/Password belum diaktifkan di Firebase Console. Aktifkan di menu Sign-in method di Firebase Console.');
      } else if (err.code === 'auth/unauthorized-domain') {
        setErrorMsg(`Domain (${typeof window !== 'undefined' ? window.location.hostname : 'website'}) belum diotorisasi di Firebase Authentication Settings.`);
      } else {
        setErrorMsg(err.message || 'Gagal masuk akun. Periksa koneksi atau kredensial Anda.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setErrorMsg(null);
    setLoading(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;

      // Save user profile
      await saveUserProfile(user.uid, {
        displayName: user.displayName || user.email?.split('@')[0] || 'Pengguna',
        email: user.email || '',
        role: 'Staff Program',
      });

      onSuccess(`Berhasil masuk dengan akun Google: ${user.displayName || user.email}! Data tersimpan otomatis di Cloud.`);
      onClose();
    } catch (err: any) {
      console.error('Google Sign-In error:', err);
      if (err.code === 'auth/popup-closed-by-user') {
        setErrorMsg('Jendela pop-up ditutup sebelum masuk.');
      } else if (err.code === 'auth/unauthorized-domain') {
        setErrorMsg(`Domain (${typeof window !== 'undefined' ? window.location.hostname : 'website'}) belum diizinkan di Firebase. Buka Firebase Console > Authentication > Settings > Authorized domains lalu tambahkan domain ini.`);
      } else {
        setErrorMsg(err.message || 'Gagal masuk dengan Google.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div 
        className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with Visual Banner */}
        <div className="bg-gradient-to-r from-emerald-700 via-teal-700 to-emerald-800 text-white p-5 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-emerald-100 hover:text-white bg-white/10 hover:bg-white/20 p-1.5 rounded-full transition-all"
          >
            <X className="w-4 h-4" />
          </button>
          
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-white/15 border border-white/20 flex items-center justify-center shadow-inner">
              <Cloud className="w-5 h-5 text-emerald-200" />
            </div>
            <div>
              <h2 className="text-lg font-bold">
                {mode === 'register' ? 'Daftar Akun Baru' : 'Masuk ke Akun'}
              </h2>
              <p className="text-xs text-emerald-100">
                Penyimpanan Cloud Otomatis Yayasan Sarana Berbagi
              </p>
            </div>
          </div>
          
          <p className="text-xs text-emerald-50/90 leading-relaxed mt-2 bg-emerald-900/40 p-2.5 rounded-xl border border-emerald-500/30">
            ✨ Simpan semua rencana bulanan, progres distribusi, koordinat peta, dan dokumen resmi langsung ke Cloud agar tidak hilang dan bisa dibuka dari mana saja.
          </p>
        </div>

        {/* Tab Switcher: Register vs Login */}
        <div className="flex border-b border-slate-200 bg-slate-50 p-1">
          <button
            type="button"
            onClick={() => { setMode('register'); setErrorMsg(null); }}
            className={`flex-1 py-2.5 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              mode === 'register'
                ? 'bg-white text-emerald-700 shadow-2xs border border-slate-200/80 font-extrabold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>1. Register (Daftar Akun)</span>
          </button>
          <button
            type="button"
            onClick={() => { setMode('login'); setErrorMsg(null); }}
            className={`flex-1 py-2.5 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              mode === 'login'
                ? 'bg-white text-emerald-700 shadow-2xs border border-slate-200/80 font-extrabold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Lock className="w-3.5 h-3.5" />
            <span>2. Log In (Masuk)</span>
          </button>
        </div>

        {/* Body Content */}
        <div className="p-5 overflow-y-auto space-y-4">
          {errorMsg && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2.5 text-red-700 text-xs">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="font-semibold">{errorMsg}</p>
                {providerTip && (
                  <p className="text-[11px] text-red-600">
                    Tips: Klik tombol <strong>Masuk dengan Google</strong> di bawah untuk akses langsung tanpa perlu verifikasi email.
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Quick Google Sign In */}
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full py-2.5 px-4 bg-white hover:bg-slate-50 border border-slate-300 hover:border-slate-400 text-slate-700 font-semibold rounded-xl text-xs transition-all flex items-center justify-center gap-2.5 shadow-2xs"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
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
            <span>{mode === 'register' ? 'Daftar Cepat dengan Google (1-Klik)' : 'Masuk Cepat dengan Google'}</span>
          </button>

          <div className="flex items-center gap-3">
            <div className="h-px bg-slate-200 flex-1" />
            <span className="text-[11px] text-slate-400 uppercase font-bold tracking-wider">Atau dengan Email</span>
            <div className="h-px bg-slate-200 flex-1" />
          </div>

          {/* Form */}
          {mode === 'register' ? (
            <form onSubmit={handleRegister} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Nama Lengkap</label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    required
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="Contoh: Muhammad Ihsan"
                    className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-slate-50/50 focus:bg-white transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Alamat Email</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="nama@yayasan.org"
                    className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-slate-50/50 focus:bg-white transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Jabatan / Divisi</label>
                <div className="relative">
                  <Briefcase className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-slate-50/50 focus:bg-white transition-all text-slate-700"
                  >
                    <option value="Divisi Program & Penyaluran">Divisi Program & Penyaluran</option>
                    <option value="Kepala Divisi Program">Kepala Divisi Program</option>
                    <option value="Ketua Yayasan">Ketua Yayasan</option>
                    <option value="Sekretaris Yayasan">Sekretaris Yayasan</option>
                    <option value="Bendahara / Keuangan">Bendahara / Keuangan</option>
                    <option value="Relawan / Surveior Lapangan">Relawan / Surveior Lapangan</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Kata Sandi</label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Min. 6 digit"
                      className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-slate-50/50 focus:bg-white transition-all"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Ulangi Sandi</label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="password"
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Ulangi sandi"
                      className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-slate-50/50 focus:bg-white transition-all"
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 py-2.5 px-4 bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white font-bold rounded-xl text-xs shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <CheckCircle2 className="w-4 h-4" />
                )}
                <span>{loading ? 'Mendaftarkan Akun...' : 'Daftar & Aktifkan Simpan Otomatis'}</span>
              </button>
            </form>
          ) : (
            <form onSubmit={handleLogin} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Alamat Email</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="nama@yayasan.org"
                    className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-slate-50/50 focus:bg-white transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Kata Sandi</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Masukkan kata sandi Anda"
                    className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-slate-50/50 focus:bg-white transition-all"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 py-2.5 px-4 bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white font-bold rounded-xl text-xs shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <ArrowRight className="w-4 h-4" />
                )}
                <span>{loading ? 'Memverifikasi...' : 'Masuk ke Akun Cloud'}</span>
              </button>
            </form>
          )}
        </div>

        {/* Footer info */}
        <div className="bg-slate-50 px-5 py-3 border-t border-slate-200 text-center text-[11px] text-slate-500">
          {mode === 'register' ? (
            <p>
              Sudah punya akun sebelumnya?{' '}
              <button
                type="button"
                onClick={() => { setMode('login'); setErrorMsg(null); }}
                className="text-emerald-700 font-bold hover:underline"
              >
                Masuk di sini
              </button>
            </p>
          ) : (
            <p>
              Belum memiliki akun?{' '}
              <button
                type="button"
                onClick={() => { setMode('register'); setErrorMsg(null); }}
                className="text-emerald-700 font-bold hover:underline"
              >
                Daftar akun baru di sini
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
