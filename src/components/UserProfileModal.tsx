import React, { useState } from 'react';
import { 
  X, 
  User, 
  Mail, 
  Briefcase, 
  Cloud, 
  CheckCircle2, 
  LogOut, 
  RefreshCw, 
  UploadCloud, 
  DownloadCloud, 
  ShieldCheck,
  Calendar,
  MapPin,
  FileText,
  Loader2
} from 'lucide-react';
import { signOut, User as FirebaseUser } from 'firebase/auth';
import { auth, saveUserProfile, UserProfileData } from '../firebase';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: FirebaseUser;
  profile: UserProfileData | null;
  lastSavedTime: string | null;
  isSaving: boolean;
  onManualSave: () => Promise<void>;
  onManualLoad: () => Promise<void>;
  onNotify: (msg: string) => void;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({
  isOpen,
  onClose,
  user,
  profile,
  lastSavedTime,
  isSaving,
  onManualSave,
  onManualLoad,
  onNotify,
}) => {
  const [editing, setEditing] = useState(false);
  const [displayName, setDisplayName] = useState(profile?.displayName || user.displayName || '');
  const [role, setRole] = useState(profile?.role || 'Staff Program Yayasan');
  const [isUpdating, setIsUpdating] = useState(false);

  if (!isOpen) return null;

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdating(true);
    try {
      await saveUserProfile(user.uid, {
        displayName: displayName.trim(),
        email: user.email || '',
        role: role.trim(),
      });
      onNotify('Profil berhasil diperbarui!');
      setEditing(false);
    } catch (err) {
      console.error('Failed to update profile:', err);
      onNotify('Gagal memperbarui profil.');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      onNotify('Anda telah keluar dari akun. Data lokal tetap tersimpan di browser ini.');
      onClose();
    } catch (err) {
      console.error('Logout error:', err);
      onNotify('Gagal keluar.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div 
        className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-800 to-teal-700 text-white p-5 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-emerald-100 hover:text-white bg-white/10 hover:bg-white/20 p-1.5 rounded-full transition-all"
          >
            <X className="w-4 h-4" />
          </button>
          
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/20 border border-white/30 flex items-center justify-center text-xl font-black text-white shadow-md">
              {(profile?.displayName || user.displayName || user.email || 'U')[0].toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-base font-bold truncate">
                {profile?.displayName || user.displayName || 'Pengguna Terdaftar'}
              </h2>
              <p className="text-xs text-emerald-100 truncate">{user.email}</p>
              <div className="inline-flex items-center gap-1 bg-emerald-950/40 text-emerald-200 text-[10px] font-semibold px-2 py-0.5 rounded-full mt-1 border border-emerald-500/30">
                <ShieldCheck className="w-3 h-3 text-emerald-300" />
                <span>{profile?.role || 'Staff Program Yayasan'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="p-5 space-y-5 overflow-y-auto">
          {/* Cloud Sync Status Card */}
          <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-2xl space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-emerald-900 font-bold text-xs">
                <Cloud className="w-4 h-4 text-emerald-700" />
                <span>Penyimpanan Cloud Aktif</span>
              </div>
              <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-white px-2 py-0.5 rounded-full border border-emerald-200 shadow-2xs">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                Otomatis
              </span>
            </div>
            
            <p className="text-xs text-slate-600 leading-relaxed">
              Setiap penambahan atau perubahan rencana program, progres realisasi, titik lokasi distribusi, dan dokumen resmi otomatis tersinkronisasi ke server Cloud Anda.
            </p>

            <div className="pt-2 border-t border-emerald-200/60 flex items-center justify-between text-[11px] text-slate-500">
              <span>Sinkronisasi Terakhir:</span>
              <span className="font-semibold text-slate-700">
                {lastSavedTime || 'Tersimpan otomatis'}
              </span>
            </div>
          </div>

          {/* Quick Actions for Cloud Data */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Aksi Data Cloud</h3>
            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={async () => {
                  await onManualSave();
                  onNotify('Data berhasil dicadangkan dan diperbarui di Cloud!');
                }}
                disabled={isSaving}
                className="p-3 bg-white hover:bg-slate-50 border border-slate-200 hover:border-emerald-300 rounded-xl text-left transition-all flex flex-col gap-1 shadow-2xs group"
              >
                <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-700">
                  {isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <UploadCloud className="w-3.5 h-3.5" />}
                  <span>Simpan Sekarang</span>
                </div>
                <span className="text-[10px] text-slate-500">Paksa update data saat ini ke cloud</span>
              </button>

              <button
                type="button"
                onClick={async () => {
                  if (confirm('Apakah Anda ingin memuat ulang data terakhir dari Cloud? Data yang belum tersimpan lokal akan digantikan oleh versi cloud.')) {
                    await onManualLoad();
                    onNotify('Data berhasil disinkronkan dari Cloud!');
                  }
                }}
                className="p-3 bg-white hover:bg-slate-50 border border-slate-200 hover:border-teal-300 rounded-xl text-left transition-all flex flex-col gap-1 shadow-2xs group"
              >
                <div className="flex items-center gap-1.5 text-xs font-bold text-teal-700">
                  <DownloadCloud className="w-3.5 h-3.5" />
                  <span>Ambil dari Cloud</span>
                </div>
                <span className="text-[10px] text-slate-500">Muat data cloud ke perangkat ini</span>
              </button>
            </div>
          </div>

          {/* Edit Profile Section */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Informasi Akun</h3>
              <button
                type="button"
                onClick={() => setEditing(!editing)}
                className="text-xs text-emerald-700 font-bold hover:underline"
              >
                {editing ? 'Batal' : 'Ubah Data'}
              </button>
            </div>

            {editing ? (
              <form onSubmit={handleUpdateProfile} className="space-y-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Nama Lengkap</label>
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg bg-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Jabatan / Divisi</label>
                  <input
                    type="text"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg bg-white"
                  />
                </div>
                <button
                  type="submit"
                  disabled={isUpdating}
                  className="w-full py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-lg text-xs transition-all flex items-center justify-center gap-1.5"
                >
                  {isUpdating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                  <span>Simpan Perubahan</span>
                </button>
              </form>
            ) : (
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">Nama:</span>
                  <span className="font-semibold text-slate-800">{profile?.displayName || user.displayName || '-'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Email:</span>
                  <span className="font-semibold text-slate-800">{user.email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Peran:</span>
                  <span className="font-semibold text-slate-800">{profile?.role || 'Staff Program'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">ID Pengguna:</span>
                  <span className="font-mono text-[10px] text-slate-600 truncate max-w-[180px]">{user.uid}</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer with Logout */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <button
            type="button"
            onClick={handleLogout}
            className="px-3 py-1.5 text-xs font-bold text-red-600 hover:bg-red-50 border border-red-200 rounded-xl transition-all flex items-center gap-1.5 shadow-2xs"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Keluar (Log Out)</span>
          </button>
          
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-bold text-slate-700 bg-white hover:bg-slate-100 border border-slate-300 rounded-xl transition-all shadow-2xs"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
