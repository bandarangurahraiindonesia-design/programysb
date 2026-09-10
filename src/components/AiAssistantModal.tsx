import React, { useState } from 'react';
import { Sparkles, X, Check, ArrowRight, Wand2, BookOpen, Layers, RefreshCw } from 'lucide-react';
import { MonthName, FundingItem, ProgressItem } from '../types';

interface AiAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedMonth: MonthName;
  onApplyGeneratedPlan: (
    month: MonthName,
    focus: string,
    target: number,
    funding: FundingItem[],
    progress: ProgressItem[]
  ) => void;
}

export const AiAssistantModal: React.FC<AiAssistantModalProps> = ({
  isOpen,
  onClose,
  selectedMonth,
  onApplyGeneratedPlan
}) => {
  const [theme, setTheme] = useState('Pelosok & Daerah Terpencil');
  const [targetMushaf, setTargetMushaf] = useState(350);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedResult, setGeneratedResult] = useState<{
    focus: string;
    funding: FundingItem[];
    progress: ProgressItem[];
  } | null>(null);

  if (!isOpen) return null;

  const handleGenerate = () => {
    setIsGenerating(true);
    setTimeout(() => {
      let focusText = `Optimalisasi Penyaluran ${targetMushaf} Mushaf bertema ${theme}, pemetaan titik madrasah duafa, serta penguatan sinergi dai lokal di wilayah Priangan.`;
      
      const newFunding: FundingItem[] = [
        {
          id: `f-ai-1-${Date.now()}`,
          no: 1,
          tanggal: `3-4 ${selectedMonth} 2026`,
          pekan: "MINGGU KE 1",
          program: `AL-QUR'AN WAKAF: ${theme.toUpperCase()}`,
          targetMushaf: Math.round(targetMushaf * 0.25),
          status: "Rencana",
          pic: "Ust. Fajar"
        },
        {
          id: `f-ai-2-${Date.now()}`,
          no: 2,
          tanggal: `10-11 ${selectedMonth} 2026`,
          pekan: "MINGGU KE 2",
          program: "AL-QUR'AN SANTRI DUAFA & IQRA",
          targetMushaf: Math.round(targetMushaf * 0.25),
          status: "Rencana",
          pic: "Ust. Rahmat"
        },
        {
          id: `f-ai-3-${Date.now()}`,
          no: 3,
          tanggal: `17-18 ${selectedMonth} 2026`,
          pekan: "MINGGU KE 3",
          program: "PAKET SARANA BELAJAR & MUSHAF TAHFIDZ",
          targetMushaf: Math.round(targetMushaf * 0.25),
          status: "Rencana",
          pic: "Ustzh. Aisyah"
        },
        {
          id: `f-ai-4-${Date.now()}`,
          no: 4,
          tanggal: `24-25 ${selectedMonth} 2026`,
          pekan: "MINGGU KE 4",
          program: "WAKAF MUSHAF GENERASI QUR'ANI",
          targetMushaf: Math.round(targetMushaf * 0.25),
          status: "Rencana",
          pic: "Ust. Fajar"
        }
      ];

      const newProgress: ProgressItem[] = [
        {
          id: `p-ai-1-${Date.now()}`,
          no: 1,
          tanggal: `5 ${selectedMonth} 2026`,
          pekan: "MINGGU KE 1",
          keterangan: `Verifikasi data pemohon & asesmen kebutuhan mushaf mitra di ${selectedMonth}`,
          lokasi: "Bandung Raya & Priangan",
          status: "Pending"
        },
        {
          id: `p-ai-2-${Date.now()}`,
          no: 2,
          tanggal: `12 ${selectedMonth} 2026`,
          pekan: "MINGGU KE 2",
          keterangan: `Ekspedisi tahap 1 dan pendistribusian ${Math.round(targetMushaf * 0.4)} mushaf ke madrasah pelosok`,
          lokasi: "Wilayah Pelosok",
          status: "Pending"
        },
        {
          id: `p-ai-3-${Date.now()}`,
          no: 3,
          tanggal: `19 ${selectedMonth} 2026`,
          pekan: "MINGGU KE 3",
          keterangan: "Monitoring efektivitas pengajaran dan pembagian mushaf tahap 2",
          lokasi: "Pesantren & TPA Binaan",
          status: "Pending"
        },
        {
          id: `p-ai-4-${Date.now()}`,
          no: 4,
          tanggal: `26 ${selectedMonth} 2026`,
          pekan: "MINGGU KE 4",
          keterangan: `Rapat pleno evaluasi bulanan ${selectedMonth} & penyusunan berita acara serah terima`,
          lokasi: "Kantor Pusat",
          status: "Pending"
        }
      ];

      setGeneratedResult({
        focus: focusText,
        funding: newFunding,
        progress: newProgress
      });
      setIsGenerating(false);
    }, 600);
  };

  const handleApply = () => {
    if (!generatedResult) return;
    onApplyGeneratedPlan(
      selectedMonth,
      generatedResult.focus,
      targetMushaf,
      generatedResult.funding,
      generatedResult.progress
    );
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full p-6 sm:p-8 border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
        <div className="flex justify-between items-center pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <span className="p-2 bg-gradient-to-tr from-emerald-600 to-teal-600 text-white rounded-xl shadow-md shadow-emerald-600/20">
              <Sparkles className="w-5 h-5" />
            </span>
            <div>
              <h3 className="text-xl font-black text-slate-800 tracking-tight">
                AI Asisten Perencana Program
              </h3>
              <p className="text-xs text-slate-500">
                Otomatisasi penyusunan 4 pekan funding & progres untuk bulan: <strong className="text-emerald-700">{selectedMonth} 2026</strong>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-full hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-5 pt-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Pilih Tema Prioritas Program
              </label>
              <select
                value={theme}
                onChange={(e) => setTheme(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-800 focus:ring-2 focus:ring-emerald-500 font-medium"
              >
                <option value="Pelosok & Daerah Terpencil">Pelosok & Daerah Terpencil (Priangan)</option>
                <option value="Santri Tahfidz & Rumah Qur'an">Santri Tahfidz & Rumah Qur'an</option>
                <option value="Peningkatan Kapasitas Guru Ngaji">Peningkatan Kapasitas Guru Ngaji & TPA</option>
                <option value="Semarak Hari Besar Islam & Baksos">Semarak Hari Besar Islam & Baksos</option>
                <option value="Pesisir & Komunitas Nelayan">Pesisir & Komunitas Nelayan</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Target Alokasi Mushaf
              </label>
              <input
                type="number"
                value={targetMushaf}
                onChange={(e) => setTargetMushaf(Number(e.target.value))}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-sm text-slate-800 focus:ring-2 focus:ring-emerald-500 font-medium"
              />
            </div>
          </div>

          <button
            onClick={handleGenerate}
            disabled={isGenerating}
            className="w-full bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white font-bold py-3 px-4 rounded-xl shadow-md shadow-emerald-600/20 transition-all flex items-center justify-center gap-2 text-sm"
          >
            {isGenerating ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Menyusun Rencana Kerja Pekanan...</span>
              </>
            ) : (
              <>
                <Wand2 className="w-4 h-4" />
                <span>Susun Rencana Kerja 4 Pekan Otomatis</span>
              </>
            )}
          </button>

          {/* Result Preview */}
          {generatedResult && (
            <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200 space-y-4 animate-in fade-in duration-300">
              <div>
                <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">
                  Draf Fokus Utama:
                </span>
                <p className="text-sm font-medium text-slate-800 mt-1">{generatedResult.focus}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm">
                  <span className="font-bold text-emerald-800 uppercase block mb-1">
                    4 Agenda Funding Disusun:
                  </span>
                  <ul className="space-y-1 text-slate-600">
                    {generatedResult.funding.map((f, i) => (
                      <li key={i} className="truncate">• {f.pekan}: {f.program}</li>
                    ))}
                  </ul>
                </div>

                <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm">
                  <span className="font-bold text-teal-800 uppercase block mb-1">
                    4 Agenda Monitoring Disusun:
                  </span>
                  <ul className="space-y-1 text-slate-600">
                    {generatedResult.progress.map((p, i) => (
                      <li key={i} className="truncate">• {p.pekan}: {p.keterangan}</li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  onClick={() => setGeneratedResult(null)}
                  className="text-xs text-slate-500 hover:text-slate-700 px-3 py-2 font-medium"
                >
                  Batal / Susun Ulang
                </button>
                <button
                  onClick={handleApply}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-4 py-2 rounded-xl shadow-md shadow-emerald-600/20 flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>Terapkan ke Rencana Kerja {selectedMonth}</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
