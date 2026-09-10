import React, { useState, useEffect, useRef } from 'react';
import { 
  HeartHandshake, Printer, Download, Share2, Copy, Check, 
  Sparkles, Award, MapPin, Building, Users, Calendar, BookOpen,
  Edit3, Eye, Plus, Trash2, RotateCcw, Upload, Image as ImageIcon,
  CheckCircle2, FileText, Loader2
} from 'lucide-react';
import { DistributionLocation, YearlyPlans } from '../types';
import { downloadElementAsPdf, exportDonorReportToWord, printToPrinter } from '../utils/exportUtils';

interface DonorReportViewProps {
  locations: DistributionLocation[];
  yearlyPlans: YearlyPlans;
  onNotify?: (msg: string) => void;
}

interface PhotoItem {
  id: string;
  url: string;
  caption: string;
}

interface TableRowItem {
  id: string;
  nama: string;
  wilayah: string;
  penerima: string;
  alokasi: string;
  status: string;
}

const DEFAULT_PHOTOS: PhotoItem[] = [
  {
    id: 'p1',
    url: 'https://images.unsplash.com/photo-1609599006353-e629aaabfeae?auto=format&fit=crop&w=450&q=80',
    caption: 'Penyerahan mushaf wakaf ke pimpinan pesantren'
  },
  {
    id: 'p2',
    url: 'https://images.unsplash.com/photo-1584286595398-a59f21d313f5?auto=format&fit=crop&w=450&q=80',
    caption: 'Santri membaca mushaf Al-Qur\'an baru'
  },
  {
    id: 'p3',
    url: 'https://images.unsplash.com/photo-1590073242678-70ee3fc28e8e?auto=format&fit=crop&w=450&q=80',
    caption: 'Doa bersama santri untuk keberkahan donatur'
  }
];

