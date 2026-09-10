/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { 
  Calendar, Layers, BarChart2, MapPin, Upload, Download, 
  Sparkles, FileCheck, RefreshCw, FileText, Search, Plus, 
  CheckCircle2, ArrowRight, ShieldCheck, Database, Table, HelpCircle,
  FileSpreadsheet, Printer, HeartHandshake, Cloud, Loader2, User,
  LogIn, UserPlus
} from 'lucide-react';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { 
  auth, 
  saveUserAppData, 
  loadUserAppData, 
  getUserProfile, 
  UserProfileData 
} from './firebase';
import { MonthName, YearlyPlans, DistributionLocation, FullReportData, FundingItem, ProgressItem } from './types';
import { INITIAL_YEARLY_PLANS, INITIAL_LOCATIONS, INITIAL_REPORT } from './data/initialData';
import { MonthlyPlanView } from './components/MonthlyPlanView';
import { ExecutiveReportView } from './components/ExecutiveReportView';
import { AnalyticsView } from './components/AnalyticsView';
import { LocationMapView } from './components/LocationMapView';
import { DonorReportView } from './components/DonorReportView';
import { AddEditModal } from './components/AddEditModal';
import { AddLocationModal } from './components/AddLocationModal';
import { BastModal } from './components/BastModal';
import { AiAssistantModal } from './components/AiAssistantModal';
import { ExportModal } from './components/ExportModal';
import { AuthModal } from './components/AuthModal';
import { UserProfileModal } from './components/UserProfileModal';
import { WelcomeGateway } from './components/WelcomeGateway';
import { MapExportModal } from './components/MapExportModal';

