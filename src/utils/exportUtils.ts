import { FullReportData, YearlyPlans, DistributionLocation, MonthName } from '../types';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

/**
 * Helper to generate official report HTML for Word (.doc) and PDF direct download
 * Uses standard RGB/HEX styling to avoid any CSS color format (oklch) issues in html2canvas
 * and guarantees 100% identical appearance to the printed document.
 */
export function generateOfficialReportBodyHtml(reportData: FullReportData, isWordFormat: boolean = false): string {
  const p = reportData.penanggungJawab;

  let sectionsHtml = '';
  reportData.sections.forEach((sec) => {
    sectionsHtml += `
      <div style="margin-top: 22px; margin-bottom: 8px;">
        <table cellpadding="0" cellspacing="0" border="0" style="width: 100%;">
          <tr>
            <td style="width: 4.5px; background-color: #059669; border-radius: 2px;"></td>
            <td style="padding-left: 10px;">
              <span style="font-family: 'Plus Jakarta Sans', Arial, sans-serif; font-size: 11pt; font-weight: 800; color: #0f172a; text-transform: uppercase; letter-spacing: 0.3px;">
                ${sec.title}
              </span>
            </td>
          </tr>
        </table>
      </div>
      <p style="font-family: 'Plus Jakarta Sans', Arial, sans-serif; font-size: 10pt; line-height: 1.65; color: #334155; text-align: justify; margin: 0 0 12px 0; white-space: pre-line;">
        ${isWordFormat ? sec.content.replace(/\n/g, '<br/>') : sec.content}
      </p>
    `;

    if (sec.table) {
      sectionsHtml += `
        <div style="border: 1px solid #cbd5e1; border-radius: 12px; overflow: hidden; margin-top: 10px; margin-bottom: 18px;">
          <table border="1" cellpadding="8" cellspacing="0" style="width: 100%; border-collapse: collapse; border: 1px solid #cbd5e1; font-family: 'Plus Jakarta Sans', Arial, sans-serif; font-size: 9pt;">
            <thead>
              <tr style="background-color: #f1f5f9;">
                ${sec.table.headers.map(h => `<th style="border: 1px solid #cbd5e1; padding: 9px 12px; font-weight: 700; color: #0f172a; text-align: left;">${h}</th>`).join('')}
              </tr>
            </thead>
            <tbody>
              ${sec.table.rows.map((row, idx) => `
                <tr style="background-color: ${idx % 2 === 0 ? '#ffffff' : '#f8fafc'};">
                  ${row.map((cell, cIdx) => `
                    <td style="border: 1px solid #e2e8f0; padding: 9px 12px; color: #334155; ${cIdx === 0 ? 'font-weight: 600; color: #0f172a;' : ''}">
                      ${cell}
                    </td>
                  `).join('')}
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      `;
    }
  });

  return `
    <!-- Kop Surat Resmi -->
    <div style="text-align: center; border-bottom: 3.5px double #0f172a; padding-bottom: 14px; margin-bottom: 22px;">
      <table cellpadding="0" cellspacing="0" border="0" style="width: 100%; margin-bottom: 6px;">
        <tr>
          <td style="width: 52px; vertical-align: middle; text-align: center; padding-right: 12px;">
            <div style="width: 48px; height: 48px; background-color: #065f46; border-radius: 12px; text-align: center; line-height: 48px; color: #ffffff; font-weight: 900; font-size: 16pt; font-family: sans-serif;">
              YSB
            </div>
          </td>
          <td style="vertical-align: middle; text-align: left;">
            <div style="font-size: 16pt; font-weight: 900; text-transform: uppercase; color: #0f172a; margin-bottom: 2px; letter-spacing: -0.2px;">
              ${reportData.subtitle || 'YAYASAN SARANA BERBAGI'}
            </div>
            <div style="font-size: 10pt; font-weight: 600; color: #475569;">
              ${reportData.divisi || 'Divisi Program & Penyaluran Wakaf Al-Qur\'an'}
            </div>
          </td>
        </tr>
      </table>
      <div style="font-size: 8pt; color: #64748b; line-height: 1.4; margin-top: 6px; text-align: center;">
        Sekretariat: Gedung Dakwah Lt. 2, Jl. Pelajar Pejuang 45 No. 88, ${reportData.kota} 40263 | Telp: (022) 731-9988 | Email: program@saranaberbagi.org
      </div>
    </div>

    <!-- Judul Dokumen, Nomor Surat & Periode -->
    <div style="text-align: center; margin-bottom: 24px;">
      <div style="font-size: 14pt; font-weight: 900; text-transform: uppercase; color: #0f172a; text-decoration: underline; margin-bottom: 4px;">
        ${reportData.title}
      </div>
      <div style="font-family: monospace, 'Courier New'; font-size: 9.5pt; font-weight: bold; color: #475569; margin-bottom: 8px;">
        Nomor: ${reportData.nomorSurat}
      </div>
      <div>
        <span style="display: inline-block; background-color: #f1f5f9; border: 1px solid #cbd5e1; border-radius: 9999px; padding: 4px 18px; font-size: 8.5pt; font-weight: 700; color: #334155;">
          ${reportData.period}
        </span>
      </div>
    </div>

    <!-- Isi Laporan & Tabel -->
    ${sectionsHtml}

    <!-- Penetapan Tempat & Tanggal -->
    <div style="text-align: right; font-size: 9.5pt; color: #475569; font-weight: 500; margin-top: 32px; margin-bottom: 14px;">
      ${reportData.penetapanPrefix || 'Ditetapkan di:'} ${reportData.kota}, ${reportData.tanggalDitetapkan}
    </div>

    <!-- 3 Kartu Tanda Tangan Resmi (100% Presisi Sesuai Cetakan) -->
    <table cellpadding="0" cellspacing="10" border="0" style="width: 100%; margin-top: 10px; border-collapse: separate;">
      <tr>
        <!-- Kartu 1 (Kiri) -->
        <td style="width: 32%; vertical-align: top; background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 14px; padding: 14px 10px; text-align: center;">
          <div style="font-size: 8.5pt; color: #64748b; font-weight: 500;">${p.rolePrefix1 || 'Mengetahui,'}</div>
          <div style="font-size: 9.5pt; font-weight: 800; color: #0f172a; margin-top: 2px; min-height: 20px;">${p.roleTitle1 || 'Ketua Yayasan'}</div>
          <div style="height: 56px; line-height: 56px; vertical-align: middle; margin: 4px 0;">
            ${p.signatureImage1 
              ? `<img src="${p.signatureImage1}" style="max-height: 50px; max-width: 90%; display: inline-block; vertical-align: middle;" />` 
              : `<span style="font-family: 'Brush Script MT', 'Lucida Handwriting', 'Segoe Script', cursive, serif; font-style: italic; font-size: 22pt; color: #065f46;">${p.signatureText1 || p.ketuaYayasan.split(' ')[0] || 'Tanda Tangan'}</span>`
            }
          </div>
          <div style="font-size: 9.5pt; font-weight: 800; text-decoration: underline; color: #0f172a; margin-top: 4px;">${p.ketuaYayasan}</div>
          <div style="font-size: 8pt; color: #64748b; margin-top: 2px;">${p.idPrefix1 || 'NIP.'} ${p.nipKetua}</div>
        </td>

        <!-- Kartu 2 (Tengah) -->
        <td style="width: 32%; vertical-align: top; background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 14px; padding: 14px 10px; text-align: center;">
          <div style="font-size: 8.5pt; color: #64748b; font-weight: 500;">${p.rolePrefix2 || 'Disusun oleh,'}</div>
          <div style="font-size: 9.5pt; font-weight: 800; color: #0f172a; margin-top: 2px; min-height: 20px;">${p.roleTitle2 || 'Kepala Divisi Program'}</div>
          <div style="height: 56px; line-height: 56px; vertical-align: middle; margin: 4px 0;">
            ${p.signatureImage2 
              ? `<img src="${p.signatureImage2}" style="max-height: 50px; max-width: 90%; display: inline-block; vertical-align: middle;" />` 
              : `<span style="font-family: 'Brush Script MT', 'Lucida Handwriting', 'Segoe Script', cursive, serif; font-style: italic; font-size: 22pt; color: #065f46;">${p.signatureText2 || p.kadivProgram.split(' ')[0] || 'Tanda Tangan'}</span>`
            }
          </div>
          <div style="font-size: 9.5pt; font-weight: 800; text-decoration: underline; color: #0f172a; margin-top: 4px;">${p.kadivProgram}</div>
          <div style="font-size: 8pt; color: #64748b; margin-top: 2px;">${p.idPrefix2 || 'NIP.'} ${p.nipKadiv}</div>
        </td>

        <!-- Kartu 3 (Kanan) -->
        <td style="width: 32%; vertical-align: top; background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 14px; padding: 14px 10px; text-align: center;">
          <div style="font-size: 8.5pt; color: #64748b; font-weight: 500;">${p.rolePrefix3 || 'Diverifikasi oleh,'}</div>
          <div style="font-size: 9.5pt; font-weight: 800; color: #0f172a; margin-top: 2px; min-height: 20px;">${p.roleTitle3 || 'Sekretaris Yayasan'}</div>
          <div style="height: 56px; line-height: 56px; vertical-align: middle; margin: 4px 0;">
            ${p.signatureImage3 
              ? `<img src="${p.signatureImage3}" style="max-height: 50px; max-width: 90%; display: inline-block; vertical-align: middle;" />` 
              : `<span style="font-family: 'Brush Script MT', 'Lucida Handwriting', 'Segoe Script', cursive, serif; font-style: italic; font-size: 22pt; color: #065f46;">${p.signatureText3 || p.sekretaris.split(' ')[0] || 'Tanda Tangan'}</span>`
            }
          </div>
          <div style="font-size: 9.5pt; font-weight: 800; text-decoration: underline; color: #0f172a; margin-top: 4px;">${p.sekretaris}</div>
          <div style="font-size: 8pt; color: #64748b; margin-top: 2px;">${p.idPrefix3 || 'NIP.'} ${p.nipSekretaris}</div>
        </td>
      </tr>
    </table>
  `;
}

/**
 * Export Document to Microsoft Word (.doc) format with clean layout matching the official printed document
 */
export function exportToWord(reportData: FullReportData, yearlyPlans?: YearlyPlans) {
  const fileName = `Dokumen_Resmi_Laporan_${reportData.nomorSurat.replace(/[\/\\?%*:|"<>]/g, '_')}.doc`;
  const bodyContent = generateOfficialReportBodyHtml(reportData, true);

  const wordContent = `
    <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
    <head>
      <meta charset='utf-8'>
      <title>${reportData.title}</title>
      <!--[if gte mso 9]>
      <xml>
        <w:WordDocument>
          <w:View>Print</w:View>
          <w:Zoom>100</w:Zoom>
          <w:DoNotOptimizeForBrowser/>
        </w:WordDocument>
      </xml>
      <![endif]-->
      <style>
        @page {
          size: A4;
          margin: 20mm 20mm 20mm 20mm;
          mso-header-margin: 36pt;
          mso-footer-margin: 36pt;
        }
        body {
          font-family: 'Segoe UI', Arial, sans-serif;
          color: #1e293b;
          margin: 0;
          padding: 0;
          line-height: 1.5;
        }
      </style>
    </head>
    <body>
      ${bodyContent}
    </body>
    </html>
  `;

  const blob = new Blob(['\ufeff' + wordContent], { type: 'application/msword;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Export full Excel spreadsheet (.xls format) with multiple structured tables
 */
export function exportToExcel(yearlyPlans: YearlyPlans, locations: DistributionLocation[], reportData?: FullReportData) {
  let excelHtml = `
    <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
    <head>
      <meta charset="utf-8">
      <!--[if gte mso 9]><xml><x:ExcelWorkbook><x:ExcelWorksheets><x:ExcelWorksheet><x:Name>Program Yayasan Sarana Berbagi</x:Name><x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions></x:ExcelWorksheet></x:ExcelWorksheets></x:ExcelWorkbook></xml><![endif]-->
      <style>
        th { background-color: #047857; color: #ffffff; font-family: Arial; font-weight: bold; border: 1px solid #000; padding: 8px; }
        td { font-family: Arial; border: 1px solid #d1d5db; padding: 6px; }
        .section-header { background-color: #065f46; color: #ffffff; font-size: 14pt; font-weight: bold; }
        .month-header { background-color: #d1fae5; font-weight: bold; }
      </style>
    </head>
    <body>
      <h2>YAYASAN SARANA BERBAGI - REKAPITULASI RENCANA KERJA 12 BULAN (2026)</h2>
      <p>Divisi Program & Penyaluran Wakaf Al-Qur'an</p>
      
      <table border="1">
        <thead>
          <tr>
            <th colspan="7" class="section-header">TABEL JADWAL FUNDING & MONITORING PROGRES 12 BULAN</th>
          </tr>
          <tr>
            <th>BULAN</th>
            <th>KATEGORI</th>
            <th>NO</th>
            <th>TANGGAL</th>
            <th>PEKAN</th>
            <th>NAMA PROGRAM / KETERANGAN</th>
            <th>STATUS</th>
          </tr>
        </thead>
        <tbody>
  `;

  (Object.keys(yearlyPlans) as MonthName[]).forEach(month => {
    const plan = yearlyPlans[month];
    
    // Funding rows
    plan.funding.forEach((f, idx) => {
      excelHtml += `
        <tr>
          ${idx === 0 ? `<td rowspan="${plan.funding.length + plan.progress.length}" class="month-header">${month}</td>` : ''}
          <td>FUNDING</td>
          <td>${f.no}</td>
          <td>${f.tanggal}</td>
          <td>${f.pekan}</td>
          <td>${f.program}</td>
          <td>${f.status}</td>
        </tr>
      `;
    });

    // Progress rows
    plan.progress.forEach(p => {
      excelHtml += `
        <tr>
          <td>MONITORING</td>
          <td>${p.no}</td>
          <td>${p.tanggal}</td>
          <td>${p.pekan}</td>
          <td>${p.keterangan} ${p.lokasi ? `(${p.lokasi})` : ''}</td>
          <td>${p.status}</td>
        </tr>
      `;
    });
  });

  excelHtml += `
        </tbody>
      </table>

      <br/><br/>
      <h2>DIREKTORI TITIK LOKASI PENYALURAN</h2>
      <table border="1">
        <thead>
          <tr>
            <th>NO</th>
            <th>NAMA MADRASAH / PESANTREN</th>
            <th>WILAYAH</th>
            <th>KECAMATAN</th>
            <th>ALAMAT</th>
            <th>JUMLAH MUSHAF</th>
            <th>STATUS</th>
            <th>PIC</th>
            <th>TANGGAL</th>
          </tr>
        </thead>
        <tbody>
  `;

  locations.forEach((loc, idx) => {
    excelHtml += `
      <tr>
        <td>${idx + 1}</td>
        <td>${loc.nama}</td>
        <td>${loc.wilayah}</td>
        <td>${loc.kecamatan}</td>
        <td>${loc.alamat}</td>
        <td>${loc.jumlahMushaf}</td>
        <td>${loc.status}</td>
        <td>${loc.pic}</td>
        <td>${loc.tanggal}</td>
      </tr>
    `;
  });

  excelHtml += `
        </tbody>
      </table>
    </body>
    </html>
  `;

  const blob = new Blob(['\ufeff' + excelHtml], { type: 'application/vnd.ms-excel;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `Rekapitulasi_Program_12_Bulan_${Date.now()}.xls`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Generic helper to download any rendered DOM element as a high quality PDF
 */
export async function downloadElementAsPdf(elementId: string, fileName: string): Promise<boolean> {
  // Prefer pristine clean print document if available to ensure zero edit-mode outlines or buttons
  const targetElement = (elementId === 'official-report-document' && document.getElementById('clean-printable-official-report'))
    ? document.getElementById('clean-printable-official-report')
    : document.getElementById(elementId);

  if (!targetElement) return false;

  try {
    const canvas = await html2canvas(targetElement, {
      scale: 2.2, // Retina crispness
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff'
    });

    const pdf = new jsPDF('p', 'mm', 'a4');
    const pageWidth = 210;
    const pageHeight = 297;
    const imgWidth = pageWidth;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    let heightLeft = imgHeight;
    let pageNum = 0;

    // Page 1
    pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, 0, imgWidth, imgHeight);
    heightLeft -= pageHeight;

    // Subsequent pages
    while (heightLeft > 0) {
      pageNum++;
      pdf.addPage();
      pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, -(pageNum * pageHeight), imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }

    pdf.save(fileName.endsWith('.pdf') ? fileName : `${fileName}.pdf`);
    return true;
  } catch (err) {
    console.error('downloadElementAsPdf error:', err);
    return false;
  }
}

/**
 * Unduh langsung berkas .pdf ke perangkat pengguna (Download File PDF Nyata, TANPA dialog print)
 * Menggunakan format bersih resmi yang 100% identik dengan hasil cetak
 */
export async function downloadPdfFile(reportData: FullReportData, yearlyPlans?: YearlyPlans): Promise<void> {
  const fileName = `Dokumen_Resmi_Laporan_${reportData.nomorSurat.replace(/[\/\\?%*:|"<>]/g, '_')}.pdf`;
  
  // Create an isolated sandbox element in the document body
  const sandbox = document.createElement('div');
  sandbox.id = 'pdf-render-sandbox';
  sandbox.style.position = 'fixed';
  sandbox.style.top = '0px';
  sandbox.style.left = '0px';
  sandbox.style.width = '794px'; // Exactly A4 width at 96 DPI
  sandbox.style.backgroundColor = '#ffffff';
  sandbox.style.zIndex = '-99999';
  sandbox.style.pointerEvents = 'none';
  sandbox.style.boxSizing = 'border-box';
  sandbox.style.padding = '36px 44px';
  sandbox.style.fontFamily = "'Plus Jakarta Sans', Arial, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
  sandbox.innerHTML = generateOfficialReportBodyHtml(reportData, false);

  document.body.appendChild(sandbox);

  try {
    // Wait briefly for layout & inline images/fonts to render
    await new Promise((resolve) => setTimeout(resolve, 150));

    const canvas = await html2canvas(sandbox, {
      scale: 2.2, // Crisp Retina resolution
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
      width: 794,
      windowWidth: 794,
    });

    const pdf = new jsPDF('p', 'mm', 'a4');
    const pageWidth = 210;
    const pageHeight = 297;
    const imgWidth = pageWidth;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    let heightLeft = imgHeight;
    let pageNum = 0;

    // First page
    pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, 0, imgWidth, imgHeight, undefined, 'FAST');
    heightLeft -= pageHeight;

    // Subsequent pages
    while (heightLeft > 0) {
      pageNum++;
      pdf.addPage();
      pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, -(pageNum * pageHeight), imgWidth, imgHeight, undefined, 'FAST');
      heightLeft -= pageHeight;
    }

    pdf.save(fileName);
  } catch (error) {
    console.error('downloadPdfFile capture failed:', error);
  } finally {
    if (document.body.contains(sandbox)) {
      document.body.removeChild(sandbox);
    }
  }
}

/**
 * Export Donor Impact Report to Microsoft Word (.doc) format
 */
export function exportDonorReportToWord(data: {
  title: string;
  subtitle: string;
  nomorLaporan: string;
  periode: string;
  namaDonatur: string;
  namaInstitusi: string;
  pesanKhusus: string;
  totalMushaf: number | string;
  lembagaCountText: string;
  santriCountText: string;
  doaArab: string;
  doaTerjemah: string;
  namaLembaga: string;
  jabatanLembaga: string;
  namaPic: string;
  jabatanPic: string;
  tableRows: Array<{
    nama: string;
    wilayah: string;
    penerima: string;
    alokasi: string;
    status: string;
  }>;
}) {
  let rowsHtml = '';
  data.tableRows.forEach((row, idx) => {
    const bg = idx % 2 === 0 ? '#ffffff' : '#f9fafb';
    rowsHtml += `
      <tr style="background-color: ${bg};">
        <td style="padding: 8px; border: 1px solid #d1d5db; text-align: center;">${idx + 1}</td>
        <td style="padding: 8px; border: 1px solid #d1d5db; font-weight: bold;">${row.nama}</td>
        <td style="padding: 8px; border: 1px solid #d1d5db;">${row.wilayah}</td>
        <td style="padding: 8px; border: 1px solid #d1d5db;">${row.penerima}</td>
        <td style="padding: 8px; border: 1px solid #d1d5db; text-align: center; font-weight: bold; color: #047857;">${row.alokasi}</td>
        <td style="padding: 8px; border: 1px solid #d1d5db; text-align: center;">${row.status}</td>
      </tr>
    `;
  });

  const wordContent = `
    <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
    <head>
      <meta charset='utf-8'>
      <title>${data.title}</title>
      <style>
        body { font-family: 'Arial', sans-serif; margin: 40px; color: #111827; }
        .header { text-align: center; border-bottom: 2px solid #047857; padding-bottom: 15px; margin-bottom: 25px; }
        .title { font-size: 16pt; font-weight: bold; text-transform: uppercase; color: #064e3b; margin-bottom: 4px; }
        .subtitle { font-size: 11pt; font-weight: bold; color: #047857; text-transform: uppercase; }
        .nomor { font-family: monospace; font-size: 10pt; color: #4b5563; margin-top: 4px; }
        .dedication { background-color: #ecfdf5; border: 1px solid #a7f3d0; padding: 15px; border-radius: 8px; text-align: center; margin-bottom: 25px; }
        .donor-name { font-size: 16pt; font-weight: bold; color: #0f172a; margin: 5px 0; }
        .metrics-table { width: 100%; border-collapse: collapse; margin-bottom: 25px; }
        .metric-cell { width: 33.33%; padding: 12px; text-align: center; border: 1px solid #e2e8f0; background-color: #f8fafc; }
        .metric-num { font-size: 18pt; font-weight: bold; color: #065f46; }
        .prayer-box { background-color: #064e3b; color: #ffffff; padding: 15px; border-radius: 8px; text-align: center; margin: 25px 0; }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="title">${data.title}</div>
        <div class="subtitle">${data.subtitle}</div>
        <div class="nomor">Nomor Laporan: ${data.nomorLaporan} &bull; Periode: ${data.periode}</div>
      </div>

      <div class="dedication">
        <div style="font-size: 9pt; font-weight: bold; color: #047857; text-transform: uppercase;">Dipersiapkan Khusus Untuk:</div>
        <div class="donor-name">${data.namaDonatur}</div>
        ${data.namaInstitusi ? `<div style="font-size: 10pt; color: #475569; font-weight: bold;">${data.namaInstitusi}</div>` : ''}
        ${data.pesanKhusus ? `<div style="margin-top: 10px; font-style: italic; color: #065f46;">"${data.pesanKhusus}"</div>` : ''}
      </div>

      <table class="metrics-table">
        <tr>
          <td class="metric-cell">
            <div style="font-size: 8pt; font-weight: bold; text-transform: uppercase; color: #047857;">Total Wakaf</div>
            <div class="metric-num">${data.totalMushaf}</div>
            <div style="font-size: 9pt;">Mushaf Al-Qur'an</div>
          </td>
          <td class="metric-cell">
            <div style="font-size: 8pt; font-weight: bold; text-transform: uppercase; color: #1d4ed8;">Lembaga Penerima</div>
            <div class="metric-num" style="color: #1e3a8a;">${data.lembagaCountText}</div>
            <div style="font-size: 9pt;">Pesantren & TPA</div>
          </td>
          <td class="metric-cell">
            <div style="font-size: 8pt; font-weight: bold; text-transform: uppercase; color: #b45309;">Penerima Manfaat</div>
            <div class="metric-num" style="color: #78350f;">${data.santriCountText}</div>
            <div style="font-size: 9pt;">Santri Mengaji</div>
          </td>
        </tr>
      </table>

      <h3 style="font-size: 11pt; font-weight: bold; color: #1e293b; text-transform: uppercase; margin-bottom: 8px;">Daftar Titik Penyaluran yang Menerima Amanah Donasi:</h3>
      <table border="1" cellspacing="0" cellpadding="6" style="border-collapse: collapse; width: 100%; font-size: 9pt; margin-bottom: 25px;">
        <tr style="background-color: #047857; color: #ffffff; font-weight: bold;">
          <th style="padding: 8px; width: 30px; text-align: center;">No</th>
          <th style="padding: 8px;">Nama Madrasah / Pesantren</th>
          <th style="padding: 8px;">Wilayah</th>
          <th style="padding: 8px;">Penerima Manfaat</th>
          <th style="padding: 8px; text-align: center;">Alokasi</th>
          <th style="padding: 8px; text-align: center;">Status</th>
        </tr>
        ${rowsHtml}
      </table>

      <div class="prayer-box">
        <div style="font-size: 13pt; margin-bottom: 8px;">${data.doaArab}</div>
        <div style="font-size: 9.5pt; line-height: 1.5; color: #a7f3d0;">"${data.doaTerjemah}"</div>
      </div>

      <table style="width: 100%; border: none; margin-top: 30px; font-size: 9.5pt;">
        <tr>
          <td style="width: 50%; vertical-align: top;">
            <div style="font-weight: bold; color: #0f172a;">${data.namaLembaga}</div>
            <div style="color: #64748b; font-size: 8.5pt;">${data.jabatanLembaga}</div>
            <div style="color: #94a3b8; font-size: 8pt; margin-top: 2px;">Bandung, Jawa Barat</div>
          </td>
          <td style="width: 50%; text-align: right; vertical-align: top;">
            <div style="font-weight: bold; color: #0f172a;">${data.namaPic}</div>
            <div style="color: #64748b; font-size: 8.5pt;">${data.jabatanPic}</div>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;

  const blob = new Blob(['\ufeff', wordContent], { type: 'application/msword' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `Laporan_Donatur_${data.namaDonatur.replace(/[\/\\?%*:|"<>]/g, '_')}.doc`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Khusus untuk Cetak / Print Fisik ke Mesin Printer (Memanggil Dialog Cetak Browser)
 */
export function printToPrinter() {
  window.print();
}

/**
 * Alias untuk backward compatibility
 */
export function exportToPdf() {
  printToPrinter();
}