export const DonorReportView: React.FC<DonorReportViewProps> = ({
  locations,
  yearlyPlans,
  onNotify
}) => {
  // Mode Edit Toggle: true = edit inputs visible, false = pristine preview
  const [isEditMode, setIsEditMode] = useState<boolean>(true);
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);

  // Editable Document State (with local storage persistence)
  const [title, setTitle] = useState("LAPORAN PENYALURAN WAKAF AL-QUR'AN");
  const [subtitle, setSubtitle] = useState("Yayasan Sarana Berbagi • Divisi Pendayagunaan Program");
  const [nomorLaporan, setNomorLaporan] = useState("DONOR-YSB/IX/2026/088");
  const [periodeDonasi, setPeriodeDonasi] = useState("September 2026");
  
  const [dedicationLabel, setDedicationLabel] = useState("Dipersiapkan Khusus Untuk:");
  const [namaDonatur, setNamaDonatur] = useState("Bpk. H. Rahmat & Keluarga");
  const [namaInstitusi, setNamaInstitusi] = useState("Komunitas Sahabat Berbagi Indonesia");
  const [pesanKhusus, setPesanKhusus] = useState("Diniatkan sebagai wakaf jariyah untuk almarhum orang tua, semoga setiap huruf yang dibaca oleh para santri mengalirkan pahala abadi.");

  const [jumlahDonasiMushaf, setJumlahDonasiMushaf] = useState<number>(120);
  const [metric1Label, setMetric1Label] = useState("Total Wakaf");
  const [metric1Sub, setMetric1Sub] = useState("Mushaf Al-Qur'an");

  const [metric2Label, setMetric2Label] = useState("Lembaga Penerima");
  const [metric2Sub, setMetric2Sub] = useState("Pesantren & TPA");

  const [metric3Label, setMetric3Label] = useState("Penerima Manfaat");
  const [metric3CustomCount, setMetric3CustomCount] = useState("195+");
  const [metric3Sub, setMetric3Sub] = useState("Santri Mengaji");

  const [tableTitle, setTableTitle] = useState("Daftar Titik Penyaluran yang Menerima Amanah Donasi:");
  const [photosTitle, setPhotosTitle] = useState("Dokumentasi Serah Terima & Kegiatan Santri:");
  
  const [photos, setPhotos] = useState<PhotoItem[]>(DEFAULT_PHOTOS);

  const [doaArab, setDoaArab] = useState("جَزَاكُمُ اللهُ خَيْرًا كَثِيْرًا وَبَارَكَ اللهُ فِيْ أَمْوَالِكُمْ وَأَهْلِيْكُمْ");
  const [doaTerjemah, setDoaTerjemah] = useState("Semoga setiap huruf Al-Qur'an yang dilantunkan para santri menjadi aliran amal jariyah tanpa henti, pembawa syafa'at, dan penyelamat di yaumul hisab kelak bagi Bapak/Ibu sekeluarga.");

  const [namaLembagaFooter, setNamaLembagaFooter] = useState("Yayasan Sarana Berbagi");
  const [divisiFooter, setDivisiFooter] = useState("Divisi Program & Pendayagunaan Wakaf");
  const [kotaFooter, setKotaFooter] = useState("Bandung, Jawa Barat");

  const [namaPic, setNamaPic] = useState("Ust. Fajar Ramadhan");
  const [jabatanPic, setJabatanPic] = useState("Koordinator Lapangan Penyaluran");

  // Select which distribution locations are covered by this donor
  const [selectedLocIds, setSelectedLocIds] = useState<string[]>(() => {
    return locations.slice(0, 3).map(l => l.id);
  });

  // Custom table rows state
  const [customTableRows, setCustomTableRows] = useState<TableRowItem[]>(() => {
    const init = locations.slice(0, 3).map((loc, idx) => ({
      id: loc.id || `row-${idx}`,
      nama: loc.nama,
      wilayah: `${loc.kecamatan}, ${loc.wilayah}`,
      penerima: loc.penerimaManfaat,
      alokasi: `${loc.jumlahMushaf} Eks`,
      status: loc.status
    }));
    return init;
  });

  const [copiedWA, setCopiedWA] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadTargetPhotoId, setUploadTargetPhotoId] = useState<string | null>(null);

  // Sync selected location chips to table rows
  const handleToggleLoc = (id: string) => {
    setSelectedLocIds(prev => {
      const nextIds = prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id];
      // Update custom table rows based on selected locations
      const newRows: TableRowItem[] = nextIds.map(locId => {
        const found = locations.find(l => l.id === locId);
        if (found) {
          return {
            id: found.id,
            nama: found.nama,
            wilayah: `${found.kecamatan}, ${found.wilayah}`,
            penerima: found.penerimaManfaat,
            alokasi: `${found.jumlahMushaf} Eks`,
            status: found.status
          };
        }
        return {
          id: locId,
          nama: 'Lokasi Penyaluran',
          wilayah: 'Jawa Barat',
          penerima: 'Santri Penghafal Al-Qur\'an',
          alokasi: '40 Eks',
          status: 'Tersalurkan'
        };
      });
      setCustomTableRows(newRows);
      return nextIds;
    });
  };

  // Add a manual custom row to the table
  const handleAddTableRow = () => {
    const newRow: TableRowItem = {
      id: `custom-row-${Date.now()}`,
      nama: 'Madrasah Baru / Pesantren Mitra',
      wilayah: 'Kec. Wilayah, Kab. Bandung',
      penerima: 'Santri Dhuafa & Yatim',
      alokasi: '35 Eks',
      status: 'Tersalurkan'
    };
    setCustomTableRows(prev => [...prev, newRow]);
    if (onNotify) onNotify('Baris penerima baru berhasil ditambahkan ke tabel.');
  };

  const handleUpdateTableRow = (id: string, field: keyof TableRowItem, val: string) => {
    setCustomTableRows(prev => prev.map(r => r.id === id ? { ...r, [field]: val } : r));
  };

  const handleDeleteTableRow = (id: string) => {
    setCustomTableRows(prev => prev.filter(r => r.id !== id));
  };

  // Add photo
  const handleAddPhoto = () => {
    const newP: PhotoItem = {
      id: `photo-${Date.now()}`,
      url: 'https://images.unsplash.com/photo-1542816417-0983c9c9ad53?auto=format&fit=crop&w=450&q=80',
      caption: 'Dokumentasi penyaluran mushaf'
    };
    setPhotos(prev => [...prev, newP]);
    if (onNotify) onNotify('Foto dokumentasi baru berhasil ditambahkan.');
  };

  const handleUpdatePhoto = (id: string, field: 'url' | 'caption', val: string) => {
    setPhotos(prev => prev.map(p => p.id === id ? { ...p, [field]: val } : p));
  };

  const handleDeletePhoto = (id: string) => {
    setPhotos(prev => prev.filter(p => p.id !== id));
  };

  // Local Image Upload for photos
  const handlePhotoUploadClick = (photoId: string) => {
    setUploadTargetPhotoId(photoId);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && uploadTargetPhotoId) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64Url = event.target?.result as string;
        if (base64Url) {
          handleUpdatePhoto(uploadTargetPhotoId, 'url', base64Url);
          if (onNotify) onNotify('Foto berhasil diunggah dan diperbarui.');
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Reset to default
  const handleResetToDefault = () => {
    if (!window.confirm("Kembalikan seluruh teks dan data laporan donatur ke pengaturan awal?")) return;
    setTitle("LAPORAN PENYALURAN WAKAF AL-QUR'AN");
    setSubtitle("Yayasan Sarana Berbagi • Divisi Pendayagunaan Program");
    setNomorLaporan("DONOR-YSB/IX/2026/088");
    setPeriodeDonasi("September 2026");
    setNamaDonatur("Bpk. H. Rahmat & Keluarga");
    setNamaInstitusi("Komunitas Sahabat Berbagi Indonesia");
    setPesanKhusus("Diniatkan sebagai wakaf jariyah untuk almarhum orang tua, semoga setiap huruf yang dibaca oleh para santri mengalirkan pahala abadi.");
    setJumlahDonasiMushaf(120);
    setPhotos(DEFAULT_PHOTOS);
    setDoaArab("جَزَاكُمُ اللهُ خَيْرًا كَثِيْرًا وَبَارَكَ اللهُ فِيْ أَمْوَالِكُمْ وَأَهْلِيْكُمْ");
    setDoaTerjemah("Semoga setiap huruf Al-Qur'an yang dilantunkan para santri menjadi aliran amal jariyah tanpa henti, pembawa syafa'at, dan penyelamat di yaumul hisab kelak bagi Bapak/Ibu sekeluarga.");
    setNamaPic("Ust. Fajar Ramadhan");
    setJabatanPic("Koordinator Lapangan Penyaluran");
    if (onNotify) onNotify("Format laporan donatur telah direset ke default.");
  };

  // WhatsApp Share Text Generator
  const handleCopyWhatsApp = () => {
    const text = `
*${title}*
*${namaLembagaFooter}*
No. Registrasi: ${nomorLaporan}

Kepada Yth:
*${namaDonatur}*
${namaInstitusi ? `_${namaInstitusi}_` : ''}

_Assalamu'alaikum Warahmatullahi Wabarakatuh_

Alhamdulillah wa syukurillah, amanah wakaf Al-Qur'an dari Bapak/Ibu sejumlah *${jumlahDonasiMushaf} Mushaf* telah selesai disalurkan kepada para santri dan madrasah penghafal Al-Qur'an pada periode *${periodeDonasi}*.

📍 *Rincian Titik Penyaluran:*
${customTableRows.map((r, idx) => `${idx + 1}. *${r.nama}* (${r.wilayah}) - ${r.alokasi}`).join('\n')}

👥 *Penerima Manfaat:* Para santri tahfidz dan madrasah pelosok yang membutuhkan mushaf layak baca.

🤲 *Doa & Apresiasi:*
"${doaTerjemah}"

🔗 Dokumen BAST resmi dan foto dokumentasi lengkap telah diarsipkan oleh Tim Divisi Program Yayasan Sarana Berbagi.
    `.trim();

    navigator.clipboard.writeText(text);
    setCopiedWA(true);
    setTimeout(() => setCopiedWA(false), 3000);
    if (onNotify) onNotify('Teks laporan pertanggungjawaban donatur siap dikirim via WhatsApp.');
  };

  // Unduh PDF File (No Print Dialog)
  const handleDownloadPdf = async () => {
    try {
      setIsDownloadingPdf(true);
      if (onNotify) onNotify("Sedang memproses dan mengunduh berkas PDF kartu dampak donatur...");
      const fileName = `Laporan_Donatur_${namaDonatur.replace(/[\/\\?%*:|"<>]/g, '_')}.pdf`;
      const ok = await downloadElementAsPdf('donor-impact-document', fileName);
      setIsDownloadingPdf(false);
      if (ok) {
        if (onNotify) onNotify("Berkas PDF Laporan Donatur berhasil diunduh.");
      } else {
        window.print();
      }
    } catch (e) {
      console.error(e);
      setIsDownloadingPdf(false);
      window.print();
    }
  };

  // Unduh Word (.doc)
  const handleDownloadWord = () => {
    exportDonorReportToWord({
      title,
      subtitle,
      nomorLaporan,
      periode: periodeDonasi,
      namaDonatur,
      namaInstitusi,
      pesanKhusus,
      totalMushaf: jumlahDonasiMushaf,
      lembagaCountText: `${customTableRows.length}`,
      santriCountText: metric3CustomCount,
      doaArab,
      doaTerjemah,
      namaLembaga: namaLembagaFooter,
      jabatanLembaga: divisiFooter,
      namaPic,
      jabatanPic,
      tableRows: customTableRows
    });
    if (onNotify) onNotify("Berkas Microsoft Word (.doc) laporan donatur berhasil diunduh.");
  };

  return (
    <div className="space-y-6">
      {/* Hidden file input for image uploads */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        className="hidden"
      />

      {/* Top Banner / Customizer Bar */}
      <div className="no-print bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 pb-5 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-600 text-white flex items-center justify-center font-bold shadow-md shadow-emerald-600/20">
              <HeartHandshake className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                <span>Laporan Pertanggungjawaban Donatur & Mitra</span>
                <span className="text-xs bg-emerald-100 text-emerald-800 font-bold px-2.5 py-0.5 rounded-full border border-emerald-200">
                  Full Editable Card
                </span>
              </h2>
              <p className="text-xs text-slate-500">
                Seluruh elemen teks, judul, kop, doa, angka, tabel titik madrasah, dan foto dapat langsung diedit di bawah.
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Toggle Edit Mode */}
            <button
              onClick={() => setIsEditMode(!isEditMode)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 border shadow-xs ${
                isEditMode 
                  ? 'bg-amber-50 text-amber-900 border-amber-300 ring-2 ring-amber-400/30' 
                  : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
              }`}
            >
              {isEditMode ? <Edit3 className="w-3.5 h-3.5 text-amber-700" /> : <Eye className="w-3.5 h-3.5 text-slate-600" />}
              <span>{isEditMode ? 'Mode Edit Aktif' : 'Mode Pratinjau Bersih'}</span>
            </button>

            {/* Print directly */}
            <button
              onClick={printToPrinter}
              className="bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 shadow-xs"
              title="Cetak fisik kartu laporan ke mesin printer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Cetak / Print Kertas</span>
            </button>

            {/* Direct PDF Download */}
            <button
              onClick={handleDownloadPdf}
              disabled={isDownloadingPdf}
              className="bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 shadow-xs disabled:opacity-60"
              title="Unduh berkas PDF (.pdf) langsung ke komputer tanpa dialog print"
            >
              {isDownloadingPdf ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
              <span>Unduh PDF (.pdf)</span>
            </button>

            {/* Word Download */}
            <button
              onClick={handleDownloadWord}
              className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 shadow-xs"
              title="Unduh format Microsoft Word (.doc)"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Word (.doc)</span>
            </button>

            {/* Copy WhatsApp */}
            <button
              onClick={handleCopyWhatsApp}
              className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 shadow-xs"
              title="Salin ringkasan pesan ke WhatsApp"
            >
              {copiedWA ? <Check className="w-3.5 h-3.5" /> : <Share2 className="w-3.5 h-3.5" />}
              <span>{copiedWA ? 'Tersalin!' : 'Salin WhatsApp'}</span>
            </button>

            {/* Reset */}
            <button
              onClick={handleResetToDefault}
              className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-all"
              title="Reset ke Template Default"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Input Customizer Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-5 text-xs">
          <div>
            <label className="block font-bold text-slate-700 uppercase mb-1">
              Nama Donatur / Pewakaf
            </label>
            <input
              type="text"
              value={namaDonatur}
              onChange={(e) => setNamaDonatur(e.target.value)}
              placeholder="Contoh: H. Ahmad & Keluarga"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-bold focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 uppercase mb-1">
              Nama Lembaga / Mitra Sponsor
            </label>
            <input
              type="text"
              value={namaInstitusi}
              onChange={(e) => setNamaInstitusi(e.target.value)}
              placeholder="Contoh: Komunitas Peduli Sesama"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-medium focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 uppercase mb-1">
              Jumlah Donasi Mushaf
            </label>
            <input
              type="number"
              value={jumlahDonasiMushaf}
              onChange={(e) => setJumlahDonasiMushaf(Number(e.target.value) || 0)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-black text-emerald-700 focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 uppercase mb-1">
              Periode Penyaluran
            </label>
            <input
              type="text"
              value={periodeDonasi}
              onChange={(e) => setPeriodeDonasi(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-medium focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="sm:col-span-2 lg:col-span-4">
            <label className="block font-bold text-slate-700 uppercase mb-1">
              Niat / Doa Khusus Donatur (Ditampilkan di Laporan)
            </label>
            <input
              type="text"
              value={pesanKhusus}
              onChange={(e) => setPesanKhusus(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-medium focus:ring-2 focus:ring-emerald-500 italic"
            />
          </div>
        </div>

        {/* Location Selector Chips */}
        <div className="mt-4 pt-4 border-t border-slate-100">
          <div className="flex justify-between items-center mb-2">
            <label className="block text-xs font-bold text-slate-700 uppercase">
              Pilih Cepat dari Titik Penyaluran Aktif (Otomatis Masuk ke Tabel):
            </label>
            <button
              onClick={handleAddTableRow}
              className="text-[11px] font-bold text-emerald-700 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100 px-2.5 py-1 rounded-lg border border-emerald-200 flex items-center gap-1"
            >
              <Plus className="w-3 h-3" /> Tambah Baris Madrasah Manual
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {locations.map((loc) => {
              const isSelected = selectedLocIds.includes(loc.id);
              return (
                <button
                  key={loc.id}
                  onClick={() => handleToggleLoc(loc.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 border ${
                    isSelected
                      ? 'bg-emerald-700 text-white border-emerald-700 shadow-xs'
                      : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <MapPin className="w-3 h-3" />
                  <span>{loc.nama}</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-md ${
                    isSelected ? 'bg-emerald-800 text-emerald-100' : 'bg-slate-200 text-slate-600'
                  }`}>
                    {loc.jumlahMushaf} Eks
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Edit Mode Notice Banner */}
      {isEditMode && (
        <div className="no-print bg-amber-50 border-2 border-amber-300/80 rounded-2xl p-4 text-xs text-amber-900 flex items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-2">
            <Edit3 className="w-4 h-4 text-amber-700 flex-shrink-0" />
            <span>
              <strong>Mode Edit Langsung Aktif:</strong> Seluruh teks, judul, nomor, doa, tabel titik madrasah, dan foto di bawah ini dapat langsung Anda klik dan ketik. Jika ingin melihat tampilan kertas bersih tanpa kotak isian, klik tombol <strong>"Mode Pratinjau Bersih"</strong> di atas.
            </span>
          </div>
          <button
            onClick={() => setIsEditMode(false)}
            className="bg-amber-600 hover:bg-amber-700 text-white font-bold px-3 py-1.5 rounded-xl text-xs flex-shrink-0 whitespace-nowrap shadow-xs"
          >
            Lihat Pratinjau Bersih
          </button>
        </div>
      )}

      {/* The Printable / Downloadable 1-Page Donor Impact Report Card */}
      <div 
        id="donor-impact-document"
        className="max-w-4xl mx-auto bg-white rounded-3xl p-8 sm:p-12 border border-slate-200/90 shadow-xl print:p-0 print:border-none print:shadow-none font-sans text-slate-900 transition-all"
      >
        
        {/* Certificate / Card Header */}
        <div className="text-center pb-6 border-b-2 border-emerald-700/80">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-emerald-800 text-white font-black text-xl mb-3 shadow-md">
            YSB
          </div>

          {/* Editable Main Title */}
          {isEditMode ? (
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full text-center text-2xl sm:text-3xl font-black text-emerald-950 tracking-tight uppercase font-serif bg-amber-50/40 border border-dashed border-amber-300 rounded-lg p-1.5 focus:ring-2 focus:ring-emerald-500"
            />
          ) : (
            <h1 className="text-2xl sm:text-3xl font-black text-emerald-950 tracking-tight uppercase font-serif">
              {title}
            </h1>
          )}

          {/* Editable Subtitle */}
          {isEditMode ? (
            <input
              type="text"
              value={subtitle}
              onChange={(e) => setSubtitle(e.target.value)}
              className="w-full text-center text-xs sm:text-sm font-bold text-emerald-800 uppercase tracking-widest mt-1 bg-amber-50/40 border border-dashed border-amber-300 rounded-lg p-1 focus:ring-2 focus:ring-emerald-500"
            />
          ) : (
            <p className="text-xs sm:text-sm font-bold text-emerald-800 uppercase tracking-widest mt-1">
              {subtitle}
            </p>
          )}

          {/* Editable Nomor Laporan & Periode */}
          <div className="flex items-center justify-center gap-2 text-[11px] text-slate-500 mt-2 font-mono flex-wrap">
            <span>Nomor Laporan:</span>
            {isEditMode ? (
              <input
                type="text"
                value={nomorLaporan}
                onChange={(e) => setNomorLaporan(e.target.value)}
                className="bg-amber-50/40 border border-dashed border-amber-300 rounded px-2 py-0.5 text-slate-800 font-bold w-48 text-center"
              />
            ) : (
              <span className="font-bold text-slate-700">{nomorLaporan}</span>
            )}
            <span>•</span>
            <span>Periode:</span>
            {isEditMode ? (
              <input
                type="text"
                value={periodeDonasi}
                onChange={(e) => setPeriodeDonasi(e.target.value)}
                className="bg-amber-50/40 border border-dashed border-amber-300 rounded px-2 py-0.5 text-slate-800 font-bold w-36 text-center"
              />
            ) : (
              <span className="font-bold text-slate-700">{periodeDonasi}</span>
            )}
          </div>
        </div>

        {/* Dedication Banner */}
        <div className="my-6 p-6 rounded-2xl bg-gradient-to-r from-emerald-50 via-teal-50/50 to-slate-50 border border-emerald-200/80 text-center">
          {isEditMode ? (
            <input
              type="text"
              value={dedicationLabel}
              onChange={(e) => setDedicationLabel(e.target.value)}
              className="text-[11px] uppercase tracking-wider font-extrabold text-emerald-800 block mb-1 text-center bg-transparent border-b border-dashed border-emerald-300 w-full"
            />
          ) : (
            <span className="text-[11px] uppercase tracking-wider font-extrabold text-emerald-800 block mb-1">
              {dedicationLabel}
            </span>
          )}

          {isEditMode ? (
            <input
              type="text"
              value={namaDonatur}
              onChange={(e) => setNamaDonatur(e.target.value)}
              className="w-full text-center text-2xl sm:text-3xl font-black text-slate-900 tracking-tight bg-amber-50/40 border border-dashed border-amber-300 rounded-lg p-1"
              placeholder="Nama Donatur / Pewakaf"
            />
          ) : (
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              {namaDonatur}
            </h2>
          )}

          {isEditMode ? (
            <input
              type="text"
              value={namaInstitusi}
              onChange={(e) => setNamaInstitusi(e.target.value)}
              className="w-full text-center text-sm font-bold text-slate-600 mt-1 bg-amber-50/40 border border-dashed border-amber-300 rounded-lg p-1"
              placeholder="Nama Lembaga Mitra / Sponsor (Boleh dikosongkan)"
            />
          ) : (
            namaInstitusi && (
              <p className="text-sm font-bold text-slate-600 mt-0.5">
                {namaInstitusi}
              </p>
            )
          )}

          <div className="mt-3 pt-3 border-t border-emerald-200/60 max-w-xl mx-auto">
            {isEditMode ? (
              <textarea
                value={pesanKhusus}
                onChange={(e) => setPesanKhusus(e.target.value)}
                rows={2}
                className="w-full text-xs text-emerald-900 italic font-medium text-center bg-amber-50/40 border border-dashed border-amber-300 rounded-lg p-2"
                placeholder="Tuliskan niat khusus / doa titipan donatur di sini..."
              />
            ) : (
              pesanKhusus && (
                <p className="text-xs text-emerald-900 italic font-medium">
                  "{pesanKhusus}"
                </p>
              )
            )}
          </div>
        </div>

        {/* Impact Numbers Grid */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-emerald-50/60 p-4 rounded-2xl border border-emerald-200/80 text-center">
            {isEditMode ? (
              <input
                type="text"
                value={metric1Label}
                onChange={(e) => setMetric1Label(e.target.value)}
                className="text-[11px] font-bold text-emerald-800 uppercase block w-full text-center bg-transparent border-b border-dashed border-emerald-300"
              />
            ) : (
              <span className="text-[11px] font-bold text-emerald-800 uppercase block">
                {metric1Label}
              </span>
            )}

            {isEditMode ? (
              <input
                type="number"
                value={jumlahDonasiMushaf}
                onChange={(e) => setJumlahDonasiMushaf(Number(e.target.value) || 0)}
                className="text-2xl sm:text-3xl font-black text-emerald-900 mt-1 w-full text-center bg-amber-50/40 border border-dashed border-amber-300 rounded p-0.5"
              />
            ) : (
              <div className="text-3xl font-black text-emerald-900 mt-1">
                {jumlahDonasiMushaf}
              </div>
            )}

            {isEditMode ? (
              <input
                type="text"
                value={metric1Sub}
                onChange={(e) => setMetric1Sub(e.target.value)}
                className="text-xs text-emerald-700 font-semibold w-full text-center bg-transparent border-b border-dashed border-emerald-300 mt-1"
              />
            ) : (
              <span className="text-xs text-emerald-700 font-semibold">{metric1Sub}</span>
            )}
          </div>

          <div className="bg-blue-50/60 p-4 rounded-2xl border border-blue-200/80 text-center">
            {isEditMode ? (
              <input
                type="text"
                value={metric2Label}
                onChange={(e) => setMetric2Label(e.target.value)}
                className="text-[11px] font-bold text-blue-800 uppercase block w-full text-center bg-transparent border-b border-dashed border-blue-300"
              />
            ) : (
              <span className="text-[11px] font-bold text-blue-800 uppercase block">
                {metric2Label}
              </span>
            )}

            <div className="text-3xl font-black text-blue-950 mt-1">
              {customTableRows.length}
            </div>

            {isEditMode ? (
              <input
                type="text"
                value={metric2Sub}
                onChange={(e) => setMetric2Sub(e.target.value)}
                className="text-xs text-blue-700 font-semibold w-full text-center bg-transparent border-b border-dashed border-blue-300 mt-1"
              />
            ) : (
              <span className="text-xs text-blue-700 font-semibold">{metric2Sub}</span>
            )}
          </div>

          <div className="bg-amber-50/60 p-4 rounded-2xl border border-amber-200/80 text-center">
            {isEditMode ? (
              <input
                type="text"
                value={metric3Label}
                onChange={(e) => setMetric3Label(e.target.value)}
                className="text-[11px] font-bold text-amber-800 uppercase block w-full text-center bg-transparent border-b border-dashed border-amber-300"
              />
            ) : (
              <span className="text-[11px] font-bold text-amber-800 uppercase block">
                {metric3Label}
              </span>
            )}

            {isEditMode ? (
              <input
                type="text"
                value={metric3CustomCount}
                onChange={(e) => setMetric3CustomCount(e.target.value)}
                className="text-2xl sm:text-3xl font-black text-amber-950 mt-1 w-full text-center bg-amber-50/40 border border-dashed border-amber-300 rounded p-0.5"
              />
            ) : (
              <div className="text-3xl font-black text-amber-950 mt-1">
                {metric3CustomCount}
              </div>
            )}

            {isEditMode ? (
              <input
                type="text"
                value={metric3Sub}
                onChange={(e) => setMetric3Sub(e.target.value)}
                className="text-xs text-amber-700 font-semibold w-full text-center bg-transparent border-b border-dashed border-amber-300 mt-1"
              />
            ) : (
              <span className="text-xs text-amber-700 font-semibold">{metric3Sub}</span>
            )}
          </div>
        </div>

        {/* Distribution Locations Table */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-3">
            {isEditMode ? (
              <input
                type="text"
                value={tableTitle}
                onChange={(e) => setTableTitle(e.target.value)}
                className="text-xs font-black uppercase tracking-wider text-slate-700 bg-amber-50/40 border border-dashed border-amber-300 rounded px-2 py-1 flex-1 mr-2"
              />
            ) : (
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center gap-2">
                <Building className="w-4 h-4 text-emerald-700" />
                <span>{tableTitle}</span>
              </h3>
            )}

            {isEditMode && (
              <button
                onClick={handleAddTableRow}
                className="no-print text-xs font-bold text-emerald-700 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100 px-3 py-1 rounded-xl border border-emerald-200 flex items-center gap-1 shadow-2xs"
              >
                <Plus className="w-3.5 h-3.5" /> Tambah Baris
              </button>
            )}
          </div>

          <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-2xs">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
                <tr>
                  <th className="p-3 w-10 text-center">No</th>
                  <th className="p-3">Nama Madrasah / Pesantren</th>
                  <th className="p-3">Wilayah</th>
                  <th className="p-3">Penerima Manfaat</th>
                  <th className="p-3 text-center">Alokasi</th>
                  <th className="p-3 text-center">Status</th>
                  {isEditMode && <th className="no-print p-3 text-center w-12">Aksi</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {customTableRows.map((row, idx) => (
                  <tr key={row.id} className="hover:bg-slate-50/50">
                    <td className="p-3 text-center font-bold text-slate-500">{idx + 1}</td>
                    <td className="p-3 font-bold text-slate-900">
                      {isEditMode ? (
                        <input
                          type="text"
                          value={row.nama}
                          onChange={(e) => handleUpdateTableRow(row.id, 'nama', e.target.value)}
                          className="w-full bg-amber-50/40 border border-dashed border-amber-300 rounded p-1"
                        />
                      ) : (
                        row.nama
                      )}
                    </td>
                    <td className="p-3 text-slate-600">
                      {isEditMode ? (
                        <input
                          type="text"
                          value={row.wilayah}
                          onChange={(e) => handleUpdateTableRow(row.id, 'wilayah', e.target.value)}
                          className="w-full bg-amber-50/40 border border-dashed border-amber-300 rounded p-1"
                        />
                      ) : (
                        row.wilayah
                      )}
                    </td>
                    <td className="p-3 text-slate-600">
                      {isEditMode ? (
                        <input
                          type="text"
                          value={row.penerima}
                          onChange={(e) => handleUpdateTableRow(row.id, 'penerima', e.target.value)}
                          className="w-full bg-amber-50/40 border border-dashed border-amber-300 rounded p-1"
                        />
                      ) : (
                        row.penerima
                      )}
                    </td>
                    <td className="p-3 text-center font-black text-emerald-800">
                      {isEditMode ? (
                        <input
                          type="text"
                          value={row.alokasi}
                          onChange={(e) => handleUpdateTableRow(row.id, 'alokasi', e.target.value)}
                          className="w-20 text-center bg-amber-50/40 border border-dashed border-amber-300 rounded p-1 font-bold text-emerald-800"
                        />
                      ) : (
                        row.alokasi
                      )}
                    </td>
                    <td className="p-3 text-center">
                      {isEditMode ? (
                        <input
                          type="text"
                          value={row.status}
                          onChange={(e) => handleUpdateTableRow(row.id, 'status', e.target.value)}
                          className="w-24 text-center bg-amber-50/40 border border-dashed border-amber-300 rounded p-1 font-bold text-emerald-700"
                        />
                      ) : (
                        <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                          {row.status}
                        </span>
                      )}
                    </td>
                    {isEditMode && (
                      <td className="no-print p-3 text-center">
                        <button
                          onClick={() => handleDeleteTableRow(row.id)}
                          className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                          title="Hapus baris ini"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Documentation Photo Highlights */}
        <div className="mb-8 page-break-inside-avoid">
          <div className="flex justify-between items-center mb-3">
            {isEditMode ? (
              <input
                type="text"
                value={photosTitle}
                onChange={(e) => setPhotosTitle(e.target.value)}
                className="text-xs font-black uppercase tracking-wider text-slate-700 bg-amber-50/40 border border-dashed border-amber-300 rounded px-2 py-1 flex-1 mr-2"
              />
            ) : (
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-emerald-700" />
                <span>{photosTitle}</span>
              </h3>
            )}

            {isEditMode && (
              <button
                onClick={handleAddPhoto}
                className="no-print text-xs font-bold text-emerald-700 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100 px-3 py-1 rounded-xl border border-emerald-200 flex items-center gap-1 shadow-2xs"
              >
                <Plus className="w-3.5 h-3.5" /> Tambah Foto
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {photos.map((photo) => (
              <div key={photo.id} className="rounded-xl overflow-hidden border border-slate-200 shadow-2xs bg-white relative group">
                <img
                  src={photo.url}
                  alt={photo.caption}
                  className="w-full h-32 object-cover"
                  referrerPolicy="no-referrer"
                />

                {/* Upload & Delete Controls in Edit Mode */}
                {isEditMode && (
                  <div className="no-print absolute top-2 right-2 flex items-center gap-1 bg-black/70 p-1 rounded-lg backdrop-blur-xs">
                    <button
                      onClick={() => handlePhotoUploadClick(photo.id)}
                      className="p-1 text-white hover:text-emerald-400 transition-colors"
                      title="Unggah foto baru dari komputer"
                    >
                      <Upload className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeletePhoto(photo.id)}
                      className="p-1 text-white hover:text-red-400 transition-colors"
                      title="Hapus foto ini"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}

                <div className="p-2 text-[10px] text-slate-600 font-medium bg-slate-50">
                  {isEditMode ? (
                    <div className="space-y-1">
                      <input
                        type="text"
                        value={photo.caption}
                        onChange={(e) => handleUpdatePhoto(photo.id, 'caption', e.target.value)}
                        placeholder="Keterangan foto..."
                        className="w-full bg-amber-50/40 border border-dashed border-amber-300 rounded p-1 text-slate-800 font-semibold"
                      />
                      <input
                        type="text"
                        value={photo.url}
                        onChange={(e) => handleUpdatePhoto(photo.id, 'url', e.target.value)}
                        placeholder="URL Gambar (atau klik tombol upload di atas)"
                        className="w-full bg-slate-100 border border-slate-200 rounded p-1 text-[9px] text-slate-500 truncate"
                      />
                    </div>
                  ) : (
                    photo.caption
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Closing Prayer Box */}
        <div className="p-5 rounded-2xl bg-emerald-900 text-white text-center mb-8">
          {isEditMode ? (
            <input
              type="text"
              value={doaArab}
              onChange={(e) => setDoaArab(e.target.value)}
              className="w-full text-center text-xs sm:text-sm font-arabic text-emerald-100 font-medium mb-2 bg-emerald-800/60 border border-dashed border-emerald-500 rounded p-1.5"
            />
          ) : (
            <p className="text-xs sm:text-sm font-arabic text-emerald-100 font-medium leading-relaxed mb-2">
              {doaArab}
            </p>
          )}

          {isEditMode ? (
            <textarea
              value={doaTerjemah}
              onChange={(e) => setDoaTerjemah(e.target.value)}
              rows={2}
              className="w-full text-center text-xs text-emerald-200 font-sans bg-emerald-800/60 border border-dashed border-emerald-500 rounded p-1.5"
            />
          ) : (
            <p className="text-xs text-emerald-200 leading-relaxed font-sans">
              "{doaTerjemah}"
            </p>
          )}
        </div>

        {/* Official Signature Footer */}
        <div className="flex justify-between items-end pt-4 border-t border-slate-200 text-xs text-slate-600">
          <div className="space-y-0.5">
            {isEditMode ? (
              <>
                <input
                  type="text"
                  value={namaLembagaFooter}
                  onChange={(e) => setNamaLembagaFooter(e.target.value)}
                  className="font-bold text-slate-900 bg-amber-50/40 border border-dashed border-amber-300 rounded p-1 w-56 block"
                />
                <input
                  type="text"
                  value={divisiFooter}
                  onChange={(e) => setDivisiFooter(e.target.value)}
                  className="text-[11px] text-slate-500 bg-amber-50/40 border border-dashed border-amber-300 rounded p-1 w-64 block mt-1"
                />
                <input
                  type="text"
                  value={kotaFooter}
                  onChange={(e) => setKotaFooter(e.target.value)}
                  className="text-[10px] text-slate-400 bg-amber-50/40 border border-dashed border-amber-300 rounded p-1 w-48 block mt-1"
                />
              </>
            ) : (
              <>
                <p className="font-bold text-slate-900">{namaLembagaFooter}</p>
                <p className="text-[11px] text-slate-500">{divisiFooter}</p>
                <p className="text-[10px] text-slate-400 mt-0.5">{kotaFooter}</p>
              </>
            )}
          </div>

          <div className="text-right space-y-0.5">
            {isEditMode ? (
              <>
                <input
                  type="text"
                  value={namaPic}
                  onChange={(e) => setNamaPic(e.target.value)}
                  className="font-semibold text-slate-900 text-right bg-amber-50/40 border border-dashed border-amber-300 rounded p-1 w-52 inline-block"
                />
                <input
                  type="text"
                  value={jabatanPic}
                  onChange={(e) => setJabatanPic(e.target.value)}
                  className="text-[11px] text-slate-500 text-right bg-amber-50/40 border border-dashed border-amber-300 rounded p-1 w-64 inline-block mt-1"
                />
              </>
            ) : (
              <>
                <p className="font-semibold">{namaPic}</p>
                <p className="text-[11px] text-slate-500">{jabatanPic}</p>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
