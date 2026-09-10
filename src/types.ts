export type MonthName =
  | 'Januari'
  | 'Februari'
  | 'Maret'
  | 'April'
  | 'Mei'
  | 'Juni'
  | 'Juli'
  | 'Agustus'
  | 'September'
  | 'Oktober'
  | 'November'
  | 'Desember';

export interface FundingItem {
  id: string;
  no: number;
  tanggal: string;
  pekan: string;
  program: string;
  targetMushaf?: number;
  status: 'Selesai' | 'Berjalan' | 'Rencana';
  pic?: string;
  anggaran?: number;
}

export interface ProgressItem {
  id: string;
  no: number;
  tanggal: string;
  pekan: string;
  keterangan: string;
  lokasi?: string;
  status: 'Selesai' | 'Dalam Proses' | 'Pending';
  dokumentasi?: string;
}

export interface MonthlyPlan {
  focus: string;
  targetMushaf: number;
  realisasiMushaf: number;
  status: 'Selesai' | 'Berjalan (Aktif)' | 'Perencanaan';
  funding: FundingItem[];
  progress: ProgressItem[];
  evaluasi?: string;
}

export type YearlyPlans = Record<MonthName, MonthlyPlan>;

export interface DistributionLocation {
  id: string;
  nama: string;
  wilayah: string;
  kecamatan: string;
  alamat: string;
  jumlahMushaf: number;
  status: 'Tersalurkan' | 'Terjadwal' | 'Survei';
  tanggal: string;
  pic: string;
  penerimaManfaat: string;
  lat: number;
  lng: number;
}

export interface ReportSection {
  id: number;
  title: string;
  type: 'text' | 'table' | 'mixed';
  content: string;
  table?: {
    headers: string[];
    rows: string[][];
  };
}

export interface FullReportData {
  title: string;
  subtitle: string;
  nomorSurat: string;
  period: string;
  divisi: string;
  kota: string;
  tanggalDitetapkan: string;
  penetapanPrefix?: string;
  penanggungJawab: {
    ketuaYayasan: string;
    nipKetua: string;
    kadivProgram: string;
    nipKadiv: string;
    sekretaris: string;
    nipSekretaris: string;
    rolePrefix1?: string;
    roleTitle1?: string;
    signatureText1?: string;
    signatureImage1?: string;
    idPrefix1?: string;
    rolePrefix2?: string;
    roleTitle2?: string;
    signatureText2?: string;
    signatureImage2?: string;
    idPrefix2?: string;
    rolePrefix3?: string;
    roleTitle3?: string;
    signatureText3?: string;
    signatureImage3?: string;
    idPrefix3?: string;
  };
  sections: ReportSection[];
}
