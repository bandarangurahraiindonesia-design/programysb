import React, { useState, useRef } from 'react';
import { 
  Printer, Copy, Check, FileDown, ShieldCheck, 
  Building2, Calendar, FileText, CheckCircle2, Edit3, Plus, 
  Trash2, MoveUp, MoveDown, Eye, FileSpreadsheet, Sparkles, X, Download, Loader2,
  Upload, Image as ImageIcon, PenLine
} from 'lucide-react';
import { FullReportData, ReportSection, YearlyPlans, DistributionLocation } from '../types';
import { exportToWord, exportToExcel, printToPrinter, downloadPdfFile } from '../utils/exportUtils';

interface ExecutiveReportViewProps {
  reportData: FullReportData;
  yearlyPlans: YearlyPlans;
  locations: DistributionLocation[];
  onUpdateReport: (updated: FullReportData) => void;
  onNotify?: (msg: string) => void;
}

export const ExecutiveReportView: React.FC<ExecutiveReportViewProps> = ({
  reportData,
  yearlyPlans,
  locations,
  onUpdateReport,
  onNotify
}) => {
  const [isEditMode, setIsEditMode] = useState<boolean>(true);
  const [copied, setCopied] = useState(false);
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);
  const signatureFileInputRef = useRef<HTMLInputElement>(null);
  const [activeSignatureSlot, setActiveSignatureSlot] = useState<'1' | '2' | '3' | null>(null);

  const handleUploadSignatureClick = (slot: '1' | '2' | '3') => {
    setActiveSignatureSlot(slot);
    if (signatureFileInputRef.current) {
      signatureFileInputRef.current.value = '';
      signatureFileInputRef.current.click();
    }
  };

  const handleSignatureFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && activeSignatureSlot) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        const b64 = ev.target?.result as string;
        if (b64) {
          if (activeSignatureSlot === '1') handleUpdatePenanggungJawab('signatureImage1', b64);
          if (activeSignatureSlot === '2') handleUpdatePenanggungJawab('signatureImage2', b64);
          if (activeSignatureSlot === '3') handleUpdatePenanggungJawab('signatureImage3', b64);
          if (onNotify) onNotify(`Tanda tangan / Cap Kolom ${activeSignatureSlot} berhasil diunggah.`);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Direct editing helpers
  const handleUpdateHeader = (field: keyof FullReportData, value: any) => {
    onUpdateReport({
      ...reportData,
      [field]: value
    });
  };

  const handleUpdatePenanggungJawab = (field: keyof FullReportData['penanggungJawab'], value: string) => {
    onUpdateReport({
      ...reportData,
      penanggungJawab: {
        ...reportData.penanggungJawab,
        [field]: value
      }
    });
  };

  const handleUpdateSectionTitle = (id: number, title: string) => {
    onUpdateReport({
      ...reportData,
      sections: reportData.sections.map(s => s.id === id ? { ...s, title } : s)
    });
  };

  const handleUpdateSectionContent = (id: number, content: string) => {
    onUpdateReport({
      ...reportData,
      sections: reportData.sections.map(s => s.id === id ? { ...s, content } : s)
    });
  };

  // Table Cell editing
  const handleUpdateTableCell = (sectionId: number, rowIndex: number, cellIndex: number, value: string) => {
    onUpdateReport({
      ...reportData,
      sections: reportData.sections.map(s => {
        if (s.id === sectionId && s.table) {
          const newRows = s.table.rows.map((row, rIdx) => {
            if (rIdx === rowIndex) {
              const newCells = [...row];
              newCells[cellIndex] = value;
              return newCells;
            }
            return row;
          });
          return { ...s, table: { ...s.table, rows: newRows } };
        }
        return s;
      })
    });
  };

  // Table Header editing
  const handleUpdateTableHeader = (sectionId: number, colIndex: number, value: string) => {
    onUpdateReport({
      ...reportData,
      sections: reportData.sections.map(s => {
        if (s.id === sectionId && s.table) {
          const newHeaders = [...s.table.headers];
          newHeaders[colIndex] = value;
          return { ...s, table: { ...s.table, headers: newHeaders } };
        }
        return s;
      })
    });
  };

  // Add Table Row
  const handleAddTableRow = (sectionId: number) => {
    onUpdateReport({
      ...reportData,
      sections: reportData.sections.map(s => {
        if (s.id === sectionId && s.table) {
          const emptyRow = s.table.headers.map(() => 'Baris baru');
          return { ...s, table: { ...s.table, rows: [...s.table.rows, emptyRow] } };
        }
        return s;
      })
    });
  };

  // Delete Table Row
  const handleDeleteTableRow = (sectionId: number, rowIndex: number) => {
    onUpdateReport({
      ...reportData,
      sections: reportData.sections.map(s => {
        if (s.id === sectionId && s.table) {
          return {
            ...s,
            table: {
              ...s.table,
              rows: s.table.rows.filter((_, idx) => idx !== rowIndex)
            }
          };
        }
        return s;
      })
    });
  };

  // Add New Section
  const handleAddNewSection = () => {
    const newId = reportData.sections.length > 0 
      ? Math.max(...reportData.sections.map(s => s.id)) + 1 
      : 1;

    const newSection: ReportSection = {
      id: newId,
      title: `${newId}. JUDUL BAGIAN BARU`,
      type: 'text',
      content: 'Tuliskan isi keterangan, evaluasi, atau catatan penting untuk bagian ini.'
    };

    onUpdateReport({
      ...reportData,
      sections: [...reportData.sections, newSection]
    });
    if (onNotify) onNotify("Bagian dokumen baru berhasil ditambahkan.");
  };

  // Delete Section
  const handleDeleteSection = (id: number) => {
    if (window.confirm("Apakah Anda yakin ingin menghapus bagian laporan ini?")) {
      onUpdateReport({
        ...reportData,
        sections: reportData.sections.filter(s => s.id !== id)
      });
      if (onNotify) onNotify("Bagian laporan berhasil dihapus.");
    }
  };

  // Move Section Up/Down
  const handleMoveSection = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= reportData.sections.length) return;

    const newSections = [...reportData.sections];
    const temp = newSections[index];
    newSections[index] = newSections[targetIndex];
    newSections[targetIndex] = temp;

    onUpdateReport({
      ...reportData,
      sections: newSections
    });
  };

  const handleCopyText = () => {
    let fullText = `${reportData.title}\n${reportData.subtitle}\nNomor: ${reportData.nomorSurat}\n${reportData.period}\n\n`;
    reportData.sections.forEach(sec => {
      fullText += `${sec.title}\n${sec.content}\n`;
      if (sec.table) {
        fullText += `[TABEL: ${sec.table.headers.join(' | ')}]\n`;
        sec.table.rows.forEach(r => {
          fullText += `${r.join(' | ')}\n`;
        });
      }
      fullText += `\n----------------------------------------\n\n`;
    });
    fullText += `Ditetapkan di: ${reportData.kota}, ${reportData.tanggalDitetapkan}\n`;
    fullText += `1. Ketua Yayasan: ${reportData.penanggungJawab.ketuaYayasan} (NIP. ${reportData.penanggungJawab.nipKetua})\n`;
    fullText += `2. Kadiv Program: ${reportData.penanggungJawab.kadivProgram} (NIP. ${reportData.penanggungJawab.nipKadiv})\n`;
    fullText += `3. Sekretaris: ${reportData.penanggungJawab.sekretaris} (NIP. ${reportData.penanggungJawab.nipSekretaris})`;

    navigator.clipboard.writeText(fullText).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
      if (onNotify) onNotify("Seluruh isi laporan resmi tersalin ke clipboard.");
    });
  };

  return (
    <div className="space-y-6">
      {/* Top Action Toolbar (Hidden during print) */}
      <div className="no-print bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/80 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 bg-emerald-100 text-emerald-800 rounded-xl">
              <ShieldCheck className="w-5 h-5" />
            </span>
            <h3 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
              Dokumen Laporan Resmi & Cetak Berita Acara
            </h3>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Seluruh elemen (judul, kop surat, nomor, teks, tabel, baris, dan lembar tanda tangan) dapat langsung diedit, ditambah, dan dihapus.
          </p>
        </div>

        {/* Mode Toggle, Print Action, and Download File Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Edit Mode Toggle */}
          <button
            onClick={() => setIsEditMode(!isEditMode)}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 border shadow-xs ${
              isEditMode 
                ? 'bg-amber-50 text-amber-900 border-amber-300 ring-2 ring-amber-400/30' 
                : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
            }`}
          >
            {isEditMode ? <Edit3 className="w-3.5 h-3.5 text-amber-700" /> : <Eye className="w-3.5 h-3.5 text-slate-600" />}
            <span>{isEditMode ? 'Mode Edit Aktif' : 'Mode Pratinjau'}</span>
          </button>

          {/* KHUSUS CETAK FISIK / PRINT KE PRINTER */}
          <button
            onClick={() => {
              if (onNotify) onNotify("Membuka dialog cetak printer...");
              printToPrinter();
            }}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white shadow-xs transition-all flex items-center gap-2 ring-2 ring-rose-600/20"
            title="Khusus untuk mencetak fisik dokumen ke mesin printer (Print Kertas)"
          >
            <Printer className="w-4 h-4" />
            <span>Cetak / Print Kertas</span>
          </button>

          {/* PEMISAH / DIVIDER */}
          <div className="h-6 w-px bg-slate-200 mx-1 hidden sm:block"></div>

          {/* KELOMPOK UNDUH / DOWNLOAD BERKAS ASLI */}
          <div className="flex items-center gap-1.5 bg-slate-50 p-1 rounded-2xl border border-slate-200">
            <span className="text-[10px] font-black text-slate-500 uppercase px-1.5 hidden md:inline">
              Unduh:
            </span>

            {/* Direct PDF Download */}
            <button
              disabled={isDownloadingPdf}
              onClick={async () => {
                setIsDownloadingPdf(true);
                if (onNotify) onNotify("Sedang menyusun dokumen PDF beresolusi tinggi sesuai cetakan...");
                try {
                  await downloadPdfFile(reportData, yearlyPlans);
                  if (onNotify) onNotify("Berkas PDF dokumen resmi berhasil diunduh.");
                } catch (error) {
                  console.error(error);
                  if (onNotify) onNotify("Terjadi kendala saat mengunduh PDF.");
                } finally {
                  setIsDownloadingPdf(false);
                }
              }}
              className="px-2.5 py-1.5 rounded-xl text-xs font-bold bg-white hover:bg-red-50 text-red-700 border border-slate-200 hover:border-red-300 transition-all flex items-center gap-1 shadow-2xs disabled:opacity-50"
              title="Unduh file PDF (.pdf) langsung ke komputer tanpa dialog print"
            >
              {isDownloadingPdf ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin text-red-600" />
              ) : (
                <Download className="w-3.5 h-3.5 text-red-600" />
              )}
              <span>{isDownloadingPdf ? 'Menyusun PDF...' : 'PDF (.pdf)'}</span>
            </button>

            {/* Word Download */}
            <button
              onClick={() => {
                exportToWord(reportData, yearlyPlans);
                if (onNotify) onNotify("Berkas Word (.doc) berhasil diunduh.");
              }}
              className="px-2.5 py-1.5 rounded-xl text-xs font-bold bg-white hover:bg-blue-50 text-blue-700 border border-slate-200 hover:border-blue-300 transition-all flex items-center gap-1 shadow-2xs"
              title="Unduh dokumen dalam format Word (.doc)"
            >
              <Download className="w-3.5 h-3.5 text-blue-600" />
              <span>Word (.doc)</span>
            </button>

            {/* Excel Download */}
            <button
              onClick={() => {
                exportToExcel(yearlyPlans, locations, reportData);
                if (onNotify) onNotify("Berkas Excel (.xls) berhasil diunduh.");
              }}
              className="px-2.5 py-1.5 rounded-xl text-xs font-bold bg-white hover:bg-emerald-50 text-emerald-700 border border-slate-200 hover:border-emerald-300 transition-all flex items-center gap-1 shadow-2xs"
              title="Unduh data dalam format Excel (.xls)"
            >
              <Download className="w-3.5 h-3.5 text-emerald-600" />
              <span>Excel (.xls)</span>
            </button>
          </div>

          {/* Copy Text */}
          <button
            onClick={handleCopyText}
            className="px-3 py-2 rounded-xl text-xs font-semibold border border-slate-200 hover:bg-slate-100 text-slate-700 transition-all flex items-center gap-1.5"
            title="Salin seluruh isi dokumen ke clipboard"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-500" />}
            <span>{copied ? 'Tersalin!' : 'Salin'}</span>
          </button>
        </div>
      </div>

      {/* Editing Guide Banner when edit mode is on */}
      {isEditMode && (
        <div className="no-print bg-amber-50 border border-amber-200/80 rounded-2xl p-3.5 px-4 text-xs text-amber-900 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
            <span>
              <strong>Mode Edit Aktif:</strong> Anda dapat langsung mengetik pada kotak input di bawah untuk mengubah judul, teks, tabel, menambah baris, atau menambah bagian baru. Klik <strong>"Mode Pratinjau Bersih"</strong> di atas jika ingin melihat tampilan kertas tanpa garis kotak.
            </span>
          </div>
          <button
            onClick={handleAddNewSection}
            className="bg-amber-600 hover:bg-amber-700 text-white font-bold px-3 py-1.5 rounded-lg whitespace-nowrap shadow-xs flex items-center gap-1"
          >
            <Plus className="w-3.5 h-3.5" /> + Tambah Bagian Baru
          </button>
        </div>
      )}

      {/* Official Printable Paper Document Card */}
      <div 
        id="official-report-document"
        className="bg-white rounded-3xl border border-slate-200 shadow-xl p-6 sm:p-12 max-w-4xl mx-auto print:shadow-none print:border-none print:p-0 transition-all"
      >
        {/* Kop Surat Resmi */}
        <div className="border-b-4 border-double border-slate-800 pb-5 mb-8 text-center">
          <div className="flex items-center justify-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-800 to-teal-700 text-white flex items-center justify-center font-black text-xl shadow-md">
              YSB
            </div>
            <div className="text-left w-full max-w-lg">
              {isEditMode ? (
                <div className="space-y-1">
                  <input
                    type="text"
                    value={reportData.subtitle}
                    onChange={(e) => handleUpdateHeader('subtitle', e.target.value)}
                    className="w-full text-xl sm:text-2xl font-black tracking-wide text-slate-900 uppercase font-sans border-b border-dashed border-slate-300 focus:border-emerald-500 focus:outline-none bg-amber-50/20 px-1"
                  />
                  <input
                    type="text"
                    value={reportData.divisi}
                    onChange={(e) => handleUpdateHeader('divisi', e.target.value)}
                    className="w-full text-xs sm:text-sm text-slate-600 font-sans font-medium border-b border-dashed border-slate-300 focus:border-emerald-500 focus:outline-none bg-amber-50/20 px-1"
                  />
                </div>
              ) : (
                <>
                  <h1 className="text-xl sm:text-2xl font-black tracking-wide text-slate-900 uppercase font-sans">
                    {reportData.subtitle}
                  </h1>
                  <p className="text-xs sm:text-sm text-slate-600 font-sans font-medium">
                    {reportData.divisi}
                  </p>
                </>
              )}
            </div>
          </div>
          <p className="text-[11px] text-slate-500 font-sans">
            Sekretariat: Gedung Dakwah Lt. 2, Jl. Pelajar Pejuang 45 No. 88, Bandung 40263 | Telp: (022) 731-9988 | Email: program@saranaberbagi.org
          </p>
        </div>

        {/* Judul & Nomor Surat */}
        <div className="text-center mb-8 font-sans space-y-2">
          {isEditMode ? (
            <div className="max-w-xl mx-auto space-y-2">
              <div>
                <label className="text-[10px] font-bold uppercase text-slate-400 block text-left">Judul Laporan</label>
                <input
                  type="text"
                  value={reportData.title}
                  onChange={(e) => handleUpdateHeader('title', e.target.value)}
                  className="w-full text-center text-lg sm:text-xl font-black text-slate-900 tracking-tight uppercase border border-amber-200 rounded-xl p-2 bg-amber-50/30 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-left">
                <div>
                  <label className="text-[10px] font-bold uppercase text-slate-400 block">Nomor Surat</label>
                  <input
                    type="text"
                    value={reportData.nomorSurat}
                    onChange={(e) => handleUpdateHeader('nomorSurat', e.target.value)}
                    className="w-full text-xs font-mono font-bold text-slate-800 border border-amber-200 rounded-lg px-2.5 py-1.5 bg-amber-50/30 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase text-slate-400 block">Periode Evaluasi / Agenda</label>
                  <input
                    type="text"
                    value={reportData.period}
                    onChange={(e) => handleUpdateHeader('period', e.target.value)}
                    className="w-full text-xs font-bold text-slate-800 border border-amber-200 rounded-lg px-2.5 py-1.5 bg-amber-50/30 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>
          ) : (
            <>
              <h2 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight uppercase underline decoration-2 decoration-slate-900">
                {reportData.title}
              </h2>
              <p className="text-xs text-slate-600 font-mono mt-1">Nomor: {reportData.nomorSurat}</p>
              <div className="inline-block bg-slate-100 px-3 py-1 rounded-full text-xs text-slate-700 font-semibold mt-2 border border-slate-200">
                {reportData.period}
              </div>
            </>
          )}
        </div>

        {/* Section Contents (Fully Editable) */}
        <div className="space-y-8 font-sans">
          {reportData.sections.map((section, sIdx) => (
            <div key={section.id} className="space-y-3 relative group/sec p-2 rounded-2xl transition-all hover:bg-slate-50/50">
              {/* Section Header & Reorder/Delete Tools */}
              <div className="flex items-center justify-between gap-2">
                {isEditMode ? (
                  <input
                    type="text"
                    value={section.title}
                    onChange={(e) => handleUpdateSectionTitle(section.id, e.target.value)}
                    className="w-full text-sm font-black text-slate-900 uppercase tracking-wide border-b-2 border-emerald-600 pl-1 py-1 focus:outline-none bg-amber-50/30"
                  />
                ) : (
                  <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wide border-l-4 border-emerald-600 pl-2.5">
                    {section.title}
                  </h3>
                )}

                {/* Edit Controls */}
                {isEditMode && (
                  <div className="no-print flex items-center gap-1 flex-shrink-0">
                    <button
                      onClick={() => handleMoveSection(sIdx, 'up')}
                      disabled={sIdx === 0}
                      className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-30 rounded hover:bg-slate-200"
                      title="Geser Bagian ke Atas"
                    >
                      <MoveUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleMoveSection(sIdx, 'down')}
                      disabled={sIdx === reportData.sections.length - 1}
                      className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-30 rounded hover:bg-slate-200"
                      title="Geser Bagian ke Bawah"
                    >
                      <MoveDown className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteSection(section.id)}
                      className="p-1 text-slate-400 hover:text-red-600 rounded hover:bg-red-50"
                      title="Hapus Bagian Ini"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>

              {/* Section Content (Narrative text) */}
              {isEditMode ? (
                <textarea
                  rows={3}
                  value={section.content}
                  onChange={(e) => handleUpdateSectionContent(section.id, e.target.value)}
                  className="w-full text-sm text-slate-800 leading-relaxed border border-slate-200 rounded-xl p-3 bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  placeholder="Ketik isi uraian teks bagian ini..."
                />
              ) : (
                <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line text-justify">
                  {section.content}
                </p>
              )}

              {/* Table (if exists) */}
              {section.table && (
                <div className="overflow-x-auto rounded-xl border border-slate-200 mt-3">
                  <table className="w-full text-left text-xs sm:text-sm border-collapse">
                    <thead>
                      <tr className="bg-slate-100 text-slate-800 font-bold border-b border-slate-200">
                        {section.table.headers.map((header, hIdx) => (
                          <th key={hIdx} className="p-2.5">
                            {isEditMode ? (
                              <input
                                type="text"
                                value={header}
                                onChange={(e) => handleUpdateTableHeader(section.id, hIdx, e.target.value)}
                                className="w-full font-bold bg-transparent border-b border-slate-300 focus:border-emerald-600 focus:outline-none"
                              />
                            ) : (
                              header
                            )}
                          </th>
                        ))}
                        {isEditMode && <th className="no-print p-2.5 w-10 text-right">Aksi</th>}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700">
                      {section.table.rows.map((row, rIdx) => (
                        <tr key={rIdx} className="hover:bg-slate-50/70">
                          {row.map((cell, cIdx) => (
                            <td key={cIdx} className={`p-2.5 ${cIdx === 0 ? 'font-medium text-slate-900' : ''}`}>
                              {isEditMode ? (
                                <input
                                  type="text"
                                  value={cell}
                                  onChange={(e) => handleUpdateTableCell(section.id, rIdx, cIdx, e.target.value)}
                                  className="w-full bg-transparent border-b border-slate-200 focus:border-emerald-500 focus:outline-none py-1"
                                />
                              ) : (
                                cell
                              )}
                            </td>
                          ))}
                          {isEditMode && (
                            <td className="no-print p-2.5 text-right">
                              <button
                                onClick={() => handleDeleteTableRow(section.id, rIdx)}
                                className="p-1 text-slate-300 hover:text-red-500 rounded"
                                title="Hapus Baris"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </td>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  {/* Add Row Button */}
                  {isEditMode && (
                    <div className="no-print p-2 bg-slate-50/80 border-t border-slate-100 flex justify-end">
                      <button
                        onClick={() => handleAddTableRow(section.id)}
                        className="text-xs text-emerald-700 hover:text-emerald-800 font-bold flex items-center gap-1 py-1 px-2.5 rounded-lg hover:bg-emerald-100/50"
                      >
                        <Plus className="w-3.5 h-3.5" /> + Tambah Baris Tabel
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}

          {/* Add Section Button (When Edit Mode) */}
          {isEditMode && (
            <div className="no-print pt-2 pb-4">
              <button
                onClick={handleAddNewSection}
                className="w-full py-3 border-2 border-dashed border-emerald-300 hover:border-emerald-600 rounded-2xl text-emerald-700 font-bold text-xs hover:bg-emerald-50/60 transition-all flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4" />
                <span>+ Tambah Bagian Laporan Baru</span>
              </button>
            </div>
          )}

          {/* Lembar Pengesahan Resmi Tiga Tanda Tangan (Fully Editable) */}
          <div className="pt-8 border-t border-slate-200 mt-10">
            {/* Hidden Input for Signature Image / Stamp Upload */}
            <input
              ref={signatureFileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleSignatureFileChange}
            />

            {/* Tanggal & Tempat Penetapan (Semua Editable) */}
            <div className="flex justify-end items-center gap-2 text-xs text-slate-600 mb-6 flex-wrap">
              {isEditMode ? (
                <div className="flex items-center gap-1.5 flex-wrap bg-amber-50/60 p-1.5 rounded-lg border border-amber-200">
                  <span className="text-[10px] text-amber-700 font-semibold uppercase tracking-wider mr-1">Penetapan:</span>
                  <input
                    type="text"
                    value={reportData.penetapanPrefix || 'Ditetapkan di:'}
                    onChange={(e) => handleUpdateHeader('penetapanPrefix', e.target.value)}
                    className="w-28 border border-amber-300 rounded px-2 py-1 text-xs bg-white font-medium text-slate-700"
                    placeholder="Ditetapkan di:"
                    title="Frasa penetapan (contoh: Ditetapkan di:, Disahkan di:)"
                  />
                  <input
                    type="text"
                    value={reportData.kota}
                    onChange={(e) => handleUpdateHeader('kota', e.target.value)}
                    className="w-28 border border-amber-300 rounded px-2 py-1 text-xs bg-white font-semibold text-slate-800"
                    placeholder="Kota Penetapan"
                    title="Kota/Lokasi"
                  />
                  <span className="font-bold text-slate-400">,</span>
                  <input
                    type="text"
                    value={reportData.tanggalDitetapkan}
                    onChange={(e) => handleUpdateHeader('tanggalDitetapkan', e.target.value)}
                    className="w-36 border border-amber-300 rounded px-2 py-1 text-xs bg-white font-semibold text-slate-800"
                    placeholder="Tanggal Penetapan"
                    title="Tanggal Penetapan"
                  />
                </div>
              ) : (
                <span className="font-semibold text-slate-700">
                  {reportData.penetapanPrefix || 'Ditetapkan di:'} {reportData.kota}, {reportData.tanggalDitetapkan}
                </span>
              )}
            </div>

            {/* 3 Signature Columns (Semua Label, Jabatan, TTD & NIP Bisa Diedit) */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center font-sans">
              {/* 1. Kolom Tanda Tangan 1 */}
              <div className="bg-slate-50/50 p-3 rounded-2xl border border-slate-100 flex flex-col justify-between">
                <div>
                  {isEditMode ? (
                    <div className="space-y-1 mb-2">
                      <input
                        type="text"
                        value={reportData.penanggungJawab.rolePrefix1 || 'Mengetahui,'}
                        onChange={(e) => handleUpdatePenanggungJawab('rolePrefix1', e.target.value)}
                        className="w-full text-center text-xs text-slate-600 font-medium border border-amber-200 rounded px-1 py-0.5 bg-white"
                        placeholder="Contoh: Mengetahui,"
                      />
                      <input
                        type="text"
                        value={reportData.penanggungJawab.roleTitle1 || 'Ketua Yayasan'}
                        onChange={(e) => handleUpdatePenanggungJawab('roleTitle1', e.target.value)}
                        className="w-full text-center text-xs font-bold text-slate-800 border border-amber-200 rounded px-1 py-0.5 bg-white"
                        placeholder="Jabatan (Contoh: Ketua Yayasan)"
                      />
                    </div>
                  ) : (
                    <>
                      <p className="text-xs text-slate-500 font-medium">{reportData.penanggungJawab.rolePrefix1 || 'Mengetahui,'}</p>
                      <p className="text-xs font-bold text-slate-800">{reportData.penanggungJawab.roleTitle1 || 'Ketua Yayasan'}</p>
                    </>
                  )}

                  {/* Area Visual Tanda Tangan */}
                  <div className="h-20 flex flex-col items-center justify-center my-1 relative group">
                    {reportData.penanggungJawab.signatureImage1 ? (
                      <div className="relative inline-block">
                        <img 
                          src={reportData.penanggungJawab.signatureImage1} 
                          alt="TTD 1" 
                          className="h-16 max-w-full object-contain mx-auto" 
                        />
                        {isEditMode && (
                          <button
                            type="button"
                            onClick={() => handleUpdatePenanggungJawab('signatureImage1', '')}
                            className="absolute -top-2 -right-2 bg-red-100 hover:bg-red-200 text-red-600 rounded-full p-1 shadow-sm"
                            title="Hapus gambar TTD & kembali ke tulisan"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    ) : (
                      <span className="font-serif italic text-emerald-800 text-xl opacity-80 select-none">
                        {reportData.penanggungJawab.signatureText1 || reportData.penanggungJawab.ketuaYayasan.split(' ')[0] || 'Tanda Tangan'}
                      </span>
                    )}

                    {/* Tombol Aksi TTD dalam Edit Mode */}
                    {isEditMode && (
                      <div className="flex items-center gap-1.5 mt-1">
                        <button
                          type="button"
                          onClick={() => handleUploadSignatureClick('1')}
                          className="text-[10px] flex items-center gap-1 text-slate-600 bg-white hover:bg-slate-100 border border-slate-200 rounded px-2 py-0.5"
                          title="Unggah foto/scan tanda tangan atau stempel asli"
                        >
                          <Upload className="w-2.5 h-2.5" />
                          <span>Unggah Cap/TTD</span>
                        </button>
                      </div>
                    )}
                  </div>

                  {isEditMode && !reportData.penanggungJawab.signatureImage1 && (
                    <div className="mb-2">
                      <input
                        type="text"
                        value={reportData.penanggungJawab.signatureText1 || ''}
                        onChange={(e) => handleUpdatePenanggungJawab('signatureText1', e.target.value)}
                        className="w-full text-center text-[10px] text-emerald-700 font-serif italic border border-dashed border-emerald-300 rounded px-1 py-0.5 bg-emerald-50/30"
                        placeholder="Ketik teks paraf/TTD (opsional)"
                      />
                    </div>
                  )}
                </div>

                {isEditMode ? (
                  <div className="space-y-1.5 mt-2">
                    <input
                      type="text"
                      value={reportData.penanggungJawab.ketuaYayasan}
                      onChange={(e) => handleUpdatePenanggungJawab('ketuaYayasan', e.target.value)}
                      className="w-full text-center text-xs font-bold border border-amber-200 rounded px-1 py-1 bg-white"
                      placeholder="Nama Lengkap & Gelar"
                    />
                    <div className="flex items-center gap-1">
                      <input
                        type="text"
                        value={reportData.penanggungJawab.idPrefix1 || 'NIP.'}
                        onChange={(e) => handleUpdatePenanggungJawab('idPrefix1', e.target.value)}
                        className="w-14 text-center text-[10px] text-slate-500 border border-slate-200 rounded px-1 py-0.5"
                        placeholder="NIP."
                      />
                      <input
                        type="text"
                        value={reportData.penanggungJawab.nipKetua}
                        onChange={(e) => handleUpdatePenanggungJawab('nipKetua', e.target.value)}
                        className="flex-1 text-center text-[10px] text-slate-500 border border-slate-200 rounded px-1 py-0.5"
                        placeholder="Nomor ID / NIP"
                      />
                    </div>
                  </div>
                ) : (
                  <div>
                    <p className="text-xs font-bold text-slate-900 underline mt-1">
                      {reportData.penanggungJawab.ketuaYayasan}
                    </p>
                    <p className="text-[10px] text-slate-500">
                      {reportData.penanggungJawab.idPrefix1 || 'NIP.'} {reportData.penanggungJawab.nipKetua}
                    </p>
                  </div>
                )}
              </div>

              {/* 2. Kolom Tanda Tangan 2 */}
              <div className="bg-slate-50/50 p-3 rounded-2xl border border-slate-100 flex flex-col justify-between">
                <div>
                  {isEditMode ? (
                    <div className="space-y-1 mb-2">
                      <input
                        type="text"
                        value={reportData.penanggungJawab.rolePrefix2 || 'Disusun oleh,'}
                        onChange={(e) => handleUpdatePenanggungJawab('rolePrefix2', e.target.value)}
                        className="w-full text-center text-xs text-slate-600 font-medium border border-amber-200 rounded px-1 py-0.5 bg-white"
                        placeholder="Contoh: Disusun oleh,"
                      />
                      <input
                        type="text"
                        value={reportData.penanggungJawab.roleTitle2 || 'Kepala Divisi Program'}
                        onChange={(e) => handleUpdatePenanggungJawab('roleTitle2', e.target.value)}
                        className="w-full text-center text-xs font-bold text-slate-800 border border-amber-200 rounded px-1 py-0.5 bg-white"
                        placeholder="Jabatan (Contoh: Kepala Divisi Program)"
                      />
                    </div>
                  ) : (
                    <>
                      <p className="text-xs text-slate-500 font-medium">{reportData.penanggungJawab.rolePrefix2 || 'Disusun oleh,'}</p>
                      <p className="text-xs font-bold text-slate-800">{reportData.penanggungJawab.roleTitle2 || 'Kepala Divisi Program'}</p>
                    </>
                  )}

                  {/* Area Visual Tanda Tangan */}
                  <div className="h-20 flex flex-col items-center justify-center my-1 relative group">
                    {reportData.penanggungJawab.signatureImage2 ? (
                      <div className="relative inline-block">
                        <img 
                          src={reportData.penanggungJawab.signatureImage2} 
                          alt="TTD 2" 
                          className="h-16 max-w-full object-contain mx-auto" 
                        />
                        {isEditMode && (
                          <button
                            type="button"
                            onClick={() => handleUpdatePenanggungJawab('signatureImage2', '')}
                            className="absolute -top-2 -right-2 bg-red-100 hover:bg-red-200 text-red-600 rounded-full p-1 shadow-sm"
                            title="Hapus gambar TTD & kembali ke tulisan"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    ) : (
                      <span className="font-serif italic text-emerald-800 text-xl opacity-80 select-none">
                        {reportData.penanggungJawab.signatureText2 || reportData.penanggungJawab.kadivProgram.split(' ')[0] || 'Tanda Tangan'}
                      </span>
                    )}

                    {isEditMode && (
                      <div className="flex items-center gap-1.5 mt-1">
                        <button
                          type="button"
                          onClick={() => handleUploadSignatureClick('2')}
                          className="text-[10px] flex items-center gap-1 text-slate-600 bg-white hover:bg-slate-100 border border-slate-200 rounded px-2 py-0.5"
                          title="Unggah foto/scan tanda tangan atau stempel asli"
                        >
                          <Upload className="w-2.5 h-2.5" />
                          <span>Unggah Cap/TTD</span>
                        </button>
                      </div>
                    )}
                  </div>

                  {isEditMode && !reportData.penanggungJawab.signatureImage2 && (
                    <div className="mb-2">
                      <input
                        type="text"
                        value={reportData.penanggungJawab.signatureText2 || ''}
                        onChange={(e) => handleUpdatePenanggungJawab('signatureText2', e.target.value)}
                        className="w-full text-center text-[10px] text-emerald-700 font-serif italic border border-dashed border-emerald-300 rounded px-1 py-0.5 bg-emerald-50/30"
                        placeholder="Ketik teks paraf/TTD (opsional)"
                      />
                    </div>
                  )}
                </div>

                {isEditMode ? (
                  <div className="space-y-1.5 mt-2">
                    <input
                      type="text"
                      value={reportData.penanggungJawab.kadivProgram}
                      onChange={(e) => handleUpdatePenanggungJawab('kadivProgram', e.target.value)}
                      className="w-full text-center text-xs font-bold border border-amber-200 rounded px-1 py-1 bg-white"
                      placeholder="Nama Lengkap & Gelar"
                    />
                    <div className="flex items-center gap-1">
                      <input
                        type="text"
                        value={reportData.penanggungJawab.idPrefix2 || 'NIP.'}
                        onChange={(e) => handleUpdatePenanggungJawab('idPrefix2', e.target.value)}
                        className="w-14 text-center text-[10px] text-slate-500 border border-slate-200 rounded px-1 py-0.5"
                        placeholder="NIP."
                      />
                      <input
                        type="text"
                        value={reportData.penanggungJawab.nipKadiv}
                        onChange={(e) => handleUpdatePenanggungJawab('nipKadiv', e.target.value)}
                        className="flex-1 text-center text-[10px] text-slate-500 border border-slate-200 rounded px-1 py-0.5"
                        placeholder="Nomor ID / NIP"
                      />
                    </div>
                  </div>
                ) : (
                  <div>
                    <p className="text-xs font-bold text-slate-900 underline mt-1">
                      {reportData.penanggungJawab.kadivProgram}
                    </p>
                    <p className="text-[10px] text-slate-500">
                      {reportData.penanggungJawab.idPrefix2 || 'NIP.'} {reportData.penanggungJawab.nipKadiv}
                    </p>
                  </div>
                )}
              </div>

              {/* 3. Kolom Tanda Tangan 3 */}
              <div className="bg-slate-50/50 p-3 rounded-2xl border border-slate-100 flex flex-col justify-between">
                <div>
                  {isEditMode ? (
                    <div className="space-y-1 mb-2">
                      <input
                        type="text"
                        value={reportData.penanggungJawab.rolePrefix3 || 'Diverifikasi oleh,'}
                        onChange={(e) => handleUpdatePenanggungJawab('rolePrefix3', e.target.value)}
                        className="w-full text-center text-xs text-slate-600 font-medium border border-amber-200 rounded px-1 py-0.5 bg-white"
                        placeholder="Contoh: Diverifikasi oleh,"
                      />
                      <input
                        type="text"
                        value={reportData.penanggungJawab.roleTitle3 || 'Sekretaris Yayasan'}
                        onChange={(e) => handleUpdatePenanggungJawab('roleTitle3', e.target.value)}
                        className="w-full text-center text-xs font-bold text-slate-800 border border-amber-200 rounded px-1 py-0.5 bg-white"
                        placeholder="Jabatan (Contoh: Sekretaris Yayasan)"
                      />
                    </div>
                  ) : (
                    <>
                      <p className="text-xs text-slate-500 font-medium">{reportData.penanggungJawab.rolePrefix3 || 'Diverifikasi oleh,'}</p>
                      <p className="text-xs font-bold text-slate-800">{reportData.penanggungJawab.roleTitle3 || 'Sekretaris Yayasan'}</p>
                    </>
                  )}

                  {/* Area Visual Tanda Tangan */}
                  <div className="h-20 flex flex-col items-center justify-center my-1 relative group">
                    {reportData.penanggungJawab.signatureImage3 ? (
                      <div className="relative inline-block">
                        <img 
                          src={reportData.penanggungJawab.signatureImage3} 
                          alt="TTD 3" 
                          className="h-16 max-w-full object-contain mx-auto" 
                        />
                        {isEditMode && (
                          <button
                            type="button"
                            onClick={() => handleUpdatePenanggungJawab('signatureImage3', '')}
                            className="absolute -top-2 -right-2 bg-red-100 hover:bg-red-200 text-red-600 rounded-full p-1 shadow-sm"
                            title="Hapus gambar TTD & kembali ke tulisan"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    ) : (
                      <span className="font-serif italic text-emerald-800 text-xl opacity-80 select-none">
                        {reportData.penanggungJawab.signatureText3 || reportData.penanggungJawab.sekretaris.split(' ')[0] || 'Tanda Tangan'}
                      </span>
                    )}

                    {isEditMode && (
                      <div className="flex items-center gap-1.5 mt-1">
                        <button
                          type="button"
                          onClick={() => handleUploadSignatureClick('3')}
                          className="text-[10px] flex items-center gap-1 text-slate-600 bg-white hover:bg-slate-100 border border-slate-200 rounded px-2 py-0.5"
                          title="Unggah foto/scan tanda tangan atau stempel asli"
                        >
                          <Upload className="w-2.5 h-2.5" />
                          <span>Unggah Cap/TTD</span>
                        </button>
                      </div>
                    )}
                  </div>

                  {isEditMode && !reportData.penanggungJawab.signatureImage3 && (
                    <div className="mb-2">
                      <input
                        type="text"
                        value={reportData.penanggungJawab.signatureText3 || ''}
                        onChange={(e) => handleUpdatePenanggungJawab('signatureText3', e.target.value)}
                        className="w-full text-center text-[10px] text-emerald-700 font-serif italic border border-dashed border-emerald-300 rounded px-1 py-0.5 bg-emerald-50/30"
                        placeholder="Ketik teks paraf/TTD (opsional)"
                      />
                    </div>
                  )}
                </div>

                {isEditMode ? (
                  <div className="space-y-1.5 mt-2">
                    <input
                      type="text"
                      value={reportData.penanggungJawab.sekretaris}
                      onChange={(e) => handleUpdatePenanggungJawab('sekretaris', e.target.value)}
                      className="w-full text-center text-xs font-bold border border-amber-200 rounded px-1 py-1 bg-white"
                      placeholder="Nama Lengkap & Gelar"
                    />
                    <div className="flex items-center gap-1">
                      <input
                        type="text"
                        value={reportData.penanggungJawab.idPrefix3 || 'NIP.'}
                        onChange={(e) => handleUpdatePenanggungJawab('idPrefix3', e.target.value)}
                        className="w-14 text-center text-[10px] text-slate-500 border border-slate-200 rounded px-1 py-0.5"
                        placeholder="NIP."
                      />
                      <input
                        type="text"
                        value={reportData.penanggungJawab.nipSekretaris}
                        onChange={(e) => handleUpdatePenanggungJawab('nipSekretaris', e.target.value)}
                        className="flex-1 text-center text-[10px] text-slate-500 border border-slate-200 rounded px-1 py-0.5"
                        placeholder="Nomor ID / NIP"
                      />
                    </div>
                  </div>
                ) : (
                  <div>
                    <p className="text-xs font-bold text-slate-900 underline mt-1">
                      {reportData.penanggungJawab.sekretaris}
                    </p>
                    <p className="text-[10px] text-slate-500">
                      {reportData.penanggungJawab.idPrefix3 || 'NIP.'} {reportData.penanggungJawab.nipSekretaris}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
