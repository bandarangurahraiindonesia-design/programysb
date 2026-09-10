import { YearlyPlans, DistributionLocation, FullReportData } from '../types';

export const INITIAL_YEARLY_PLANS: YearlyPlans = {
  "Januari": {
    focus: "Evaluasi Tahunan 2025 & Penyusunan Anggaran Program 2026",
    targetMushaf: 250,
    realisasiMushaf: 260,
    status: "Selesai",
    funding: [
      { id: "f-jan-1", no: 1, tanggal: "6-7 Januari 2026", pekan: "MINGGU KE 1", program: "AL-QUR'AN REGULER", targetMushaf: 60, status: "Selesai", pic: "Ust. Rahmat" },
      { id: "f-jan-2", no: 2, tanggal: "13-14 Januari 2026", pekan: "MINGGU KE 2", program: "AL-QUR'AN PELOSOK", targetMushaf: 70, status: "Selesai", pic: "Ust. Fajar" },
      { id: "f-jan-3", no: 3, tanggal: "20-21 Januari 2026", pekan: "MINGGU KE 3", program: "AL-QUR'AN & IQRA", targetMushaf: 60, status: "Selesai", pic: "Ust. Rahmat" },
      { id: "f-jan-4", no: 4, tanggal: "27-28 Januari 2026", pekan: "MINGGU KE 4", program: "WAKAF AL-QUR'AN BINA SANTRI", targetMushaf: 70, status: "Selesai", pic: "Ustzh. Aisyah" }
    ],
    progress: [
      { id: "p-jan-1", no: 1, tanggal: "3 Januari 2026", pekan: "MINGGU KE 1", keterangan: "Evaluasi laporan keuangan tahun lalu dan verifikasi database donatur", lokasi: "Kantor Pusat", status: "Selesai" },
      { id: "p-jan-2", no: 2, tanggal: "10 Januari 2026", pekan: "MINGGU KE 2", keterangan: "Audit data penerima manfaat wilayah Priangan Timur", lokasi: "Garut & Tasikmalaya", status: "Selesai" },
      { id: "p-jan-3", no: 3, tanggal: "17 Januari 2026", pekan: "MINGGU KE 3", keterangan: "Review kurikulum tahfidz dan kebutuhan mushaf santri binaan", lokasi: "Bandung", status: "Selesai" },
      { id: "p-jan-4", no: 4, tanggal: "24 Januari 2026", pekan: "MINGGU KE 4", keterangan: "Penyusunan Rencana Anggaran Biaya (RAB) Program 2026", lokasi: "Kantor Pusat", status: "Selesai" }
    ],
    evaluasi: "Capaian target 104% berkat antusiasme donatur awal tahun. Alur pencatatan berjalan lancar."
  },
  "Februari": {
    focus: "Perluasan Wilayah Perdesaan & Penguatan Jaringan Komunitas",
    targetMushaf: 300,
    realisasiMushaf: 310,
    status: "Selesai",
    funding: [
      { id: "f-feb-1", no: 1, tanggal: "3-4 Februari 2026", pekan: "MINGGU KE 1", program: "AL-QUR'AN & TERJEMAH", targetMushaf: 75, status: "Selesai", pic: "Ust. Fajar" },
      { id: "f-feb-2", no: 2, tanggal: "10-11 Februari 2026", pekan: "MINGGU KE 2", program: "AL-QUR'AN & IQRA PEMULA", targetMushaf: 80, status: "Selesai", pic: "Ust. Rahmat" },
      { id: "f-feb-3", no: 3, tanggal: "17-18 Februari 2026", pekan: "MINGGU KE 3", program: "AL-QUR'AN HAFALAN TIKRAR", targetMushaf: 75, status: "Selesai", pic: "Ustzh. Aisyah" },
      { id: "f-feb-4", no: 4, tanggal: "24-25 Februari 2026", pekan: "MINGGU KE 4", program: "WAKAF AL-QUR'AN LANSIA", targetMushaf: 80, status: "Selesai", pic: "Ust. Fajar" }
    ],
    progress: [
      { id: "p-feb-1", no: 1, tanggal: "3 Februari 2026", pekan: "MINGGU KE 1", keterangan: "Progres Madrasah Nurul Iman, Kec. Pangalengan", lokasi: "Kab. Bandung", status: "Selesai" },
      { id: "p-feb-2", no: 2, tanggal: "10 Februari 2026", pekan: "MINGGU KE 2", keterangan: "Monitoring distribusi tahap 1 dan pendataan mushaf rusak", lokasi: "Kab. Bandung Barat", status: "Selesai" },
      { id: "p-feb-3", no: 3, tanggal: "17 Februari 2026", pekan: "MINGGU KE 3", keterangan: "Kajian rutin bulanan bersama asatidz wilayah selatan", lokasi: "Soreang", status: "Selesai" },
      { id: "p-feb-4", no: 4, tanggal: "24 Februari 2026", pekan: "MINGGU KE 4", keterangan: "Penyusunan laporan bulanan Februari & persiapan pra-Ramadhan", lokasi: "Kantor Pusat", status: "Selesai" }
    ],
    evaluasi: "Distribusi ke Pangalengan terlaksana tepat waktu dengan respon antusias santri setempat."
  },
  "Maret": {
    focus: "Persiapan Semarak Ramadhan & Ekspedisi Penyaluran Khusus",
    targetMushaf: 500,
    realisasiMushaf: 540,
    status: "Selesai",
    funding: [
      { id: "f-mar-1", no: 1, tanggal: "3-4 Maret 2026", pekan: "MINGGU KE 1", program: "AL-QUR'AN RAMADHAN BERKAH", targetMushaf: 130, status: "Selesai", pic: "Ust. Rahmat" },
      { id: "f-mar-2", no: 2, tanggal: "10-11 Maret 2026", pekan: "MINGGU KE 2", program: "AL-QUR'AN TAHFIDZ SANTRI", targetMushaf: 140, status: "Selesai", pic: "Ust. Fajar" },
      { id: "f-mar-3", no: 3, tanggal: "17-18 Maret 2026", pekan: "MINGGU KE 3", program: "PAKET MUKENA & AL-QUR'AN IBU-IBU", targetMushaf: 130, status: "Selesai", pic: "Ustzh. Aisyah" },
      { id: "f-mar-4", no: 4, tanggal: "24-25 Maret 2026", pekan: "MINGGU KE 4", program: "AL-QUR'AN BRAILLE & ISYARAT", targetMushaf: 140, status: "Selesai", pic: "Ust. Rahmat" }
    ],
    progress: [
      { id: "p-mar-1", no: 1, tanggal: "3 Maret 2026", pekan: "MINGGU KE 1", keterangan: "Cek kesiapan armada & packing logistik jelang Ramadhan", lokasi: "Gudang Logistik", status: "Selesai" },
      { id: "p-mar-2", no: 2, tanggal: "10 Maret 2026", pekan: "MINGGU KE 2", keterangan: "Progres Pesantren Al-Ittihad dan 4 TPA mitra, Cianjur", lokasi: "Cianjur", status: "Selesai" },
      { id: "p-mar-3", no: 3, tanggal: "17 Maret 2026", pekan: "MINGGU KE 3", keterangan: "Distribusi santunan Ramadhan dan paket buka puasa santri", lokasi: "Garut Selatan", status: "Selesai" },
      { id: "p-mar-4", no: 4, tanggal: "24 Maret 2026", pekan: "MINGGU KE 4", keterangan: "Evaluasi penyaluran khusus malam Nuzulul Qur'an", lokasi: "Bandung", status: "Selesai" }
    ],
    evaluasi: "Bulan dengan capaian tertinggi sepanjang semester I berkat sinergi kampanye Ramadhan."
  },
  "April": {
    focus: "Evaluasi Pasca Ramadhan, Rekonsiliasi Donasi & Pemulihan Stok",
    targetMushaf: 200,
    realisasiMushaf: 215,
    status: "Selesai",
    funding: [
      { id: "f-apr-1", no: 1, tanggal: "7-8 April 2026", pekan: "MINGGU KE 1", program: "AL-QUR'AN SYAWAL BERKAH", targetMushaf: 50, status: "Selesai", pic: "Ust. Fajar" },
      { id: "f-apr-2", no: 2, tanggal: "14-15 April 2026", pekan: "MINGGU KE 2", program: "AL-QUR'AN PEMBINAAN MUALAF", targetMushaf: 55, status: "Selesai", pic: "Ustzh. Aisyah" },
      { id: "f-apr-3", no: 3, tanggal: "21-22 April 2026", pekan: "MINGGU KE 3", program: "AL-QUR'AN SAKU MUSAFIR", targetMushaf: 50, status: "Selesai", pic: "Ust. Rahmat" },
      { id: "f-apr-4", no: 4, tanggal: "28-29 April 2026", pekan: "MINGGU KE 4", program: "WAKAF MUSHAF MADRASAH DINIYAH", targetMushaf: 60, status: "Selesai", pic: "Ust. Fajar" }
    ],
    progress: [
      { id: "p-apr-1", no: 1, tanggal: "7 April 2026", pekan: "MINGGU KE 1", keterangan: "Rekapitulasi donasi pasca Idul Fitri & pengiriman ucapan terima kasih", lokasi: "Kantor Pusat", status: "Selesai" },
      { id: "p-apr-2", no: 2, tanggal: "14 April 2026", pekan: "MINGGU KE 2", keterangan: "Monitoring Madrasah Miftahul Huda, Kp. Sukamaju, Garut", lokasi: "Garut", status: "Selesai" },
      { id: "p-apr-3", no: 3, tanggal: "21 April 2026", pekan: "MINGGU KE 3", keterangan: "Evaluasi internal bulanan divisi program & operasional", lokasi: "Kantor Pusat", status: "Selesai" },
      { id: "p-apr-4", no: 4, tanggal: "28 April 2026", pekan: "MINGGU KE 4", keterangan: "Persiapan program pemberdayaan bulan Mei & restok gudang", lokasi: "Gudang Logistik", status: "Selesai" }
    ],
    evaluasi: "Kondisi pasca lebaran berjalan kondusif. Pengiriman sertifikat wakaf digital mencapai 98%."
  },
  "Mei": {
    focus: "Penguatan Kemitraan Madrasah Diniyah & TPA Mandiri",
    targetMushaf: 300,
    realisasiMushaf: 305,
    status: "Selesai",
    funding: [
      { id: "f-mei-1", no: 1, tanggal: "5-6 Mei 2026", pekan: "MINGGU KE 1", program: "AL-QUR'AN SANTRI DUAFA", targetMushaf: 75, status: "Selesai", pic: "Ust. Rahmat" },
      { id: "f-mei-2", no: 2, tanggal: "12-13 Mei 2026", pekan: "MINGGU KE 2", program: "AL-QUR'AN & BUKU TAJWID PRAKTIS", targetMushaf: 75, status: "Selesai", pic: "Ustzh. Aisyah" },
      { id: "f-mei-3", no: 3, tanggal: "19-20 Mei 2026", pekan: "MINGGU KE 3", program: "WAKAF AL-QUR'AN MASJID PELOSOK", targetMushaf: 75, status: "Selesai", pic: "Ust. Fajar" },
      { id: "f-mei-4", no: 4, tanggal: "26-27 Mei 2026", pekan: "MINGGU KE 4", program: "AL-QUR'AN GENERASI CINTA ISLAM", targetMushaf: 80, status: "Selesai", pic: "Ust. Rahmat" }
    ],
    progress: [
      { id: "p-mei-1", no: 1, tanggal: "5 Mei 2026", pekan: "MINGGU KE 1", keterangan: "Kunjungan kerja dan MoU dengan 6 mitra madrasah Bandung Barat", lokasi: "Padalarang", status: "Selesai" },
      { id: "p-mei-2", no: 2, tanggal: "12 Mei 2026", pekan: "MINGGU KE 2", keterangan: "Progres Madrasah Ash-Shiddiq, Kec. Cikalongwetan", lokasi: "Bandung Barat", status: "Selesai" },
      { id: "p-mei-3", no: 3, tanggal: "19 Mei 2026", pekan: "MINGGU KE 3", keterangan: "Audit berkala kondisi mushaf di 10 masjid binaan", lokasi: "Cianjur", status: "Selesai" },
      { id: "p-mei-4", no: 4, tanggal: "26 Mei 2026", pekan: "MINGGU KE 4", keterangan: "Finalisasi laporan kinerja program bulan Mei 2026", lokasi: "Kantor Pusat", status: "Selesai" }
    ],
    evaluasi: "Sinergi madrasah diniyah semakin kuat dengan penandatanganan komitmen bersama."
  },
  "Juni": {
    focus: "Distribusi Penutup Semester I & Audit Data Penerima Manfaat",
    targetMushaf: 350,
    realisasiMushaf: 360,
    status: "Selesai",
    funding: [
      { id: "f-jun-1", no: 1, tanggal: "2-3 Juni 2026", pekan: "MINGGU KE 1", program: "AL-QUR'AN AKHIR SEMESTER", targetMushaf: 85, status: "Selesai", pic: "Ust. Fajar" },
      { id: "f-jun-2", no: 2, tanggal: "9-10 Juni 2026", pekan: "MINGGU KE 2", program: "AL-QUR'AN TAHSIN DEWASA", targetMushaf: 90, status: "Selesai", pic: "Ust. Rahmat" },
      { id: "f-jun-3", no: 3, tanggal: "16-17 Juni 2026", pekan: "MINGGU KE 3", program: "AL-QUR'AN QURBAN & BERKAH", targetMushaf: 85, status: "Selesai", pic: "Ustzh. Aisyah" },
      { id: "f-jun-4", no: 4, tanggal: "23-24 Juni 2026", pekan: "MINGGU KE 4", program: "AL-QUR'AN ASRAMA YATIM", targetMushaf: 100, status: "Selesai", pic: "Ust. Fajar" }
    ],
    progress: [
      { id: "p-jun-1", no: 1, tanggal: "2 Juni 2026", pekan: "MINGGU KE 1", keterangan: "Persiapan audit data penyaluran semester I tahun 2026", lokasi: "Kantor Pusat", status: "Selesai" },
      { id: "p-jun-2", no: 2, tanggal: "9 Juni 2026", pekan: "MINGGU KE 2", keterangan: "Progres TPA Darul Ulum & pengecekan fasilitas belajar", lokasi: "Purwakarta & KBB", status: "Selesai" },
      { id: "p-jun-3", no: 3, tanggal: "16 Juni 2026", pekan: "MINGGU KE 3", keterangan: "Validasi data penerima manfaat dan dokumentasi video testimoni", lokasi: "Sukabumi", status: "Selesai" },
      { id: "p-jun-4", no: 4, tanggal: "30 Juni 2026", pekan: "MINGGU KE 5", keterangan: "Audit menyeluruh semester I 2026 dan rapat pimpinan", lokasi: "Kantor Pusat", status: "Selesai" }
    ],
    evaluasi: "Semester I ditutup dengan pencapaian 1.985 mushaf (104.5% dari target semester I)."
  },
  "Juli": {
    focus: "Tahun Ajaran Baru & Program 'Al-Qur'an Masuk Sekolah/Pesantren'",
    targetMushaf: 400,
    realisasiMushaf: 410,
    status: "Selesai",
    funding: [
      { id: "f-jul-1", no: 1, tanggal: "7-8 Juli 2026", pekan: "MINGGU KE 1", program: "PAKET PELAJAR AL-QUR'AN", targetMushaf: 100, status: "Selesai", pic: "Ust. Rahmat" },
      { id: "f-jul-2", no: 2, tanggal: "14-15 Juli 2026", pekan: "MINGGU KE 2", program: "AL-QUR'AN SANTRI BARU PESANTREN", targetMushaf: 100, status: "Selesai", pic: "Ust. Fajar" },
      { id: "f-jul-3", no: 3, tanggal: "21-22 Juli 2026", pekan: "MINGGU KE 3", program: "AL-QUR'AN & IQRA SEKOLAH DASAR", targetMushaf: 100, status: "Selesai", pic: "Ustzh. Aisyah" },
      { id: "f-jul-4", no: 4, tanggal: "28-29 Juli 2026", pekan: "MINGGU KE 4", program: "WAKAF PENDIDIKAN TAHFIDZ", targetMushaf: 110, status: "Selesai", pic: "Ust. Rahmat" }
    ],
    progress: [
      { id: "p-jul-1", no: 1, tanggal: "7 Juli 2026", pekan: "MINGGU KE 1", keterangan: "Monitoring penyaluran awal tahun ajaran baru serentak", lokasi: "Bandung Raya", status: "Selesai" },
      { id: "p-jul-2", no: 2, tanggal: "14 Juli 2026", pekan: "MINGGU KE 2", keterangan: "Progres SDIT Al-Madinah & penyerahan 60 paket mushaf", lokasi: "Kota Bandung", status: "Selesai" },
      { id: "p-jul-3", no: 3, tanggal: "21 Juli 2026", pekan: "MINGGU KE 3", keterangan: "Sambut santri baru mitra binaan dan bimbingan tahsin awal", lokasi: "Kab. Bandung", status: "Selesai" },
      { id: "p-jul-4", no: 4, tanggal: "28 Juli 2026", pekan: "MINGGU KE 4", keterangan: "Evaluasi awal tahun ajaran dan penyusunan logistik Agustus", lokasi: "Kantor Pusat", status: "Selesai" }
    ],
    evaluasi: "Permintaan mushaf santri baru melonjak tinggi; seluruh target tersalurkan tuntas."
  },
  "Agustus": {
    focus: "Penyaluran 350 Mushaf di 5 Wilayah & Semarak Kemerdekaan",
    targetMushaf: 350,
    realisasiMushaf: 350,
    status: "Selesai",
    funding: [
      { id: "f-agu-1", no: 1, tanggal: "6-7 Agustus 2026", pekan: "MINGGU KE 1", program: "AL-QUR'AN", targetMushaf: 85, status: "Selesai", pic: "Ust. Fajar" },
      { id: "f-agu-2", no: 2, tanggal: "13-14 Agustus 2026", pekan: "MINGGU KE 2", program: "AL-QUR'AN", targetMushaf: 85, status: "Selesai", pic: "Ust. Rahmat" },
      { id: "f-agu-3", no: 3, tanggal: "20-21 Agustus 2026", pekan: "MINGGU KE 3", program: "AL-QUR'AN", targetMushaf: 90, status: "Selesai", pic: "Ustzh. Aisyah" },
      { id: "f-agu-4", no: 4, tanggal: "27-28 Agustus 2026", pekan: "MINGGU KE 4", program: "AL-QUR'AN", targetMushaf: 90, status: "Selesai", pic: "Ust. Fajar" }
    ],
    progress: [
      { id: "p-agu-1", no: 1, tanggal: "3 Agustus 2026", pekan: "MINGGU KE 1", keterangan: "Progres Al-Amanah, Tegalluar, Kab. Bandung", lokasi: "Tegalluar, Kab. Bandung", status: "Selesai" },
      { id: "p-agu-2", no: 2, tanggal: "10 Agustus 2026", pekan: "MINGGU KE 2", keterangan: "Laporan Progres Madrasah Diniyah Baitur Rahman, Kp. Margalaksana", lokasi: "Margalaksana", status: "Selesai" },
      { id: "p-agu-3", no: 3, tanggal: "17 Agustus 2026", pekan: "MINGGU KE 3", keterangan: "KHAZANAH ISLAM & Khataman Al-Qur'an Kemerdekaan", lokasi: "Kantor Pusat", status: "Selesai" },
      { id: "p-agu-4", no: 4, tanggal: "24 Agustus 2026", pekan: "MINGGU KE 4", keterangan: "Laporan Progres Madrasah Al-Ittifaq Rancabali", lokasi: "Rancabali, Ciwidey", status: "Selesai" },
      { id: "p-agu-5", no: 5, tanggal: "31 Agustus 2026", pekan: "MINGGU KE 5", keterangan: "Laporan Progres Madrasah Diniyah Alhafizh, Jl. Sapan Rancakaso", lokasi: "Sapan Rancakaso", status: "Selesai" }
    ],
    evaluasi: "Berhasil menjangkau 12 titik madrasah dan pesantren di 5 kabupaten/kota dengan tepat sasaran."
  },
  "September": {
    focus: "Penguatan alur kerja program melalui funding, monitoring progres, persiapan penyaluran, dokumentasi, dan pembaruan database penerima.",
    targetMushaf: 400,
    realisasiMushaf: 280,
    status: "Berjalan (Aktif)",
    funding: [
      { id: "f-sep-1", no: 1, tanggal: "3-4 September 2026", pekan: "MINGGU KE 1", program: "AL-QUR'AN PELOSOK PRIANGAN", targetMushaf: 100, status: "Selesai", pic: "Ust. Fajar" },
      { id: "f-sep-2", no: 2, tanggal: "10-11 September 2026", pekan: "MINGGU KE 2", program: "AL-QUR'AN SANTRI DUAFA", targetMushaf: 100, status: "Berjalan", pic: "Ust. Rahmat" },
      { id: "f-sep-3", no: 3, tanggal: "17-18 September 2026", pekan: "MINGGU KE 3", program: "AL-QUR'AN TAHFIDZ & IQRA", targetMushaf: 100, status: "Rencana", pic: "Ustzh. Aisyah" },
      { id: "f-sep-4", no: 4, tanggal: "24-25 September 2026", pekan: "MINGGU KE 4", program: "WAKAF MUSHAF MADRASAH BINAAN", targetMushaf: 100, status: "Rencana", pic: "Ust. Fajar" }
    ],
    progress: [
      { id: "p-sep-1", no: 1, tanggal: "7 September 2026", pekan: "MINGGU KE 1", keterangan: "Laporan Progres Al-Qur'an Hidayatulfalah, Kampung Baru Kai, Garut", lokasi: "Garut", status: "Selesai" },
      { id: "p-sep-2", no: 2, tanggal: "14 September 2026", pekan: "MINGGU KE 2", keterangan: "Doa bersama awal Rabiul Akhir & pengemasan 100 mushaf tahap 2", lokasi: "Kantor Pusat", status: "Dalam Proses" },
      { id: "p-sep-3", no: 3, tanggal: "21 September 2026", pekan: "MINGGU KE 3", keterangan: "Laporan Progres Al-Qur'an Madrasah Nurul Huda & TPA Al-Kautsar", lokasi: "Cianjur", status: "Pending" },
      { id: "p-sep-4", no: 4, tanggal: "28 September 2026", pekan: "MINGGU KE 4", keterangan: "Laporan Progres Al-Qur'an & Rapat Pleno Evaluasi Kuartal III", lokasi: "Kantor Pusat", status: "Pending" }
    ],
    evaluasi: "Bulan aktif berjalan lancar. Koordinasi tim lapangan Garut & Cianjur menunjukkan kesiapan 100%."
  },
  "Oktober": {
    focus: "Peningkatan Kapasitas Guru Ngaji & TPA Wilayah Pelosok",
    targetMushaf: 300,
    realisasiMushaf: 0,
    status: "Perencanaan",
    funding: [
      { id: "f-okt-1", no: 1, tanggal: "7-8 Oktober 2026", pekan: "MINGGU KE 1", program: "PELATIHAN TAHSIN & AL-QUR'AN", targetMushaf: 75, status: "Rencana", pic: "Ust. Rahmat" },
      { id: "f-okt-2", no: 2, tanggal: "14-15 Oktober 2026", pekan: "MINGGU KE 2", program: "AL-QUR'AN GURU NGAJI", targetMushaf: 75, status: "Rencana", pic: "Ustzh. Aisyah" },
      { id: "f-okt-3", no: 3, tanggal: "21-22 Oktober 2026", pekan: "MINGGU KE 3", program: "KITAB KUNING & AL-QUR'AN", targetMushaf: 75, status: "Rencana", pic: "Ust. Fajar" },
      { id: "f-okt-4", no: 4, tanggal: "28-29 Oktober 2026", pekan: "MINGGU KE 4", program: "WAKAF MUSHAF ASATIDZ", targetMushaf: 75, status: "Rencana", pic: "Ust. Rahmat" }
    ],
    progress: [
      { id: "p-okt-1", no: 1, tanggal: "7 Oktober 2026", pekan: "MINGGU KE 1", keterangan: "Persiapan Gedung Dakwah & pendaftaran 50 ustadz/ustadzah", lokasi: "Soreang, Kab. Bandung", status: "Pending" },
      { id: "p-okt-2", no: 2, tanggal: "14 Oktober 2026", pekan: "MINGGU KE 2", keterangan: "Pelaksanaan workshop sertifikasi metode tilawati dan tahsin", lokasi: "Gedung Dakwah", status: "Pending" },
      { id: "p-okt-3", no: 3, tanggal: "21 Oktober 2026", pekan: "MINGGU KE 3", keterangan: "Monitoring hasil pelatihan dan distribusi kit mengajar di Cianjur", lokasi: "Cianjur", status: "Pending" },
      { id: "p-okt-4", no: 4, tanggal: "28 Oktober 2026", pekan: "MINGGU KE 4", keterangan: "Penyusunan laporan bulanan Oktober & data asatidz binaan", lokasi: "Kantor Pusat", status: "Pending" }
    ],
    evaluasi: "Tahap koordinasi lokasi pelatihan dan materi sertifikasi guru ngaji sedang disiapkan."
  },
  "November": {
    focus: "Ekspedisi Terpencil Sukabumi Selatan & Perbatasan Cianjur",
    targetMushaf: 350,
    realisasiMushaf: 0,
    status: "Perencanaan",
    funding: [
      { id: "f-nov-1", no: 1, tanggal: "4-5 November 2026", pekan: "MINGGU KE 1", program: "AL-QUR'AN PELOSOK SELATAN", targetMushaf: 85, status: "Rencana", pic: "Ust. Fajar" },
      { id: "f-nov-2", no: 2, tanggal: "11-12 November 2026", pekan: "MINGGU KE 2", program: "AL-QUR'AN DUAFA PESISIR", targetMushaf: 90, status: "Rencana", pic: "Ust. Rahmat" },
      { id: "f-nov-3", no: 3, tanggal: "18-19 November 2026", pekan: "MINGGU KE 3", program: "SARANA IBADAH & AL-QUR'AN", targetMushaf: 85, status: "Rencana", pic: "Ustzh. Aisyah" },
      { id: "f-nov-4", no: 4, tanggal: "25-26 November 2026", pekan: "MINGGU KE 4", program: "WAKAF AL-QUR'AN BINA DESA", targetMushaf: 90, status: "Rencana", pic: "Ust. Fajar" }
    ],
    progress: [
      { id: "p-nov-1", no: 1, tanggal: "4 November 2026", pekan: "MINGGU KE 1", keterangan: "Survei jalur distribusi jalan berlumpur Kec. Cisolok & Cikakak", lokasi: "Sukabumi Selatan", status: "Pending" },
      { id: "p-nov-2", no: 2, tanggal: "11 November 2026", pekan: "MINGGU KE 2", keterangan: "Penyaluran 120 mushaf wilayah pesisir & perkampungan nelayan", lokasi: "Palabuhanratu", status: "Pending" },
      { id: "p-nov-3", no: 3, tanggal: "18 November 2026", pekan: "MINGGU KE 3", keterangan: "Kunjungan lapangan madrasah terpencil Kec. Agrabinta", lokasi: "Cianjur Selatan", status: "Pending" },
      { id: "p-nov-4", no: 4, tanggal: "25 November 2026", pekan: "MINGGU KE 4", keterangan: "Evaluasi keselamatan dan ketahanan logistik musim penghujan", lokasi: "Kantor Pusat", status: "Pending" }
    ],
    evaluasi: "Memerlukan armada penggerak 4x4 untuk mengantisipasi jalur licin saat hujan."
  },
  "Desember": {
    focus: "Laporan Akhir Tahun, Baksos Akbar & Evaluasi Menyeluruh 2026",
    targetMushaf: 300,
    realisasiMushaf: 0,
    status: "Perencanaan",
    funding: [
      { id: "f-des-1", no: 1, tanggal: "2-3 Desember 2026", pekan: "MINGGU KE 1", program: "BAKSOS AL-QUR'AN AKHIR TAHUN", targetMushaf: 75, status: "Rencana", pic: "Ust. Rahmat" },
      { id: "f-des-2", no: 2, tanggal: "9-10 Desember 2026", pekan: "MINGGU KE 2", program: "AL-QUR'AN PEDULI DIFABEL", targetMushaf: 75, status: "Rencana", pic: "Ustzh. Aisyah" },
      { id: "f-des-3", no: 3, tanggal: "16-17 Desember 2026", pekan: "MINGGU KE 3", program: "AL-QUR'AN WAKAF ABADI", targetMushaf: 75, status: "Rencana", pic: "Ust. Fajar" },
      { id: "f-des-4", no: 4, tanggal: "23-24 Desember 2026", pekan: "MINGGU KE 4", program: "SEMARAK AL-QUR'AN YATIM", targetMushaf: 75, status: "Rencana", pic: "Ust. Rahmat" }
    ],
    progress: [
      { id: "p-des-1", no: 1, tanggal: "2 Desember 2026", pekan: "MINGGU KE 1", keterangan: "Penyusunan draf awal Laporan Akuntabilitas Kinerja Divisi Program", lokasi: "Kantor Pusat", status: "Pending" },
      { id: "p-des-2", no: 2, tanggal: "9 Desember 2026", pekan: "MINGGU KE 2", keterangan: "Penyaluran serentak panti asuhan & madrasah mitra se-Bandung Raya", lokasi: "Kota & Kab. Bandung", status: "Pending" },
      { id: "p-des-3", no: 3, tanggal: "16 Desember 2026", pekan: "MINGGU KE 3", keterangan: "Rapat Pleno Akhir Tahun bersama Pembina & Pengurus Yayasan", lokasi: "Aula Yayasan", status: "Pending" },
      { id: "p-des-4", no: 4, tanggal: "30 Desember 2026", pekan: "MINGGU KE 5", keterangan: "Finalisasi arsip program tahun 2026 dan serah terima buku laporan", lokasi: "Kantor Pusat", status: "Pending" }
    ],
    evaluasi: "Persiapan tutup buku dan pertanggungjawaban kepada seluruh wakif dan donatur."
  }
};

