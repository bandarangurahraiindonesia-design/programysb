import React, { useState, useRef } from 'react';
import { 
  X, Printer, Download, CheckCircle2, Copy, Building, 
  User, Calendar, MapPin, Sparkles, FileText, Camera, Upload, Check
} from 'lucide-react';
import { DistributionLocation } from '../types';

interface BastModalProps {
  isOpen: boolean;
  onClose: () => void;
  location: DistributionLocation | null;
  onNotify?: (msg: string) => void;
}

export const BastModal: React.FC<BastModalProps> = ({
  isOpen,
  onClose,
  location,
  onNotify
}) => {
  if (!isOpen || !location) return null;

  // Editable BAST fields
  const [nomorSurat, setNomorSurat] = useState(`042/BAST-YSB/WAKAF-QURAN/${new Date().getFullYear()}`);
  const [tanggalBast, setTanggalBast] = useState(location.tanggal || '15 September 2026');
  const [hariBast, setHariBast] = useState('Rabu');
  
  // Pihak Pertama (Yayasan)
  const [pihak1Nama, setPihak1Nama] = useState(location.pic || 'Ust. Fajar Ramadhan');
  const [pihak1Jabatan, setPihak1Jabatan] = useState('Koordinator Lapangan Divisi Program');
  const [pihak1Instansi, setPihak1Instansi] = useState('Yayasan Sarana Berbagi');

  // Pihak Kedua (Penerima)
  const [pihak2Nama, setPihak2Nama] = useState(`Pimpinan / Pengasuh ${location.nama}`);
  const [pihak2Jabatan, setPihak2Jabatan] = useState('Kepala Lembaga / DKM');
  const [pihak2Instansi, setPihak2Instansi] = useState(location.nama);
  const [pihak2Alamat, setPihak2Alamat] = useState(location.alamat);

  // Barang Serah Terima
  const [jenisMushaf, setJenisMushaf] = useState("Al-Qur'an Rasm Utsmani Standar Kemenag RI (Ukuran A5 Hardcover)");
  const [jumlahMushaf, setJumlahMushaf] = useState(location.jumlahMushaf);
  const [kondisiMushaf, setKondisiMushaf] = useState('100% Baru, Tersegel & Layak Baca');
  const [catatanAkad, setCatatanAkad] = useState('Mushaf wakaf ini diperuntukkan sepenuhnya bagi kegiatan pembinaan tahfidz, tadarus, dan santri penghafal Al-Quran tanpa dipungut biaya.');

  // Foto Dokumentasi Serah Terima (Sample presets + custom upload)
  const defaultPhotos = [
    {
      url: 'https://images.unsplash.com/photo-1609599006353-e629aaabfeae?auto=format&fit=crop&w=600&q=80',
      caption: 'Penyerahan mushaf wakaf Al-Quran kepada pimpinan lembaga'
    },
    {
      url: 'https://images.unsplash.com/photo-1584286595398-a59f21d313f5?auto=format&fit=crop&w=600&q=80',
      caption: 'Santri membaca mushaf Al-Quran di ruang belajar tahfidz'
    }
  ];

  const [photos, setPhotos] = useState<{ url: string; caption: string }[]>(defaultPhotos);
  const [isEditMode, setIsEditMode] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Handle Photo Upload
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        if (reader.result) {
          setPhotos(prev => [
            ...prev,
            {
              url: reader.result as string,
              caption: `Dokumentasi serah terima di ${location.nama}`
            }
          ]);
          if (onNotify) onNotify('Foto dokumentasi penyerahan berhasil ditambahkan ke BAST.');
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Print BAST
  const handlePrint = () => {
    window.print();
  };

  // Copy BAST Text
  const handleCopyText = () => {
    const text = `
BERITA ACARA SERAH TERIMA (BAST) WAKAF AL-QUR'AN
Nomor: ${nomorSurat}

Pada hari ini ${hariBast}, tanggal ${tanggalBast}, bertempat di ${location.nama}, kami yang bertanda tangan di bawah ini:

1. PIHAK PERTAMA (PENYERAH):
   Nama: ${pihak1Nama}
   Jabatan: ${pihak1Jabatan}
   Lembaga: ${pihak1Instansi}

2. PIHAK KEDUA (PENERIMA):
   Nama: ${pihak2Nama}
   Jabatan: ${pihak2Jabatan}
   Lembaga: ${pihak2Instansi}
   Alamat: ${pihak2Alamat}

PIHAK PERTAMA telah menyerahkan kepada PIHAK KEDUA, dan PIHAK KEDUA telah menerima dengan baik:
- Objek: ${jenisMushaf}
- Jumlah: ${jumlahMushaf} Eksemplar
- Kondisi: ${kondisiMushaf}
- Wilayah: ${location.wilayah} (${location.kecamatan})
- Peruntukan: ${location.penerimaManfaat}

Catatan Amanah:
${catatanAkad}

Dibuat dengan sebenar-benarnya untuk dipergunakan sebagaimana mestinya.
    `.trim();

    navigator.clipboard.writeText(text);
    if (onNotify) onNotify('Teks Berita Acara Serah Terima (BAST) berhasil disalin ke clipboard.');
  };

  // Download Word (.doc) BAST
  const handleDownloadDoc = () => {
    const htmlContent = `
      <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
      <head>
        <title>Berita Acara Serah Terima - ${location.nama}</title>
        <style>
          body { font-family: 'Times New Roman', serif; font-size: 12pt; line-height: 1.5; margin: 2cm; }
          .header { text-align: center; border-bottom: 2px solid #000; padding-bottom: 8px; margin-bottom: 16px; }
          .title { font-size: 14pt; font-weight: bold; text-decoration: underline; margin-top: 10px; }
          .subtitle { font-size: 11pt; margin-top: 4px; }
          table { width: 100%; border-collapse: collapse; margin-top: 10px; }
          td { padding: 4px 6px; vertical-align: top; }
          .sig-table { width: 100%; margin-top: 40px; }
          .sig-table td { text-align: center; width: 50%; }
        </style>
      </head>
      <body>
        <div class="header">
          <h2 style="margin:0; font-size: 16pt;">YAYASAN SARANA BERBAGI (YSB)</h2>
          <p style="margin:2px 0; font-size: 10pt;">DIVISI PROGRAM & PENDAYAGUNAAN WAKAF AL-QUR'AN</p>
          <p style="margin:2px 0; font-size: 9pt; color: #555;">SK Kemenkumham RI: AHU-0012458.AH.01.04.Tahun 2021 • Bandung, Jawa Barat</p>
        </div>

        <div style="text-align: center;">
          <div class="title">BERITA ACARA SERAH TERIMA (BAST) WAKAF AL-QUR'AN</div>
          <div class="subtitle">Nomor: ${nomorSurat}</div>
        </div>

        <p style="margin-top: 20px;">
          Pada hari ini <strong>${hariBast}</strong>, tanggal <strong>${tanggalBast}</strong>, bertempat di <strong>${location.nama}</strong>, telah dilaksanakan serah terima mushaf Al-Qur'an wakaf antara:
        </p>

        <table>
          <tr>
            <td width="25"><strong>I.</strong></td>
            <td width="130"><strong>Nama</strong></td>
            <td width="15">:</td>
            <td><strong>${pihak1Nama}</strong></td>
          </tr>
          <tr>
            <td></td>
            <td>Jabatan</td>
            <td>:</td>
            <td>${pihak1Jabatan}</td>
          </tr>
          <tr>
            <td></td>
            <td>Instansi</td>
            <td>:</td>
            <td>${pihak1Instansi}</td>
          </tr>
          <tr>
            <td></td>
            <td colspan="3"><em>Selanjutnya disebut sebagai <strong>PIHAK PERTAMA</strong> (Penyerah Wakaf).</em></td>
          </tr>
          <tr><td colspan="4" height="10"></td></tr>
          <tr>
            <td><strong>II.</strong></td>
            <td><strong>Nama</strong></td>
            <td>:</td>
            <td><strong>${pihak2Nama}</strong></td>
          </tr>
          <tr>
            <td></td>
            <td>Jabatan</td>
            <td>:</td>
            <td>${pihak2Jabatan}</td>
          </tr>
          <tr>
            <td></td>
            <td>Lembaga Penerima</td>
            <td>:</td>
            <td><strong>${pihak2Instansi}</strong></td>
          </tr>
          <tr>
            <td></td>
            <td>Alamat</td>
            <td>:</td>
            <td>${pihak2Alamat} (${location.wilayah})</td>
          </tr>
          <tr>
            <td></td>
            <td colspan="3"><em>Selanjutnya disebut sebagai <strong>PIHAK KEDUA</strong> (Penerima Manfaat).</em></td>
          </tr>
        </table>

        <p style="margin-top: 16px;">
          PIHAK PERTAMA telah menyerahkan secara utuh dan sukarela kepada PIHAK KEDUA barang titipan amanah wakaf berupa:
        </p>

        <table border="1" style="border-color: #333; margin-top: 8px;">
          <tr bgcolor="#f2f2f2">
            <th width="40" style="padding: 6px;">No</th>
            <th style="padding: 6px;">Deskripsi Barang / Spesifikasi</th>
            <th width="100" style="padding: 6px;">Jumlah</th>
            <th width="140" style="padding: 6px;">Kondisi</th>
          </tr>
          <tr>
            <td align="center" style="padding: 6px;">1</td>
            <td style="padding: 6px;">${jenisMushaf}</td>
            <td align="center" style="padding: 6px;"><strong>${jumlahMushaf} Eksemplar</strong></td>
            <td align="center" style="padding: 6px;">${kondisiMushaf}</td>
          </tr>
        </table>

        <p style="margin-top: 14px; font-size: 11pt;">
          <strong>Amanah & Peruntukan:</strong><br/>
          ${catatanAkad}
        </p>

        <table class="sig-table">
          <tr>
            <td>
              PIHAK KEDUA<br/>
              Penerima Manfaat,<br/><br/><br/><br/>
              <strong><u>${pihak2Nama}</u></strong><br/>
              ${pihak2Jabatan}
            </td>
            <td>
              PIHAK PERTAMA<br/>
              Yayasan Sarana Berbagi,<br/><br/><br/><br/>
              <strong><u>${pihak1Nama}</u></strong><br/>
              ${pihak1Jabatan}
            </td>
          </tr>
        </table>
      </body>
      </html>
    `;

    const blob = new Blob([htmlContent], { type: 'application/msword' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `BAST-Wakaf-${location.nama.replace(/\s+/g, '_')}.doc`;
    link.click();
    URL.revokeObjectURL(url);
    if (onNotify) onNotify('Berkas Word (.doc) Berita Acara Serah Terima berhasil diunduh.');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-900/60 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden my-auto">
        
        {/* Modal Top Action Header */}
        <div className="no-print bg-slate-900 text-white px-5 sm:px-7 py-4 flex items-center justify-between gap-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-600 flex items-center justify-center text-white font-bold">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base tracking-tight flex items-center gap-2">
                <span>Berita Acara Serah Terima (BAST)</span>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-mono px-2 py-0.5 rounded-full border border-emerald-500/30">
                  Resmi
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Dokumen serah terima wakaf Al-Qur'an untuk {location.nama}
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => setIsEditMode(!isEditMode)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                isEditMode ? 'bg-amber-500 text-slate-900' : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{isEditMode ? 'Selesai Edit' : 'Edit Isi Surat'}</span>
            </button>

            <button
              onClick={handleCopyText}
              className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5"
              title="Salin Teks BAST"
            >
              <Copy className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Salin Teks</span>
            </button>

            <button
              onClick={handleDownloadDoc}
              className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm"
              title="Unduh format MS Word (.doc)"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Word (.doc)</span>
            </button>

            <button
              onClick={handlePrint}
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-md shadow-emerald-600/30"
              title="Cetak fisik BAST langsung ke mesin printer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Cetak ke Printer</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors ml-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Document Sheet */}
        <div className="overflow-y-auto flex-1 p-6 sm:p-10 bg-slate-100/70">
          <div className="max-w-3xl mx-auto bg-white p-8 sm:p-12 rounded-2xl shadow-md border border-slate-200 text-slate-900 font-sans print:p-0 print:shadow-none print:border-none">
            
            {/* Kop Surat Resmi Yayasan */}
            <div className="border-b-2 border-slate-900 pb-4 mb-6 flex items-center gap-5">
              <div className="w-16 h-16 rounded-2xl bg-emerald-800 text-white font-black text-xl flex items-center justify-center shadow-md flex-shrink-0">
                YSB
              </div>
              <div className="flex-1 text-center pr-10">
                <h1 className="text-xl sm:text-2xl font-black text-emerald-900 tracking-tight uppercase">
                  Yayasan Sarana Berbagi
                </h1>
                <p className="text-xs sm:text-sm font-bold text-slate-700 uppercase tracking-wide">
                  Divisi Program & Pendayagunaan Wakaf Al-Qur'an
                </p>
                <p className="text-[11px] text-slate-500 mt-1">
                  SK Kemenkumham RI: AHU-0012458.AH.01.04.Tahun 2021 • Jl. Terusan Pasirkoja No. 88, Bandung • Email: program@saranaberbagi.org
                </p>
              </div>
            </div>

            {/* Title & Document Number */}
            <div className="text-center mb-6">
              <h2 className="text-base sm:text-lg font-black uppercase text-slate-900 underline decoration-slate-900 underline-offset-4 tracking-wide">
                Berita Acara Serah Terima (BAST) Wakaf Al-Qur'an
              </h2>
              <div className="mt-1 flex items-center justify-center gap-2">
                <span className="text-xs font-semibold text-slate-600">Nomor:</span>
                {isEditMode ? (
                  <input
                    type="text"
                    value={nomorSurat}
                    onChange={(e) => setNomorSurat(e.target.value)}
                    className="border border-emerald-500 rounded px-2 py-0.5 text-xs font-mono text-center w-72"
                  />
                ) : (
                  <span className="text-xs font-mono font-bold text-slate-800">{nomorSurat}</span>
                )}
              </div>
            </div>

            {/* Opening Narrative */}
            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed mb-4">
              Pada hari ini{' '}
              {isEditMode ? (
                <input
                  type="text"
                  value={hariBast}
                  onChange={(e) => setHariBast(e.target.value)}
                  className="border border-emerald-400 rounded px-1.5 py-0.5 text-xs font-bold w-20 inline"
                />
              ) : (
                <strong>{hariBast}</strong>
              )}
              , tanggal{' '}
              {isEditMode ? (
                <input
                  type="text"
                  value={tanggalBast}
                  onChange={(e) => setTanggalBast(e.target.value)}
                  className="border border-emerald-400 rounded px-1.5 py-0.5 text-xs font-bold w-36 inline"
                />
              ) : (
                <strong>{tanggalBast}</strong>
              )}
              , bertempat di <strong>{location.nama}</strong>, telah dilaksanakan serah terima amanah mushaf wakaf Al-Qur'an antara pihak-pihak yang bertanda tangan di bawah ini:
            </p>

            {/* Pihak I & Pihak II Form */}
            <div className="space-y-4 mb-6 text-xs sm:text-sm">
              {/* Pihak Pertama */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/90">
                <div className="font-extrabold text-emerald-800 text-xs uppercase mb-2">
                  1. PIHAK PERTAMA (Yang Menyerahkan):
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <div>
                    <span className="text-[11px] text-slate-500 block">Nama PIC:</span>
                    {isEditMode ? (
                      <input
                        type="text"
                        value={pihak1Nama}
                        onChange={(e) => setPihak1Nama(e.target.value)}
                        className="w-full border border-emerald-400 rounded px-2 py-1 text-xs font-bold"
                      />
                    ) : (
                      <strong className="text-slate-800">{pihak1Nama}</strong>
                    )}
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-500 block">Jabatan:</span>
                    {isEditMode ? (
                      <input
                        type="text"
                        value={pihak1Jabatan}
                        onChange={(e) => setPihak1Jabatan(e.target.value)}
                        className="w-full border border-emerald-400 rounded px-2 py-1 text-xs"
                      />
                    ) : (
                      <span className="text-slate-700">{pihak1Jabatan}</span>
                    )}
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-500 block">Instansi:</span>
                    <span className="text-slate-700 font-semibold">{pihak1Instansi}</span>
                  </div>
                </div>
                <p className="text-[11px] text-slate-500 italic mt-2">
                  Bertindak atas nama Yayasan Sarana Berbagi selaku pengelola program wakaf Al-Qur'an.
                </p>
              </div>

              {/* Pihak Kedua */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/90">
                <div className="font-extrabold text-blue-800 text-xs uppercase mb-2">
                  2. PIHAK KEDUA (Penerima Manfaat):
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <div>
                    <span className="text-[11px] text-slate-500 block">Nama Penerima / PIC:</span>
                    {isEditMode ? (
                      <input
                        type="text"
                        value={pihak2Nama}
                        onChange={(e) => setPihak2Nama(e.target.value)}
                        className="w-full border border-emerald-400 rounded px-2 py-1 text-xs font-bold"
                      />
                    ) : (
                      <strong className="text-slate-800">{pihak2Nama}</strong>
                    )}
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-500 block">Jabatan:</span>
                    {isEditMode ? (
                      <input
                        type="text"
                        value={pihak2Jabatan}
                        onChange={(e) => setPihak2Jabatan(e.target.value)}
                        className="w-full border border-emerald-400 rounded px-2 py-1 text-xs"
                      />
                    ) : (
                      <span className="text-slate-700">{pihak2Jabatan}</span>
                    )}
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-500 block">Lembaga:</span>
                    {isEditMode ? (
                      <input
                        type="text"
                        value={pihak2Instansi}
                        onChange={(e) => setPihak2Instansi(e.target.value)}
                        className="w-full border border-emerald-400 rounded px-2 py-1 text-xs font-bold"
                      />
                    ) : (
                      <span className="text-slate-900 font-bold">{pihak2Instansi}</span>
                    )}
                  </div>
                </div>
                <div className="mt-2 text-[11px] text-slate-600">
                  <span>Alamat: </span>
                  {isEditMode ? (
                    <input
                      type="text"
                      value={pihak2Alamat}
                      onChange={(e) => setPihak2Alamat(e.target.value)}
                      className="w-full border border-emerald-400 rounded px-2 py-1 text-xs mt-1"
                    />
                  ) : (
                    <span>{pihak2Alamat} • {location.kecamatan}, {location.wilayah}</span>
                  )}
                </div>
              </div>
            </div>

            {/* Table of Dispatched Items */}
            <div className="mb-6">
              <p className="text-xs sm:text-sm text-slate-700 mb-2">
                PIHAK PERTAMA telah menyerahkan kepada PIHAK KEDUA, dan PIHAK KEDUA telah memeriksa dan menerima barang berupa:
              </p>

              <div className="border border-slate-300 rounded-xl overflow-hidden">
                <table className="w-full text-xs sm:text-sm text-left">
                  <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-300">
                    <tr>
                      <th className="p-3 w-10 text-center">No</th>
                      <th className="p-3">Uraian / Spesifikasi Mushaf</th>
                      <th className="p-3 w-28 text-center">Jumlah</th>
                      <th className="p-3 w-40 text-center">Kondisi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    <tr>
                      <td className="p-3 text-center font-bold">1</td>
                      <td className="p-3">
                        {isEditMode ? (
                          <input
                            type="text"
                            value={jenisMushaf}
                            onChange={(e) => setJenisMushaf(e.target.value)}
                            className="w-full border border-emerald-400 rounded px-2 py-1 text-xs"
                          />
                        ) : (
                          <div>
                            <strong className="text-slate-900 block">{jenisMushaf}</strong>
                            <span className="text-[11px] text-slate-500">Peruntukan: {location.penerimaManfaat}</span>
                          </div>
                        )}
                      </td>
                      <td className="p-3 text-center font-black text-emerald-800 text-sm">
                        {isEditMode ? (
                          <input
                            type="number"
                            value={jumlahMushaf}
                            onChange={(e) => setJumlahMushaf(Number(e.target.value) || 0)}
                            className="w-20 border border-emerald-400 rounded px-2 py-1 text-xs text-center"
                          />
                        ) : (
                          <span>{jumlahMushaf} Eks.</span>
                        )}
                      </td>
                      <td className="p-3 text-center text-xs font-semibold text-slate-700">
                        {isEditMode ? (
                          <input
                            type="text"
                            value={kondisiMushaf}
                            onChange={(e) => setKondisiMushaf(e.target.value)}
                            className="w-full border border-emerald-400 rounded px-2 py-1 text-xs"
                          />
                        ) : (
                          <span className="inline-flex items-center gap-1 text-emerald-700 bg-emerald-50 px-2 py-1 rounded-md">
                            <Check className="w-3 h-3" /> {kondisiMushaf}
                          </span>
                        )}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Amanah & Peruntukan Note */}
            <div className="mb-8 p-3.5 bg-emerald-50/60 border border-emerald-200 rounded-xl text-xs text-emerald-950">
              <strong className="block font-bold mb-1">Amanah & Ketentuan Wakaf:</strong>
              {isEditMode ? (
                <textarea
                  value={catatanAkad}
                  onChange={(e) => setCatatanAkad(e.target.value)}
                  rows={2}
                  className="w-full border border-emerald-400 rounded p-2 text-xs"
                />
              ) : (
                <p className="leading-relaxed">{catatanAkad}</p>
              )}
            </div>

            {/* Foto Dokumentasi Penyerahan (Included in Print & Export) */}
            <div className="mb-10 page-break-inside-avoid">
              <div className="flex justify-between items-center mb-3">
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                  <Camera className="w-4 h-4 text-emerald-700" />
                  <span>Lampiran Dokumentasi Serah Terima Lapangan</span>
                </h4>
                
                <div className="no-print flex items-center gap-2">
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="text-[11px] font-bold text-emerald-700 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100 px-2.5 py-1 rounded-lg border border-emerald-200 transition-all flex items-center gap-1"
                  >
                    <Upload className="w-3 h-3" />
                    <span>Upload Foto Baru</span>
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    className="hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {photos.map((p, idx) => (
                  <div key={idx} className="rounded-xl overflow-hidden border border-slate-200 shadow-2xs bg-slate-50">
                    <img
                      src={p.url}
                      alt={p.caption}
                      className="w-full h-36 sm:h-44 object-cover"
                      referrerPolicy="no-referrer"
                    />
                    <div className="p-2 text-[10px] sm:text-xs text-slate-600 italic bg-white border-t border-slate-100">
                      Foto {idx + 1}: {p.caption}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Signature Block (Two Parties with Official Seal representation) */}
            <div className="grid grid-cols-2 gap-8 text-xs sm:text-sm text-center pt-4 border-t border-slate-200 page-break-inside-avoid">
              <div>
                <p className="text-slate-600">PIHAK KEDUA,</p>
                <p className="text-slate-800 font-bold mb-16">{pihak2Instansi}</p>
                <div className="border-t border-slate-800 w-48 mx-auto pt-1 font-extrabold text-slate-900">
                  ( {pihak2Nama} )
                </div>
                <p className="text-[11px] text-slate-500 mt-0.5">{pihak2Jabatan}</p>
              </div>

              <div>
                <p className="text-slate-600">PIHAK PERTAMA,</p>
                <p className="text-slate-800 font-bold mb-16">Yayasan Sarana Berbagi</p>
                <div className="border-t border-slate-800 w-48 mx-auto pt-1 font-extrabold text-slate-900">
                  ( {pihak1Nama} )
                </div>
                <p className="text-[11px] text-slate-500 mt-0.5">{pihak1Jabatan}</p>
              </div>
            </div>

            {/* Official Validation Stamp Footer */}
            <div className="mt-8 pt-4 border-t border-slate-100 text-center text-[10px] text-slate-400">
              Dokumen ini diterbitkan secara resmi melalui Sistem Informasi Manajemen Program FlexiReport • Yayasan Sarana Berbagi
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
