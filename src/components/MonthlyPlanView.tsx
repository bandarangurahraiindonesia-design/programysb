import React, { useState } from 'react';
import { 
  Calendar, Plus, CheckCircle2, Clock, AlertCircle, Edit2, Trash2, 
  Sparkles, Check, Filter, Layers, BookOpen, User, Flag, ArrowRight
} from 'lucide-react';
import { MonthName, MonthlyPlan, FundingItem, ProgressItem, YearlyPlans } from '../types';

interface MonthlyPlanViewProps {
  yearlyPlans: YearlyPlans;
  selectedMonth: MonthName;
  onSelectMonth: (m: MonthName) => void;
  onOpenModal: (type: 'funding' | 'progress', month: MonthName, editItem?: FundingItem | ProgressItem) => void;
  onDeleteItem: (type: 'funding' | 'progress', month: MonthName, id: string) => void;
  onToggleStatus: (type: 'funding' | 'progress', month: MonthName, id: string) => void;
  onUpdateFocus: (month: MonthName, focus: string, target: number) => void;
  onQuickGenerateTemplate: (month: MonthName) => void;
}

export const MonthlyPlanView: React.FC<MonthlyPlanViewProps> = ({
  yearlyPlans,
  selectedMonth,
  onSelectMonth,
  onOpenModal,
  onDeleteItem,
  onToggleStatus,
  onUpdateFocus,
  onQuickGenerateTemplate
}) => {
  const currentPlan = yearlyPlans[selectedMonth];
  const [pekanFilter, setPekanFilter] = useState<string>('ALL');
  const [isEditingFocus, setIsEditingFocus] = useState(false);
  const [focusDraft, setFocusDraft] = useState(currentPlan.focus);
  const [targetDraft, setTargetDraft] = useState(currentPlan.targetMushaf);

  const monthsList: MonthName[] = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];

  const handleSaveFocus = () => {
    onUpdateFocus(selectedMonth, focusDraft, Number(targetDraft) || 0);
    setIsEditingFocus(false);
  };

  // Filter items if user picks a specific week
  const filteredFunding = currentPlan.funding.filter(item => 
    pekanFilter === 'ALL' || item.pekan.toUpperCase().includes(pekanFilter)
  );

  const filteredProgress = currentPlan.progress.filter(item => 
    pekanFilter === 'ALL' || item.pekan.toUpperCase().includes(pekanFilter)
  );

  const completionPercentage = currentPlan.targetMushaf > 0 
    ? Math.min(100, Math.round(((currentPlan.realisasiMushaf || 0) / currentPlan.targetMushaf) * 100))
    : 0;

  return (
    <div className="space-y-6">
      {/* 12 Months Selector Card */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm p-5 sm:p-7">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-5">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 bg-emerald-100 text-emerald-800 rounded-lg">
                <Calendar className="w-4 h-4" />
              </span>
              <h3 className="text-lg font-bold text-slate-800 tracking-tight">
                Pilih Bulan Perencanaan (Januari – Desember 2026)
              </h3>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Navigasi langsung ke rencana kerja, target mushaf, serta tabel funding & monitoring di bulan bersangkutan.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs bg-slate-100 text-slate-700 px-3 py-1.5 rounded-full font-semibold border border-slate-200">
              12 Bulan Terjadwal
            </span>
          </div>
        </div>

        {/* 12 Months Grid */}
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2.5">
          {monthsList.map((month) => {
            const plan = yearlyPlans[month];
            const isSelected = selectedMonth === month;
            const isDone = plan.status === 'Selesai';
            const isActive = plan.status.includes('Berjalan');

            return (
              <button
                key={month}
                id={`btn-month-${month.toLowerCase()}`}
                onClick={() => {
                  onSelectMonth(month);
                  setFocusDraft(yearlyPlans[month].focus);
                  setTargetDraft(yearlyPlans[month].targetMushaf);
                  setIsEditingFocus(false);
                }}
                className={`relative p-3 rounded-2xl text-left transition-all border flex flex-col justify-between h-20 ${
                  isSelected
                    ? 'bg-emerald-700 text-white border-emerald-700 shadow-lg shadow-emerald-700/25 ring-2 ring-emerald-500/40 scale-[1.02]'
                    : 'bg-slate-50/70 hover:bg-slate-100/90 text-slate-700 border-slate-200/90 hover:border-emerald-300'
                }`}
              >
                <div className="flex justify-between items-start w-full">
                  <span className={`text-xs sm:text-sm font-bold ${isSelected ? 'text-white' : 'text-slate-800'}`}>
                    {month}
                  </span>
                  <span className={`w-2 h-2 rounded-full ${
                    isDone ? (isSelected ? 'bg-emerald-300' : 'bg-emerald-500') :
                    isActive ? (isSelected ? 'bg-amber-300 animate-pulse' : 'bg-amber-500 animate-pulse') :
                    (isSelected ? 'bg-slate-300' : 'bg-slate-300')
                  }`} />
                </div>
                <div className="w-full">
                  <div className={`text-[11px] font-medium truncate ${isSelected ? 'text-emerald-100' : 'text-slate-500'}`}>
                    {plan.targetMushaf} Mushaf
                  </div>
                  <div className="mt-1 w-full bg-black/10 rounded-full h-1 overflow-hidden">
                    <div 
                      className={`h-full ${isSelected ? 'bg-emerald-200' : 'bg-emerald-600'}`}
                      style={{ width: `${Math.min(100, Math.round(((plan.realisasiMushaf || 0) / (plan.targetMushaf || 1)) * 100))}%` }}
                    />
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Month Dashboard Card */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-700/60 relative overflow-hidden">
        {/* Subtle decorative glow */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Top Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-700/70 pb-5 relative z-10">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-emerald-400 text-xs font-bold uppercase tracking-wider bg-emerald-950/80 px-2.5 py-1 rounded-md border border-emerald-700/50">
                Divisi Program 2026
              </span>
              <span className={`text-xs font-semibold px-2.5 py-1 rounded-md ${
                currentPlan.status.includes('Berjalan') ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' :
                currentPlan.status === 'Selesai' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' :
                'bg-slate-700/60 text-slate-300 border border-slate-600'
              }`}>
                Status: {currentPlan.status}
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black mt-2 tracking-tight flex items-center gap-3 text-white">
              <span>Rencana Kerja: {selectedMonth} 2026</span>
            </h2>
          </div>

          {/* Quick Action Tools */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              id="btn-auto-template"
              onClick={() => onQuickGenerateTemplate(selectedMonth)}
              className="bg-emerald-800/60 hover:bg-emerald-700 text-emerald-200 hover:text-white text-xs font-semibold px-3 py-2 rounded-xl border border-emerald-600/40 transition-all flex items-center gap-1.5 shadow-sm"
              title="Isi otomatis pekan 1-4 jika kosong atau ingin rekomendasi agenda"
            >
              <Sparkles className="w-3.5 h-3.5 text-emerald-300" />
              <span>Otomasi 4 Pekan</span>
            </button>

            <button
              id="btn-add-funding"
              onClick={() => onOpenModal('funding', selectedMonth)}
              className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 shadow-md shadow-emerald-900/40"
            >
              <Plus className="w-4 h-4" />
              <span>+ Tambah Funding</span>
            </button>

            <button
              id="btn-add-progress"
              onClick={() => onOpenModal('progress', selectedMonth)}
              className="bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 shadow-md shadow-teal-900/40"
            >
              <Plus className="w-4 h-4" />
              <span>+ Tambah Progres</span>
            </button>
          </div>
        </div>

        {/* Focus & Target Highlight */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 my-6 relative z-10">
          <div className="lg:col-span-2 bg-slate-800/70 border border-slate-700/70 p-5 rounded-2xl">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                <Flag className="w-3.5 h-3.5" /> Fokus Utama Program
              </span>
              {!isEditingFocus ? (
                <button 
                  onClick={() => setIsEditingFocus(true)}
                  className="text-xs text-slate-400 hover:text-white flex items-center gap-1 transition-colors"
                >
                  <Edit2 className="w-3 h-3" /> Edit Fokus
                </button>
              ) : (
                <button 
                  onClick={handleSaveFocus}
                  className="text-xs text-emerald-400 hover:text-emerald-300 font-bold flex items-center gap-1"
                >
                  <Check className="w-3 h-3" /> Simpan
                </button>
              )}
            </div>

            {isEditingFocus ? (
              <div className="space-y-3 pt-1">
                <textarea
                  value={focusDraft}
                  onChange={(e) => setFocusDraft(e.target.value)}
                  className="w-full bg-slate-900/90 border border-emerald-500/50 rounded-xl p-3 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-400"
                  rows={2}
                />
                <div className="flex items-center gap-3">
                  <label className="text-xs text-slate-400">Target Mushaf:</label>
                  <input
                    type="number"
                    value={targetDraft}
                    onChange={(e) => setTargetDraft(Number(e.target.value))}
                    className="w-28 bg-slate-900/90 border border-emerald-500/50 rounded-lg px-2.5 py-1 text-sm text-white"
                  />
                  <button
                    onClick={handleSaveFocus}
                    className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-3 py-1.5 rounded-lg"
                  >
                    Simpan Perubahan
                  </button>
                </div>
              </div>
            ) : (
              <p className="text-slate-200 text-sm sm:text-base leading-relaxed font-normal">
                {currentPlan.focus || 'Belum ada fokus yang ditetapkan untuk bulan ini.'}
              </p>
            )}
          </div>

          {/* Metric target */}
          <div className="bg-slate-800/70 border border-slate-700/70 p-5 rounded-2xl flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-center text-xs text-slate-400 uppercase font-bold tracking-wider">
                <span>Target vs Realisasi</span>
                <span className="text-emerald-400">{completionPercentage}% Tercapai</span>
              </div>
              <div className="flex items-baseline gap-2 mt-2">
                <span className="text-3xl font-black text-white">{currentPlan.realisasiMushaf || 0}</span>
                <span className="text-sm font-medium text-slate-400">/ {currentPlan.targetMushaf} Mushaf</span>
              </div>
            </div>
            <div className="mt-4">
              <div className="w-full bg-slate-700 rounded-full h-2.5 overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full rounded-full transition-all duration-500"
                  style={{ width: `${completionPercentage}%` }}
                />
              </div>
              <div className="flex justify-between text-[11px] text-slate-400 mt-2">
                <span>Funding: {currentPlan.funding.length} Agenda</span>
                <span>Progres: {currentPlan.progress.length} Lokasi</span>
              </div>
            </div>
          </div>
        </div>

        {/* Filter per Pekan */}
        <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-1 text-xs">
          <span className="text-slate-400 font-semibold flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" /> Filter Pekan:
          </span>
          {['ALL', 'MINGGU KE 1', 'MINGGU KE 2', 'MINGGU KE 3', 'MINGGU KE 4', 'MINGGU KE 5'].map((pekan) => (
            <button
              key={pekan}
              onClick={() => setPekanFilter(pekan)}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all whitespace-nowrap ${
                pekanFilter === pekan 
                  ? 'bg-emerald-600 text-white font-bold shadow-sm' 
                  : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700'
              }`}
            >
              {pekan === 'ALL' ? 'Semua Pekan' : pekan}
            </button>
          ))}
        </div>

        {/* ============================================================ */}
        {/* TABEL 1: FUNDING (Sesuai format Excel & Gambar 1 yang diminta) */}
        {/* ============================================================ */}
        <div className="space-y-3 mb-8">
          <div className="flex justify-between items-center">
            <h3 className="text-sm sm:text-base font-extrabold text-emerald-300 uppercase tracking-wider flex items-center gap-2">
              <span className="w-2 h-4 bg-emerald-400 rounded-full inline-block" />
              Tabel Funding ({selectedMonth})
            </h3>
            <span className="text-xs text-slate-400">
              Menampilkan {filteredFunding.length} program
            </span>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-slate-700/80 shadow-md">
            <table className="w-full text-left text-xs sm:text-sm border-collapse">
              <thead>
                <tr className="bg-[#1b4332] text-emerald-100 font-bold border-b border-slate-700">
                  <th className="p-3.5 w-14 text-center">NO</th>
                  <th className="p-3.5 min-w-[150px]">TANGGAL</th>
                  <th className="p-3.5 min-w-[130px]">PEKAN</th>
                  <th className="p-3.5 min-w-[240px]">NAMA PROGRAM</th>
                  <th className="p-3.5 min-w-[100px] text-center">STATUS</th>
                  <th className="p-3.5 min-w-[90px] text-right">AKSI</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/50 text-slate-300 bg-slate-900/70">
                {filteredFunding.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-6 text-center text-slate-400 text-sm">
                      Belum ada jadwal funding untuk pekan ini. Klik "+ Tambah Funding" untuk menambahkan.
                    </td>
                  </tr>
                ) : (
                  filteredFunding.map((item, idx) => (
                    <tr key={item.id || idx} className="hover:bg-white/5 transition-colors group">
                      <td className="p-3.5 text-center font-bold text-emerald-400">
                        {item.no || idx + 1}
                      </td>
                      <td className="p-3.5 font-medium text-white whitespace-nowrap">
                        {item.tanggal}
                      </td>
                      <td className="p-3.5 whitespace-nowrap">
                        <span className="bg-emerald-950/90 text-emerald-300 border border-emerald-800/80 text-[11px] font-bold px-2.5 py-1 rounded-md">
                          {item.pekan}
                        </span>
                      </td>
                      <td className="p-3.5 font-semibold text-slate-100">
                        <div className="flex items-center gap-2">
                          <BookOpen className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                          <span>{item.program}</span>
                        </div>
                        {item.pic && (
                          <span className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5 font-normal">
                            <User className="w-3 h-3" /> PIC: {item.pic}
                          </span>
                        )}
                      </td>
                      <td className="p-3.5 text-center whitespace-nowrap">
                        <button
                          onClick={() => onToggleStatus('funding', selectedMonth, item.id)}
                          className={`text-xs font-bold px-2.5 py-1 rounded-full border transition-all inline-flex items-center gap-1 ${
                            item.status === 'Selesai'
                              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 hover:bg-emerald-500/30'
                              : item.status === 'Berjalan'
                              ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 hover:bg-amber-500/30'
                              : 'bg-slate-700/60 text-slate-400 border-slate-600 hover:bg-slate-700'
                          }`}
                          title="Klik untuk ubah status"
                        >
                          {item.status === 'Selesai' ? <CheckCircle2 className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                          <span>{item.status}</span>
                        </button>
                      </td>
                      <td className="p-3.5 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5 opacity-90 group-hover:opacity-100">
                          <button
                            onClick={() => onOpenModal('funding', selectedMonth, item)}
                            className="p-1.5 text-slate-400 hover:text-emerald-300 hover:bg-slate-800 rounded-lg transition-colors"
                            title="Edit Agenda"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => onDeleteItem('funding', selectedMonth, item.id)}
                            className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-slate-800 rounded-lg transition-colors"
                            title="Hapus Agenda"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* ============================================================ */}
        {/* TABEL 2: MONITORING / PROGRES (Format Excel & Gambar 2 yang diminta) */}
        {/* ============================================================ */}
        <div className="space-y-3 pt-4 border-t border-slate-700/80">
          <div className="flex justify-between items-center">
            <h3 className="text-sm sm:text-base font-extrabold text-teal-300 uppercase tracking-wider flex items-center gap-2">
              <span className="w-2 h-4 bg-teal-400 rounded-full inline-block" />
              Tabel Monitoring / Progres ({selectedMonth})
            </h3>
            <span className="text-xs text-slate-400">
              Menampilkan {filteredProgress.length} catatan kegiatan
            </span>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-slate-700/80 shadow-md">
            <table className="w-full text-left text-xs sm:text-sm border-collapse">
              <thead>
                <tr className="bg-[#1b4332] text-emerald-100 font-bold border-b border-slate-700">
                  <th className="p-3.5 w-14 text-center">NO</th>
                  <th className="p-3.5 min-w-[150px]">TANGGAL</th>
                  <th className="p-3.5 min-w-[130px]">PEKAN</th>
                  <th className="p-3.5 min-w-[280px]">KETERANGAN & LOKASI</th>
                  <th className="p-3.5 min-w-[110px] text-center">STATUS</th>
                  <th className="p-3.5 min-w-[90px] text-right">AKSI</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/50 text-slate-300 bg-slate-900/70">
                {filteredProgress.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-6 text-center text-slate-400 text-sm">
                      Belum ada laporan progres untuk pekan ini. Klik "+ Tambah Progres" untuk menambahkan.
                    </td>
                  </tr>
                ) : (
                  filteredProgress.map((item, idx) => (
                    <tr key={item.id || idx} className="hover:bg-white/5 transition-colors group">
                      <td className="p-3.5 text-center font-bold text-teal-400">
                        {item.no || idx + 1}
                      </td>
                      <td className="p-3.5 font-medium text-white whitespace-nowrap">
                        {item.tanggal}
                      </td>
                      <td className="p-3.5 whitespace-nowrap">
                        <span className="bg-teal-950/90 text-teal-300 border border-teal-800/80 text-[11px] font-bold px-2.5 py-1 rounded-md">
                          {item.pekan}
                        </span>
                      </td>
                      <td className="p-3.5 text-slate-200">
                        <p className="font-medium text-white leading-relaxed">{item.keterangan}</p>
                        {item.lokasi && (
                          <span className="text-[11px] text-teal-300/80 inline-flex items-center gap-1 mt-0.5">
                            📍 {item.lokasi}
                          </span>
                        )}
                      </td>
                      <td className="p-3.5 text-center whitespace-nowrap">
                        <button
                          onClick={() => onToggleStatus('progress', selectedMonth, item.id)}
                          className={`text-xs font-bold px-2.5 py-1 rounded-full border transition-all inline-flex items-center gap-1 ${
                            item.status === 'Selesai'
                              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 hover:bg-emerald-500/30'
                              : item.status === 'Dalam Proses'
                              ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 hover:bg-amber-500/30'
                              : 'bg-slate-700/60 text-slate-400 border-slate-600 hover:bg-slate-700'
                          }`}
                          title="Klik untuk ubah status"
                        >
                          {item.status === 'Selesai' ? <CheckCircle2 className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                          <span>{item.status}</span>
                        </button>
                      </td>
                      <td className="p-3.5 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5 opacity-90 group-hover:opacity-100">
                          <button
                            onClick={() => onOpenModal('progress', selectedMonth, item)}
                            className="p-1.5 text-slate-400 hover:text-teal-300 hover:bg-slate-800 rounded-lg transition-colors"
                            title="Edit Progres"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => onDeleteItem('progress', selectedMonth, item.id)}
                            className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-slate-800 rounded-lg transition-colors"
                            title="Hapus Progres"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer Evaluasi Ringkas */}
        {currentPlan.evaluasi && (
          <div className="mt-6 pt-4 border-t border-slate-800 flex items-start gap-2.5 text-xs text-slate-400">
            <span className="text-emerald-400 font-bold uppercase tracking-wider">Catatan Evaluasi:</span>
            <span>{currentPlan.evaluasi}</span>
          </div>
        )}
      </div>
    </div>
  );
};