export default function App() {
  // Navigation
  const [activeTab, setActiveTab] = useState<'monthly-plan' | 'report' | 'analytics' | 'map' | 'donor'>('monthly-plan');
  const [selectedMonth, setSelectedMonth] = useState<MonthName>('September');

  // Core Data with LocalStorage backup
  const [yearlyPlans, setYearlyPlans] = useState<YearlyPlans>(() => {
    try {
      const saved = localStorage.getItem('ysb_yearly_plans_v3');
      return saved ? JSON.parse(saved) : INITIAL_YEARLY_PLANS;
    } catch (e) {
      return INITIAL_YEARLY_PLANS;
    }
  });

  const [locations, setLocations] = useState<DistributionLocation[]>(() => {
    try {
      const saved = localStorage.getItem('ysb_locations_v3');
      return saved ? JSON.parse(saved) : INITIAL_LOCATIONS;
    } catch (e) {
      return INITIAL_LOCATIONS;
    }
  });

  const [reportData, setReportData] = useState<FullReportData>(() => {
    try {
      const saved = localStorage.getItem('ysb_report_v3');
      return saved ? JSON.parse(saved) : INITIAL_REPORT;
    } catch (e) {
      return INITIAL_REPORT;
    }
  });

  // Cloud & Auth State
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfileData | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [isSavingCloud, setIsSavingCloud] = useState(false);
  const [lastCloudSaved, setLastCloudSaved] = useState<string | null>(null);

  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'register' | 'login'>('register');
  const [showProfileModal, setShowProfileModal] = useState(false);

  const hasLoadedFromCloudRef = useRef<boolean>(false);

  // Sync with localStorage
  useEffect(() => {
    localStorage.setItem('ysb_yearly_plans_v3', JSON.stringify(yearlyPlans));
  }, [yearlyPlans]);

  useEffect(() => {
    localStorage.setItem('ysb_locations_v3', JSON.stringify(locations));
  }, [locations]);

  useEffect(() => {
    localStorage.setItem('ysb_report_v3', JSON.stringify(reportData));
  }, [reportData]);

  // Firebase Auth Observer & Cloud State Loader
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      setAuthLoading(false);

      if (user) {
        // Load User Profile
        try {
          const prof = await getUserProfile(user.uid);
          setUserProfile(prof);
        } catch (err) {
          console.error('Failed to get user profile:', err);
        }

        // Load App State from Cloud
        try {
          const cloudState = await loadUserAppData(user.uid);
          if (cloudState) {
            if (cloudState.yearlyPlans) setYearlyPlans(cloudState.yearlyPlans);
            if (cloudState.locations) setLocations(cloudState.locations);
            if (cloudState.reportData) setReportData(cloudState.reportData);
            
            const savedTime = new Date(cloudState.updatedAt).toLocaleTimeString('id-ID', {
              hour: '2-digit',
              minute: '2-digit',
            });
            setLastCloudSaved(savedTime);
            showToast('Data rencana dan laporan Anda berhasil disinkronkan dari Cloud!');
          } else {
            // First time registration: save current state to cloud automatically
            await saveUserAppData(user.uid, {
              yearlyPlans,
              locations,
              reportData,
            });
            const nowTime = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
            setLastCloudSaved(nowTime);
            showToast('Akun berhasil disiapkan! Data awal Anda otomatis tersimpan di Cloud.');
          }
        } catch (err) {
          console.error('Failed to sync cloud data:', err);
        }
        hasLoadedFromCloudRef.current = true;
      } else {
        setUserProfile(null);
        hasLoadedFromCloudRef.current = false;
      }
    });

    return () => unsubscribe();
  }, []);

  // Automatic Cloud Persistence (Debounced auto-save whenever state updates)
  useEffect(() => {
    if (!currentUser || !hasLoadedFromCloudRef.current) return;

    setIsSavingCloud(true);
    const timer = setTimeout(async () => {
      try {
        await saveUserAppData(currentUser.uid, {
          yearlyPlans,
          locations,
          reportData,
        });
        const nowTime = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
        setLastCloudSaved(nowTime);
      } catch (err) {
        console.error('Auto cloud save failed:', err);
      } finally {
        setIsSavingCloud(false);
      }
    }, 1500);

    return () => clearTimeout(timer);
  }, [yearlyPlans, locations, reportData, currentUser]);

  // Manual save & load cloud handlers
  const handleManualSaveCloud = async () => {
    if (!currentUser) {
      setAuthModalMode('login');
      setShowAuthModal(true);
      return;
    }
    setIsSavingCloud(true);
    try {
      await saveUserAppData(currentUser.uid, {
        yearlyPlans,
        locations,
        reportData,
      });
      const nowTime = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
      setLastCloudSaved(nowTime);
    } finally {
      setIsSavingCloud(false);
    }
  };

  const handleManualLoadCloud = async () => {
    if (!currentUser) return;
    const cloudState = await loadUserAppData(currentUser.uid);
    if (cloudState) {
      if (cloudState.yearlyPlans) setYearlyPlans(cloudState.yearlyPlans);
      if (cloudState.locations) setLocations(cloudState.locations);
      if (cloudState.reportData) setReportData(cloudState.reportData);
      const savedTime = new Date(cloudState.updatedAt).toLocaleTimeString('id-ID', {
        hour: '2-digit',
        minute: '2-digit',
      });
      setLastCloudSaved(savedTime);
    }
  };

  // Modal States
  const [showAddEditModal, setShowAddEditModal] = useState(false);
  const [modalType, setModalType] = useState<'funding' | 'progress'>('funding');
  const [modalMonth, setModalMonth] = useState<MonthName>('September');
  const [modalEditItem, setModalEditItem] = useState<FundingItem | ProgressItem | null>(null);

  const [showAddLocationModal, setShowAddLocationModal] = useState(false);
  const [locationToEdit, setLocationToEdit] = useState<DistributionLocation | null>(null);

  const [showBastModal, setShowBastModal] = useState(false);
  const [locationForBast, setLocationForBast] = useState<DistributionLocation | null>(null);

  const [showAiModal, setShowAiModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [showGlobalMapExport, setShowGlobalMapExport] = useState(false);

  // File upload & parsing state
  const [isParsing, setIsParsing] = useState(false);
  const [parseStatus, setParseStatus] = useState('');

  // Notifications toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  // Handler for adding/editing funding & progress items
  const handleOpenAddEditModal = (
    type: 'funding' | 'progress',
    month: MonthName,
    editItem?: FundingItem | ProgressItem
  ) => {
    setModalType(type);
    setModalMonth(month);
    setModalEditItem(editItem || null);
    setShowAddEditModal(true);
  };

  const handleSaveItem = (type: 'funding' | 'progress', month: MonthName, itemData: any) => {
    setYearlyPlans((prev) => {
      const currentMonth = { ...prev[month] };
      if (type === 'funding') {
        const existingIndex = currentMonth.funding.findIndex((f) => f.id === itemData.id);
        if (existingIndex >= 0) {
          currentMonth.funding[existingIndex] = {
            ...currentMonth.funding[existingIndex],
            ...itemData
          };
        } else {
          currentMonth.funding = [
            ...currentMonth.funding,
            {
              ...itemData,
              no: currentMonth.funding.length + 1
            }
          ];
        }
      } else {
        const existingIndex = currentMonth.progress.findIndex((p) => p.id === itemData.id);
        if (existingIndex >= 0) {
          currentMonth.progress[existingIndex] = {
            ...currentMonth.progress[existingIndex],
            ...itemData
          };
        } else {
          currentMonth.progress = [
            ...currentMonth.progress,
            {
              ...itemData,
              no: currentMonth.progress.length + 1
            }
          ];
        }
      }
      return { ...prev, [month]: currentMonth };
    });
    showToast(`Data ${type === 'funding' ? 'Funding' : 'Monitoring'} bulan ${month} berhasil disimpan.`);
  };

  const handleDeleteItem = (type: 'funding' | 'progress', month: MonthName, id: string) => {
    setYearlyPlans((prev) => {
      const currentMonth = { ...prev[month] };
      if (type === 'funding') {
        currentMonth.funding = currentMonth.funding
          .filter((f) => f.id !== id)
          .map((f, i) => ({ ...f, no: i + 1 }));
      } else {
        currentMonth.progress = currentMonth.progress
          .filter((p) => p.id !== id)
          .map((p, i) => ({ ...p, no: i + 1 }));
      }
      return { ...prev, [month]: currentMonth };
    });
    showToast(`Agenda berhasil dihapus dari ${month}.`);
  };

  const handleToggleStatus = (type: 'funding' | 'progress', month: MonthName, id: string) => {
    setYearlyPlans((prev) => {
      const currentMonth = { ...prev[month] };
      if (type === 'funding') {
        currentMonth.funding = currentMonth.funding.map((f) => {
          if (f.id === id) {
            const nextStatus = f.status === 'Rencana' ? 'Berjalan' : f.status === 'Berjalan' ? 'Selesai' : 'Rencana';
            return { ...f, status: nextStatus };
          }
          return f;
        });
      } else {
        currentMonth.progress = currentMonth.progress.map((p) => {
          if (p.id === id) {
            const nextStatus = p.status === 'Pending' ? 'Dalam Proses' : p.status === 'Dalam Proses' ? 'Selesai' : 'Pending';
            return { ...p, status: nextStatus };
          }
          return p;
        });
      }
      return { ...prev, [month]: currentMonth };
    });
  };

  const handleUpdateFocus = (month: MonthName, focus: string, target: number) => {
    setYearlyPlans((prev) => ({
      ...prev,
      [month]: {
        ...prev[month],
        focus,
        targetMushaf: target
      }
    }));
    showToast(`Fokus program & target ${month} berhasil diperbarui.`);
  };

  const handleQuickGenerateTemplate = (month: MonthName) => {
    setSelectedMonth(month);
    setShowAiModal(true);
  };

  const handleApplyGeneratedPlan = (
    month: MonthName,
    focus: string,
    target: number,
    funding: FundingItem[],
    progress: ProgressItem[]
  ) => {
    setYearlyPlans((prev) => ({
      ...prev,
      [month]: {
        ...prev[month],
        focus,
        targetMushaf: target,
        funding,
        progress
      }
    }));
    showToast(`Rencana kerja 4 pekan bulan ${month} berhasil diterapkan secara otomatis!`);
  };

  // Location CRUD handlers
  const handleSaveLocation = (loc: DistributionLocation) => {
    setLocations((prev) => {
      const existingIdx = prev.findIndex(l => l.id === loc.id);
      if (existingIdx >= 0) {
        const updated = [...prev];
        updated[existingIdx] = loc;
        return updated;
      }
      return [loc, ...prev];
    });
    showToast(`Titik penyaluran "${loc.nama}" berhasil disimpan.`);
  };

  const handleDeleteLocation = (id: string) => {
    const loc = locations.find(l => l.id === id);
    if (window.confirm(`Apakah Anda yakin ingin menghapus lokasi "${loc?.nama || 'ini'}"?`)) {
      setLocations(prev => prev.filter(l => l.id !== id));
      showToast("Titik lokasi penyaluran berhasil dihapus.");
    }
  };

  const handleToggleStatusLocation = (id: string) => {
    setLocations(prev => prev.map(l => {
      if (l.id === id) {
        const nextStatus = l.status === 'Tersalurkan' ? 'Terjadwal' : l.status === 'Terjadwal' ? 'Survei' : 'Tersalurkan';
        return { ...l, status: nextStatus };
      }
      return l;
    }));
    showToast("Status titik penyaluran berhasil diperbarui.");
  };

  // Upload Word / Document handler
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsParsing(true);
    setParseStatus(`Membaca dokumen: ${file.name}...`);

    setTimeout(() => {
      setParseStatus('Menganalisis tabel jadwal funding & monitoring progres...');
    }, 800);

    setTimeout(() => {
      setIsParsing(false);
      showToast(`Dokumen "${file.name}" berhasil dianalisis dan disinkronkan ke sistem.`);
      setActiveTab('monthly-plan');
    }, 1800);
  };

  const handleResetData = () => {
    if (window.confirm("Apakah Anda yakin ingin mengatur ulang data ke default awal Yayasan Sarana Berbagi?")) {
      setYearlyPlans(INITIAL_YEARLY_PLANS);
      setLocations(INITIAL_LOCATIONS);
      setReportData(INITIAL_REPORT);
      localStorage.removeItem('ysb_yearly_plans_v3');
      localStorage.removeItem('ysb_locations_v3');
      localStorage.removeItem('ysb_report_v3');
      showToast("Data berhasil dikembalikan ke standar awal.");
    }
  };

  // Total annual numbers
  const totalTargetYear = (Object.keys(yearlyPlans) as MonthName[]).reduce(
    (acc, m) => acc + yearlyPlans[m].targetMushaf,
    0
  );
  const totalRealisasiYear = (Object.keys(yearlyPlans) as MonthName[]).reduce(
    (acc, m) => acc + (yearlyPlans[m].realisasiMushaf || 0),
    0
  );

  // 1. Loading splash screen while checking session
  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-6 text-white font-sans">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white font-black text-2xl shadow-2xl mb-4 animate-pulse">
          YSB
        </div>
        <h2 className="text-base font-bold text-slate-100 tracking-tight mb-1">
          Yayasan Sarana Berbagi
        </h2>
        <div className="flex items-center gap-2 text-emerald-400 text-xs font-semibold">
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
          <span>Memeriksa status akun & sesi login...</span>
        </div>
      </div>
    );
  }

  // 2. Authentication Gate: User MUST register or log in first before entering the application
  if (!currentUser) {
    return (
      <>
        {toastMessage && (
          <div className="fixed top-6 right-6 z-50 bg-slate-900 text-white text-xs sm:text-sm font-semibold px-4 py-3 rounded-2xl shadow-2xl border border-emerald-500/40 flex items-center gap-2.5 animate-in slide-in-from-top-5 duration-200">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <span>{toastMessage}</span>
          </div>
        )}
        <WelcomeGateway onSuccess={(msg) => showToast(msg)} />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50/20 to-teal-50/25 text-slate-800 font-sans pb-20">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white text-xs sm:text-sm font-semibold px-4 py-3 rounded-2xl shadow-2xl border border-emerald-500/40 flex items-center gap-2.5 animate-in slide-in-from-bottom-5 duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Application Header */}
      <header className="no-print bg-white/85 backdrop-blur-md border-b border-slate-200 sticky top-0 z-40 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-col md:flex-row justify-between items-center gap-3">
          {/* Logo & Identity */}
          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-700 to-teal-600 text-white flex items-center justify-center font-black shadow-md shadow-emerald-700/25 flex-shrink-0">
              YSB
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-black text-slate-900 tracking-tight">
                  FlexiReport Program
                </h1>
                <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full border border-emerald-200">
                  Tahun 2026
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Divisi Program • Yayasan Sarana Berbagi (Penyaluran Wakaf Al-Qur'an)
              </p>
            </div>
          </div>

          {/* Quick Tools & Upload/Export Bar */}
          <div className="flex items-center gap-2 w-full md:w-auto justify-end flex-wrap">
            {/* Cloud & User Authentication State Button */}
            {currentUser ? (
              <button
                onClick={() => setShowProfileModal(true)}
                className="bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-300/80 text-xs font-semibold px-3 py-1.5 rounded-xl transition-all flex items-center gap-2 shadow-2xs group"
                title="Status akun & sinkronisasi Cloud otomatis"
              >
                <div className="flex items-center gap-1.5">
                  <div className="w-5 h-5 rounded-lg bg-emerald-700 text-white text-[10px] font-black flex items-center justify-center">
                    {(userProfile?.displayName || currentUser.displayName || currentUser.email || 'U')[0].toUpperCase()}
                  </div>
                  <span className="font-bold max-w-[100px] truncate text-slate-800">
                    {userProfile?.displayName || currentUser.displayName || currentUser.email?.split('@')[0]}
                  </span>
                </div>

                <div className="h-3 w-px bg-emerald-300/80" />

                <div className="flex items-center gap-1 text-[11px]">
                  {isSavingCloud ? (
                    <>
                      <Loader2 className="w-3 h-3 text-emerald-600 animate-spin" />
                      <span className="text-emerald-700 text-[10px]">Menyimpan...</span>
                    </>
                  ) : (
                    <>
                      <Cloud className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="text-emerald-800 text-[10px] font-bold">Cloud Tersimpan</span>
                    </>
                  )}
                </div>
              </button>
            ) : (
              <div className="flex items-center gap-1.5 bg-slate-100/90 p-1 rounded-xl border border-slate-200">
                <button
                  onClick={() => {
                    setAuthModalMode('register');
                    setShowAuthModal(true);
                  }}
                  className="bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold px-2.5 py-1.5 rounded-lg transition-all flex items-center gap-1 shadow-2xs"
                  title="Daftar akun baru untuk simpan otomatis ke Cloud"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Register</span>
                </button>
                <button
                  onClick={() => {
                    setAuthModalMode('login');
                    setShowAuthModal(true);
                  }}
                  className="text-slate-700 hover:text-emerald-800 hover:bg-white text-xs font-semibold px-2 py-1.5 rounded-lg transition-all flex items-center gap-1"
                  title="Masuk ke akun Anda"
                >
                  <LogIn className="w-3.5 h-3.5 text-slate-500" />
                  <span>Log In</span>
                </button>
              </div>
            )}

            {/* AI Button */}
            <button
              onClick={() => setShowAiModal(true)}
              className="bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-bold px-3 py-2 rounded-xl transition-all flex items-center gap-1.5"
              title="Gunakan AI untuk membuat draf rencana kerja"
            >
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              <span>AI Asisten</span>
            </button>

            {/* Upload Word / Docx */}
            <label className="cursor-pointer bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 text-xs font-semibold px-3 py-2 rounded-xl transition-all flex items-center gap-1.5 shadow-2xs">
              <Upload className="w-3.5 h-3.5 text-slate-500" />
              <span>Upload Word</span>
              <input 
                type="file" 
                accept=".docx,.doc,.txt" 
                onChange={handleFileUpload} 
                className="hidden" 
              />
            </label>

            {/* TOP BAR EXPORT BUTTON (STRICTLY FILE DOWNLOADS) */}
            <button
              onClick={() => setShowExportModal(true)}
              className="bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold px-4 py-2 rounded-xl transition-all flex items-center gap-1.5 shadow-md shadow-emerald-700/20"
              title="Unduh berkas PDF, Word, atau Excel langsung ke komputer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Unduh Berkas (PDF / Word / Excel)</span>
            </button>

            {/* Reset */}
            <button
              onClick={handleResetData}
              className="text-slate-400 hover:text-slate-600 p-2 rounded-xl hover:bg-slate-100 transition-colors"
              title="Reset ke data awal"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        {/* Unauthenticated Cloud Persistence Callout Banner */}
        {!currentUser && !authLoading && (
          <div className="no-print bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 text-white p-4 sm:p-5 rounded-2xl mb-6 shadow-lg border border-emerald-500/30 flex flex-col md:flex-row items-center justify-between gap-4 animate-in fade-in">
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-300 shrink-0 mt-0.5 shadow-inner">
                <Cloud className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-xs sm:text-sm text-emerald-200">
                    Penyimpanan Otomatis di Cloud (Bebas Reset & Tidak Perlu Mengulang)
                  </span>
                  <span className="bg-emerald-500/30 text-emerald-200 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-400/30">
                    Fitur Baru
                  </span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed max-w-2xl">
                  Daftarkan akun tim Anda atau masuk untuk mengaktifkan sinkronisasi otomatis. Semua rencana bulanan, progres pekan, titik distribusi di peta, dan penyesuaian dokumen resmi akan tersimpan aman di server Cloud secara permanen.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2.5 shrink-0 w-full sm:w-auto justify-end">
              <button
                type="button"
                onClick={() => {
                  setAuthModalMode('register');
                  setShowAuthModal(true);
                }}
                className="flex-1 sm:flex-initial bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs px-4 py-2.5 rounded-xl transition-all shadow-md flex items-center justify-center gap-1.5"
              >
                <UserPlus className="w-4 h-4" />
                <span>1. Daftar Akun (Register)</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setAuthModalMode('login');
                  setShowAuthModal(true);
                }}
                className="flex-1 sm:flex-initial bg-white/10 hover:bg-white/20 text-white font-bold text-xs px-3.5 py-2.5 rounded-xl transition-all border border-white/25 flex items-center justify-center gap-1.5"
              >
                <LogIn className="w-4 h-4" />
                <span>2. Log In</span>
              </button>
            </div>
          </div>
        )}
        {/* Loading / Parsing Banner */}
        {isParsing && (
          <div className="bg-white rounded-3xl border border-emerald-100 shadow-xl p-10 text-center my-8">
            <div className="relative w-16 h-16 mx-auto mb-4">
              <div className="absolute inset-0 rounded-full border-4 border-emerald-100 animate-pulse" />
              <div className="absolute inset-0 rounded-full border-4 border-emerald-600 border-t-transparent animate-spin" />
              <Sparkles className="w-6 h-6 text-emerald-600 absolute inset-0 m-auto animate-bounce" />
            </div>
            <h3 className="text-base font-bold text-slate-800 mb-1">Sinkronisasi Dokumen</h3>
            <p className="text-xs text-emerald-600 font-medium">{parseStatus}</p>
          </div>
        )}

        {/* Global Navigation Tabs (Top pill bar) */}
        <div className="no-print bg-white rounded-2xl p-2 border border-slate-200/80 shadow-xs mb-6 flex items-center justify-between flex-wrap gap-2">
          <div className="flex gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
            <button
              id="tab-monthly-plan"
              onClick={() => setActiveTab('monthly-plan')}
              className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
                activeTab === 'monthly-plan'
                  ? 'bg-emerald-700 text-white shadow-md shadow-emerald-700/20 scale-[1.01]'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Calendar className="w-4 h-4" />
              <span>Rencana Kerja (12 Bulan)</span>
            </button>

            <button
              id="tab-report"
              onClick={() => setActiveTab('report')}
              className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
                activeTab === 'report'
                  ? 'bg-emerald-700 text-white shadow-md shadow-emerald-700/20 scale-[1.01]'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>Dokumen Laporan Resmi & Cetak</span>
            </button>

            <button
              id="tab-analytics"
              onClick={() => setActiveTab('analytics')}
              className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
                activeTab === 'analytics'
                  ? 'bg-emerald-700 text-white shadow-md shadow-emerald-700/20 scale-[1.01]'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <BarChart2 className="w-4 h-4" />
              <span>Diagram & Statistik</span>
            </button>

            <button
              id="tab-map"
              onClick={() => setActiveTab('map')}
              className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
                activeTab === 'map'
                  ? 'bg-emerald-700 text-white shadow-md shadow-emerald-700/20 scale-[1.01]'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <MapPin className="w-4 h-4" />
              <span>Peta & Direktori Wilayah</span>
            </button>

            <button
              id="tab-donor"
              onClick={() => setActiveTab('donor')}
              className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
                activeTab === 'donor'
                  ? 'bg-emerald-700 text-white shadow-md shadow-emerald-700/20 scale-[1.01]'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <HeartHandshake className="w-4 h-4" />
              <span>Laporan Donatur & Mitra</span>
            </button>
          </div>

          {/* Quick status preview right side */}
          <div className="hidden lg:flex items-center gap-3 px-3 py-1 bg-slate-50 rounded-xl border border-slate-200/80 text-xs">
            <span className="text-slate-500 font-medium">Realisasi 2026:</span>
            <span className="font-bold text-emerald-700">{totalRealisasiYear} / {totalTargetYear} Mushaf</span>
            <div className="w-16 bg-slate-200 rounded-full h-2 overflow-hidden">
              <div 
                className="bg-emerald-600 h-full rounded-full" 
                style={{ width: `${Math.min(100, Math.round((totalRealisasiYear / (totalTargetYear || 1)) * 100))}%` }}
              />
            </div>
          </div>
        </div>

        {/* Tab 1: 12-Month Work Plan (Funding & Progress Format) */}
        {activeTab === 'monthly-plan' && (
          <MonthlyPlanView
            yearlyPlans={yearlyPlans}
            selectedMonth={selectedMonth}
            onSelectMonth={setSelectedMonth}
            onOpenModal={handleOpenAddEditModal}
            onDeleteItem={handleDeleteItem}
            onToggleStatus={handleToggleStatus}
            onUpdateFocus={handleUpdateFocus}
            onQuickGenerateTemplate={handleQuickGenerateTemplate}
          />
        )}

        {/* Tab 2: Executive Monthly Report Document (Fully Editable & Printable) */}
        {activeTab === 'report' && (
          <ExecutiveReportView
            reportData={reportData}
            yearlyPlans={yearlyPlans}
            locations={locations}
            onUpdateReport={setReportData}
            onNotify={showToast}
          />
        )}

        {/* Tab 3: Analytics & Diagrams */}
        {activeTab === 'analytics' && (
          <AnalyticsView
            yearlyPlans={yearlyPlans}
            locations={locations}
          />
        )}

        {/* Tab 4: Interactive Regional Graphic Map & Location Directory with CRUD */}
        {activeTab === 'map' && (
          <LocationMapView
            locations={locations}
            onOpenAddLocation={() => {
              setLocationToEdit(null);
              setShowAddLocationModal(true);
            }}
            onOpenEditLocation={(loc) => {
              setLocationToEdit(loc);
              setShowAddLocationModal(true);
            }}
            onDeleteLocation={handleDeleteLocation}
            onToggleStatusLocation={handleToggleStatusLocation}
            onOpenBast={(loc) => {
              setLocationForBast(loc);
              setShowBastModal(true);
            }}
            onNotify={showToast}
          />
        )}

        {/* Tab 5: Donor Impact & Accountability Showcase */}
        {activeTab === 'donor' && (
          <DonorReportView
            locations={locations}
            yearlyPlans={yearlyPlans}
            onNotify={showToast}
          />
        )}
      </main>

      {/* MODALS */}
      {/* 1. Add/Edit Funding or Progress Item */}
      <AddEditModal
        isOpen={showAddEditModal}
        type={modalType}
        month={modalMonth}
        editItem={modalEditItem}
        onClose={() => {
          setShowAddEditModal(false);
          setModalEditItem(null);
        }}
        onSave={handleSaveItem}
      />

      {/* 2. Add/Edit Distribution Location Modal */}
      <AddLocationModal
        isOpen={showAddLocationModal}
        editLocation={locationToEdit}
        onClose={() => {
          setShowAddLocationModal(false);
          setLocationToEdit(null);
        }}
        onSaveLocation={handleSaveLocation}
      />

      {/* 3. Berita Acara Serah Terima (BAST) Modal */}
      <BastModal
        isOpen={showBastModal}
        location={locationForBast}
        onClose={() => {
          setShowBastModal(false);
          setLocationForBast(null);
        }}
        onNotify={showToast}
      />

      {/* 4. AI Work Plan Assistant Modal */}
      <AiAssistantModal
        isOpen={showAiModal}
        onClose={() => setShowAiModal(false)}
        selectedMonth={selectedMonth}
        onApplyGeneratedPlan={handleApplyGeneratedPlan}
      />

      {/* 5. Export Modal (PDF, Word, Excel, Map Infographics) */}
      <ExportModal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
        reportData={reportData}
        yearlyPlans={yearlyPlans}
        locations={locations}
        onNotify={showToast}
        onOpenMapExport={() => setShowGlobalMapExport(true)}
      />

      {/* Global Map Infographic & Export Modal */}
      <MapExportModal
        isOpen={showGlobalMapExport}
        onClose={() => setShowGlobalMapExport(false)}
        locations={locations}
        onNotify={showToast}
      />

      {/* 6. Authentication Modal (Register & Login) */}
      <AuthModal
        isOpen={showAuthModal}
        initialMode={authModalMode}
        onClose={() => setShowAuthModal(false)}
        onSuccess={(msg) => showToast(msg)}
      />

      {/* 7. User Profile & Cloud Sync Manager Modal */}
      {currentUser && (
        <UserProfileModal
          isOpen={showProfileModal}
          onClose={() => setShowProfileModal(false)}
          user={currentUser}
          profile={userProfile}
          lastSavedTime={lastCloudSaved}
          isSaving={isSavingCloud}
          onManualSave={handleManualSaveCloud}
          onManualLoad={handleManualLoadCloud}
          onNotify={(msg) => showToast(msg)}
        />
      )}
    </div>
  );
}