export const INITIAL_LOCATIONS: DistributionLocation[] = [
  {
    id: "loc-1",
    nama: "Madrasah Al-Ittifaq",
    wilayah: "Kab. Bandung",
    kecamatan: "Rancabali",
    alamat: "Jl. Raya Ciwidey - Patengan KM 7, Alamendah",
    jumlahMushaf: 45,
    status: "Tersalurkan",
    tanggal: "24 Agustus 2026",
    pic: "Ust. Fajar",
    penerimaManfaat: "75 Santri Tahfidz",
    lat: -7.140,
    lng: 107.410
  },
  {
    id: "loc-2",
    nama: "Madrasah Hidayatulfalah",
    wilayah: "Garut",
    kecamatan: "Tarogong Kidul",
    alamat: "Kampung Baru Kai, RT 03/05, Desa Jayawaras",
    jumlahMushaf: 50,
    status: "Tersalurkan",
    tanggal: "7 September 2026",
    pic: "Ust. Rahmat",
    penerimaManfaat: "90 Santri & Pemuda",
    lat: -7.160,
    lng: 107.890
  },
  {
    id: "loc-3",
    nama: "Madrasah Diniyah Alhafizh",
    wilayah: "Kab. Bandung",
    kecamatan: "Bojongsoang",
    alamat: "Jl. Sapan Rancakaso No. 14, Tegalluar",
    jumlahMushaf: 30,
    status: "Tersalurkan",
    tanggal: "31 Agustus 2026",
    pic: "Ustzh. Aisyah",
    penerimaManfaat: "45 Santri Cilik",
    lat: -6.950,
    lng: 107.670
  },
  {
    id: "loc-4",
    nama: "Madrasah Diniyah Baitur Rahman",
    wilayah: "Kab. Bandung",
    kecamatan: "Baleendah",
    alamat: "Kp. Margalaksana RT 02/09, Kel. Manggahang",
    jumlahMushaf: 35,
    status: "Tersalurkan",
    tanggal: "10 Agustus 2026",
    pic: "Ust. Fajar",
    penerimaManfaat: "60 Jamaah & Santri",
    lat: -7.012,
    lng: 107.645
  },
  {
    id: "loc-5",
    nama: "Madrasah Sabilunnajah 2",
    wilayah: "Bandung Barat",
    kecamatan: "Cikalongwetan",
    alamat: "Jl. Cisalada Desa Rende RT 01/04",
    jumlahMushaf: 30,
    status: "Tersalurkan",
    tanggal: "18 Agustus 2026",
    pic: "Ust. Rahmat",
    penerimaManfaat: "50 Santri",
    lat: -6.740,
    lng: 107.440
  },
  {
    id: "loc-6",
    nama: "TPA Syarif & Qodir",
    wilayah: "Cianjur",
    kecamatan: "Cikalongkulon",
    alamat: "Kp. Ciherang RT 04/02, Cikalongkulon",
    jumlahMushaf: 30,
    status: "Tersalurkan",
    tanggal: "12 Agustus 2026",
    pic: "Ust. Fajar",
    penerimaManfaat: "40 Santri Diniyah",
    lat: -6.720,
    lng: 107.170
  },
  {
    id: "loc-7",
    nama: "Madrasah Tahfidz Ababul Ummah",
    wilayah: "Sukabumi",
    kecamatan: "Cisaat",
    alamat: "Kp. Nagrak RT 15/06, Desa Sukamantri",
    jumlahMushaf: 30,
    status: "Tersalurkan",
    tanggal: "15 Agustus 2026",
    pic: "Ustzh. Aisyah",
    penerimaManfaat: "55 Santri Tahfidz",
    lat: -6.910,
    lng: 106.910
  },
  {
    id: "loc-8",
    nama: "Yayasan Al-Amanah Tegalluar",
    wilayah: "Kab. Bandung",
    kecamatan: "Bojongsoang",
    alamat: "Kompleks Masjid Al-Amanah, Tegalluar",
    jumlahMushaf: 40,
    status: "Tersalurkan",
    tanggal: "3 Agustus 2026",
    pic: "Ust. Rahmat",
    penerimaManfaat: "80 Mustahik & Santri",
    lat: -6.930,
    lng: 107.695
  },
  {
    id: "loc-9",
    nama: "Pesantren Al-Ittihad",
    wilayah: "Cianjur",
    kecamatan: "Karangtengah",
    alamat: "Jl. Raya Bandung KM 03, Rawabango",
    jumlahMushaf: 50,
    status: "Terjadwal",
    tanggal: "21 September 2026",
    pic: "Ust. Fajar",
    penerimaManfaat: "120 Santri Mukim",
    lat: -6.820,
    lng: 107.140
  },
  {
    id: "loc-10",
    nama: "TPA Darul Ulum",
    wilayah: "Bandung Barat",
    kecamatan: "Padalarang",
    alamat: "Kp. Ciburuy Hilir RT 03/08",
    jumlahMushaf: 40,
    status: "Terjadwal",
    tanggal: "24 September 2026",
    pic: "Ustzh. Aisyah",
    penerimaManfaat: "65 Anak Mengaji",
    lat: -6.840,
    lng: 107.470
  },
  {
    id: "loc-11",
    nama: "Madrasah Nurul Iman",
    wilayah: "Kab. Bandung",
    kecamatan: "Pangalengan",
    alamat: "Kp. Wates RT 01/12, Margamukti",
    jumlahMushaf: 35,
    status: "Terjadwal",
    tanggal: "28 September 2026",
    pic: "Ust. Rahmat",
    penerimaManfaat: "70 Santri Pelosok",
    lat: -7.180,
    lng: 107.570
  },
  {
    id: "loc-12",
    nama: "Madrasah Nurul Bahri Pesisir",
    wilayah: "Sukabumi",
    kecamatan: "Cidadap / Leles",
    alamat: "Kp. Cigebang RT 02/05, Wilayah Leles Pesisir",
    jumlahMushaf: 35,
    status: "Survei",
    tanggal: "4 November 2026",
    pic: "Ust. Fajar",
    penerimaManfaat: "50 Santri Pesisir",
    lat: -7.280,
    lng: 106.880
  }
];

