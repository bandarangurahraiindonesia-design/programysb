import React, { useState, useEffect } from 'react';
import { X, Save, Calendar, Clock, BookOpen, MapPin, User, FileText } from 'lucide-react';
import { MonthName, FundingItem, ProgressItem } from '../types';

interface AddEditModalProps {
  isOpen: boolean;
  type: 'funding' | 'progress';
  month: MonthName;
  editItem?: FundingItem | ProgressItem | null;
  onClose: () => void;
  onSave: (type: 'funding' | 'progress', month: MonthName, itemData: any) => void;
}

export const AddEditModal: React.FC<AddEditModalProps> = ({
  isOpen,
  type,
  month,
  editItem,
  onClose,
  onSave
}) => {
  const [tanggal, setTanggal] = useState('');
  const [pekan, setPekan] = useState('MINGGU KE 1');
  const [program, setProgram] = useState('');
  const [keterangan, setKeterangan] = useState('');
  const [lokasi, setLokasi] = useState('');
  const [pic, setPic] = useState('');
  const [targetMushaf, setTargetMushaf] = useState<number | string>(75);
  const [status, setStatus] = useState<string>('Rencana');

  useEffect(() => {
    if (editItem) {
      setTanggal(editItem.tanggal || '');
      setPekan(editItem.pekan || 'MINGGU KE 1');
      setStatus(editItem.status || (type === 'funding' ? 'Rencana' : 'Pending'));
      
      if (type === 'funding') {
        const fi = editItem as FundingItem;
        setProgram(fi.program || '');
        setPic(fi.pic || '');
        setTargetMushaf(fi.targetMushaf || 75);
      } else {
        const pi = editItem as ProgressItem;
        setKeterangan(pi.keterangan || '');
        setLokasi(pi.lokasi || '');
      }
    } else {
      // Default new item template
      setTanggal(`5-6 ${month} 2026`);
      setPekan('MINGGU KE 1');
      setStatus(type === 'funding' ? 'Rencana' : 'Pending');
      setProgram(type === 'funding' ? "AL-QUR'AN REGULER" : '');
      setKeterangan(type === 'progress' ? 'Laporan Progres Penyaluran ' : '');
      setLokasi('Kab. Bandung');
      setPic('');
      setTargetMushaf(75);
    }
  }, [editItem, type, month, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (type === 'funding') {
      onSave('funding', month, {
        id: editItem ? editItem.id : `f-${Date.now()}`,
        tanggal,
        pekan,
        program,
        targetMushaf: Number(targetMushaf) || 0,
        pic,
        status
      });
    } else {
      onSave('progress', month, {
        id: editItem ? editItem.id : `p-${Date.now()}`,
        tanggal,
        pekan,
        keterangan,
        lokasi,
        status
      });
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full p-6 sm:p-8 border border-slate-200/80 animate-in fade-in zoom-in-95 duration-200">
        <div className="flex justify-between items-center pb-4 border-b border-slate-100">
          <div>
            <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">
              Bulan: {month} 2026
            </span>
            <h3 className="text-xl font-black text-slate-800 tracking-tight mt-0.5">
              {editItem ? 'Edit Agenda' : 'Tambah Agenda Baru'}: {type === 'funding' ? 'Funding' : 'Monitoring Progres'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-full hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-emerald-600" /> Tanggal Agenda
              </label>
              <input
                type="text"
                placeholder={`Contoh: 10-11 ${month} 2026`}
                value={tanggal}
                onChange={(e) => setTanggal(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all font-medium"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-emerald-600" /> Pekan
              </label>
              <select
                value={pekan}
                onChange={(e) => setPekan(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
              >
                <option value="MINGGU KE 1">MINGGU KE 1</option>
                <option value="MINGGU KE 2">MINGGU KE 2</option>
                <option value="MINGGU KE 3">MINGGU KE 3</option>
                <option value="MINGGU KE 4">MINGGU KE 4</option>
                <option value="MINGGU KE 5">MINGGU KE 5</option>
              </select>
            </div>
          </div>

          {type === 'funding' ? (
            <>
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1 flex items-center gap-1">
                  <BookOpen className="w-3.5 h-3.5 text-emerald-600" /> Nama Program Funding
                </label>
                <input
                  type="text"
                  placeholder="Contoh: AL-QUR'AN RAMADHAN / AL-QUR'AN DUAFA"
                  value={program}
                  onChange={(e) => setProgram(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1 flex items-center gap-1">
                    <User className="w-3.5 h-3.5 text-emerald-600" /> PIC Penanggung Jawab
                  </label>
                  <input
                    type="text"
                    placeholder="Ketik nama PIC (contoh: Ust. Fajar)..."
                    value={pic}
                    onChange={(e) => setPic(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Target Mushaf (Eks.)
                  </label>
                  <input
                    type="number"
                    value={targetMushaf}
                    onChange={(e) => setTargetMushaf(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
                  />
                </div>
              </div>
            </>
          ) : (
            <>
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1 flex items-center gap-1">
                  <FileText className="w-3.5 h-3.5 text-teal-600" /> Keterangan Kegiatan & Progres
                </label>
                <textarea
                  rows={3}
                  placeholder="Contoh: Laporan Progres Madrasah Diniyah Baitur Rahman, Kp. Margalaksana"
                  value={keterangan}
                  onChange={(e) => setKeterangan(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-teal-600" /> Lokasi Wilayah
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Rancabali, Kab. Bandung / Garut Selatan"
                  value={lokasi}
                  onChange={(e) => setLokasi(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
                />
              </div>
            </>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
              Status Eksekusi
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
            >
              {type === 'funding' ? (
                <>
                  <option value="Rencana">Rencana</option>
                  <option value="Berjalan">Berjalan</option>
                  <option value="Selesai">Selesai</option>
                </>
              ) : (
                <>
                  <option value="Pending">Pending</option>
                  <option value="Dalam Proses">Dalam Proses</option>
                  <option value="Selesai">Selesai</option>
                </>
              )}
            </select>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-semibold px-4 py-2.5 rounded-xl transition-all"
            >
              Batal
            </button>
            <button
              type="submit"
              className="bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold px-5 py-2.5 rounded-xl shadow-md shadow-emerald-600/20 transition-all flex items-center gap-2"
            >
              <Save className="w-4 h-4" /> Simpan Agenda
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
