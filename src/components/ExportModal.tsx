import React, { useState } from 'react';
import { X, FileText, FileSpreadsheet, Download, Check, Sparkles, Loader2, MapPin, Image as ImageIcon } from 'lucide-react';
import { FullReportData, YearlyPlans, DistributionLocation } from '../types';
import { exportToWord, exportToExcel, downloadPdfFile } from '../utils/exportUtils';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  reportData: FullReportData;
  yearlyPlans: YearlyPlans;
  locations: DistributionLocation[];
  onNotify: (msg: string) => void;
  onOpenMapExport?: () => void;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  reportData,
  yearlyPlans,
  locations,
  onNotify,
  onOpenMapExport
}) => {
  const [isExportingPdf, setIsExportingPdf] = useState(false);

  if (!isOpen) return null;

  const handlePdf = async () => {
    try {
      setIsExportingPdf(true);
      onNotify("Sedang memproses dan mengunduh berkas PDF ke perangkat Anda...");
      await downloadPdfFile(reportData, yearlyPlans);
      onNotify("Berkas PDF dokumen resmi berhasil diunduh.");
      setIsExportingPdf(false);
      onClose();
    } catch (e) {
      console.error(e);
      setIsExportingPdf(false);
      onNotify("Terjadi kendala saat mengunduh PDF. Silakan coba lagi.");
    }
  };

  const handleWord = () => {
    exportToWord(reportData, yearlyPlans);
    onNotify("Berkas Microsoft Word (.doc) berhasil diunduh.");
    onClose();
  };

  const handleExcel = () => {
    exportToExcel(yearlyPlans, locations, reportData);
    onNotify("Berkas Microsoft Excel (.xls) berhasil diunduh.");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full p-6 sm:p-8 border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
        <div className="flex justify-between items-center pb-4 border-b border-slate-100">
          <div>
            <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider flex items-center gap-1.5">
              <Download className="w-3.5 h-3.5" /> Pusat Ekspor & Unduh Berkas
            </span>
            <h3 className="text-xl font-black text-slate-800 tracking-tight mt-0.5">
              Unduh File Langsung ke Komputer
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-full hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-xs sm:text-sm text-slate-600 mt-3 mb-6">
          Pilih format berkas yang ingin langsung <strong>diunduh / diekspor</strong> sebagai file asli ke perangkat Anda (tanpa dialog print):
        </p>

        <div className="space-y-3.5">
          {/* 1. PDF File Download (Pure Download, No Print Dialog) */}
          <button
            onClick={handlePdf}
            disabled={isExportingPdf}
            className="w-full text-left p-4 rounded-2xl border-2 border-slate-200 hover:border-red-500 hover:bg-red-50/40 transition-all flex items-start gap-4 group disabled:opacity-60"
          >
            <div className="p-3 bg-red-100 text-red-700 rounded-2xl group-hover:scale-105 transition-transform flex-shrink-0">
              {isExportingPdf ? <Loader2 className="w-6 h-6 animate-spin" /> : <Download className="w-6 h-6" />}
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <h4 className="font-extrabold text-slate-900 text-sm sm:text-base group-hover:text-red-700 flex items-center gap-2">
                  <span>Unduh File PDF (.pdf)</span>
                  {isExportingPdf && <span className="text-xs font-normal text-red-600">Mengunduh...</span>}
                </h4>
                <span className="text-[10px] bg-red-100 text-red-800 font-bold px-2 py-0.5 rounded-md">
                  Download File
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                File <strong>.pdf</strong> langsung terunduh ke komputer/HP Anda tanpa diarahkan ke dialog cetak printer.
              </p>
            </div>
          </button>

          {/* 2. Microsoft Word */}
          <button
            onClick={handleWord}
            className="w-full text-left p-4 rounded-2xl border-2 border-slate-200 hover:border-blue-500 hover:bg-blue-50/40 transition-all flex items-start gap-4 group"
          >
            <div className="p-3 bg-blue-100 text-blue-700 rounded-2xl group-hover:scale-105 transition-transform flex-shrink-0">
              <FileText className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <h4 className="font-extrabold text-slate-900 text-sm sm:text-base group-hover:text-blue-700">
                  Unduh Microsoft Word (.doc)
                </h4>
                <span className="text-[10px] bg-blue-100 text-blue-800 font-bold px-2 py-0.5 rounded-md">
                  Bisa Diedit
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Berkas dokumen rapi yang dapat langsung dibuka dan diedit di Microsoft Word, Google Docs, atau WPS Office.
              </p>
            </div>
          </button>

          {/* 3. Microsoft Excel */}
          <button
            onClick={handleExcel}
            className="w-full text-left p-4 rounded-2xl border-2 border-slate-200 hover:border-emerald-600 hover:bg-emerald-50/40 transition-all flex items-start gap-4 group"
          >
            <div className="p-3 bg-emerald-100 text-emerald-700 rounded-2xl group-hover:scale-105 transition-transform flex-shrink-0">
              <FileSpreadsheet className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <h4 className="font-extrabold text-slate-900 text-sm sm:text-base group-hover:text-emerald-700">
                  Unduh Microsoft Excel (.xls)
                </h4>
                <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-md">
                  Tabel Data
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Rekapitulasi lengkap 12 bulan (Funding & Progres) serta seluruh direktori titik lokasi dalam format spreadsheet.
              </p>
            </div>
          </button>

          {/* 4. Unduh Peta & Infografis Wilayah (PNG / PDF / Clipboard) */}
          {onOpenMapExport && (
            <button
              onClick={() => {
                onClose();
                onOpenMapExport();
              }}
              className="w-full text-left p-4 rounded-2xl border-2 border-slate-200 hover:border-teal-600 hover:bg-teal-50/40 transition-all flex items-start gap-4 group"
            >
              <div className="p-3 bg-teal-100 text-teal-700 rounded-2xl group-hover:scale-105 transition-transform flex-shrink-0">
                <MapPin className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h4 className="font-extrabold text-slate-900 text-sm sm:text-base group-hover:text-teal-700 flex items-center gap-1.5">
                    <span>Unduh Peta & Buat Infografis</span>
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  </h4>
                  <span className="text-[10px] bg-teal-100 text-teal-800 font-bold px-2 py-0.5 rounded-md">
                    PNG / PDF / Copy
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  Ekspor visual peta sebaran 12 titik Jawa Barat dalam format poster infografis resmi atau gambar bersih untuk Word/PPT.
                </p>
              </div>
            </button>
          )}
        </div>

        <div className="mt-6 pt-4 border-t border-slate-100 flex justify-between items-center text-xs text-slate-400">
          <span>💡 Khusus untuk cetak kertas fisik, gunakan tombol di dalam halaman laporan.</span>
          <button
            onClick={onClose}
            className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold px-5 py-2.5 rounded-xl transition-all"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