export const INITIAL_REPORT: FullReportData = {
  title: "LAPORAN RAPAT BULANAN DIVISI PROGRAM",
  subtitle: "YAYASAN SARANA BERBAGI",
  nomorSurat: "084/EXT/PROG-YSB/IX/2026",
  period: "Periode Evaluasi: 1–31 Agustus 2026 | Rencana Kerja: September 2026",
  divisi: "Divisi Program & Penyaluran Wakaf Al-Qur'an",
  kota: "Bandung",
  tanggalDitetapkan: "31 Agustus 2026",
  penanggungJawab: {
    ketuaYayasan: "H. Muhammad Ilham, S.E., M.M.",
    nipKetua: "YSB-2018-001",
    kadivProgram: "Ust. Ahmad Fauzan, S.Pd.I.",
    nipKadiv: "YSB-2020-014",
    sekretaris: "Fathurrahman, S.Sos.",
    nipSekretaris: "YSB-2021-022"
  },
  sections: [
    {
      id: 1,
      title: "1. TUJUAN & LANDASAN PROGRAM",
      type: "text",
      content: "Laporan ini disusun sebagai bahan akuntabilitas, monitoring, dan evaluasi Divisi Program Yayasan Sarana Berbagi atas pelaksanaan seluruh kegiatan dakwah dan penyaluran mushaf selama bulan Agustus 2026, sekaligus menjadi pedoman operasional dan dasar alokasi sumber daya pada pelaksanaan Rencana Kerja Bulan September 2026."
    },
    {
      id: 2,
      title: "2. RINGKASAN PERFORMA PROGRAM AGUSTUS 2026",
      type: "mixed",
      content: "Berdasarkan data audit lapangan periode 1–31 Agustus 2026, Divisi Program berhasil merealisasikan penyaluran di 12 titik lokasi yang tersebar di 5 kabupaten/kota di Jawa Barat, dengan total penyaluran sebanyak 350 mushaf Al-Qur'an dan Iqra.",
      table: {
        headers: ["Indikator Kinerja Kunci (KPI)", "Target", "Realisasi", "Ketercapaian"],
        rows: [
          ["Total Lokasi Penyaluran", "10 Lokasi", "12 Lokasi", "120% (Melampaui)"],
          ["Total Mushaf Tersalurkan", "350 Mushaf", "350 Mushaf", "100% (Tuntas)"],
          ["Kabupaten / Kota Terjangkau", "4 Wilayah", "5 Wilayah", "125% (Melampaui)"],
          ["Penerima Manfaat Langsung", "500 Santri/Warga", "580 Santri/Warga", "116% (Sangat Baik)"],
          ["Dokumentasi & Berita Acara (BAST)", "100%", "100%", "100% Lengkap & Tervalidasi"]
        ]
      }
    },
    {
      id: 3,
      title: "3. ANALISIS KENDALA & RESOLUSI LAPANGAN",
      type: "mixed",
      content: "Selama ekspedisi Agustus 2026 diidentifikasi sejumlah kendala teknis serta tindakan mitigasi yang telah diambil:",
      table: {
        headers: ["Kendala / Hambatan", "Dampak Operasional", "Solusi & Mitigasi Tim"],
        rows: [
          ["Jalur tanjakan curam di Pangalengan & Ciwidey", "Waktu tempuh molor 1.5 jam", "Pengalihan ke kendaraan bak terbuka kecil & penyesuaian jadwal lebih pagi"],
          ["Permintaan mushaf melampaui alokasi di 2 madrasah", "Sebagian santri belum kebagian", "Pencatatan daftar antrean resmi untuk alokasi prioritas tahap September pekan 1"],
          ["Kualitas sinyal internet lemah saat upload laporan langsung", "Upload dokumentasi tertunda", "Sistem offline caching checklist & upload serentak saat tiba di posko"]
        ]
      }
    },
    {
      id: 4,
      title: "4. REKOMENDASI TINDAK LANJUT UNTUK SEPTEMBER 2026",
      type: "text",
      content: "1. Mengoptimalkan kampanye digital funding awal pekan agar pengadaan mushaf dapat tiba di gudang minimal H-3 sebelum tanggal penyaluran.\n2. Melanjutkan ekspedisi ke wilayah Priangan Timur (Garut Selatan) dan Cianjur bagian tengah.\n3. Melengkapi penyerahan mushaf dengan program bimbingan metode tajwid praktis dan pelatihan guru mengaji lokal."
    }
  ]
};
