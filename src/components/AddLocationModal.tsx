import React, { useState, useEffect, useRef } from 'react';
import { X, Save, MapPin, Building2, User, Calendar, Award, Crosshair, Navigation } from 'lucide-react';
import L from 'leaflet';
import { DistributionLocation } from '../types';

interface AddLocationModalProps {
  isOpen: boolean;
  editLocation?: DistributionLocation | null;
  onClose: () => void;
  onSaveLocation: (loc: DistributionLocation) => void;
}

export const AddLocationModal: React.FC<AddLocationModalProps> = ({
  isOpen,
  editLocation,
  onClose,
  onSaveLocation
}) => {
  const [nama, setNama] = useState('');
  const [wilayah, setWilayah] = useState('Kab. Bandung');
  const [kecamatan, setKecamatan] = useState('');
  const [alamat, setAlamat] = useState('');
  const [jumlahMushaf, setJumlahMushaf] = useState<number | string>(40);
  const [status, setStatus] = useState<'Tersalurkan' | 'Terjadwal' | 'Survei'>('Terjadwal');
  const [tanggal, setTanggal] = useState('15 September 2026');
  const [pic, setPic] = useState('');
  const [penerimaManfaat, setPenerimaManfaat] = useState('60 Santri Mengaji');
  const [lat, setLat] = useState<number | string>(-6.95);
  const [lng, setLng] = useState<number | string>(107.65);
  const [showMiniMap, setShowMiniMap] = useState(true);

  const miniMapContainerRef = useRef<HTMLDivElement | null>(null);
  const miniMapInstanceRef = useRef<L.Map | null>(null);
  const miniMarkerRef = useRef<L.Marker | null>(null);

  useEffect(() => {
    if (editLocation) {
      setNama(editLocation.nama);
      setWilayah(editLocation.wilayah);
      setKecamatan(editLocation.kecamatan);
      setAlamat(editLocation.alamat);
      setJumlahMushaf(editLocation.jumlahMushaf);
      setStatus(editLocation.status);
      setTanggal(editLocation.tanggal);
      setPic(editLocation.pic || '');
      setPenerimaManfaat(editLocation.penerimaManfaat);
      setLat(editLocation.lat);
      setLng(editLocation.lng);
    } else {
      setNama('');
      setWilayah('Kab. Bandung');
      setKecamatan('');
      setAlamat('');
      setJumlahMushaf(40);
      setStatus('Terjadwal');
      setTanggal('15 September 2026');
      setPic('');
      setPenerimaManfaat('60 Santri Mengaji');
      setLat(-6.95);
      setLng(107.65);
    }
  }, [editLocation, isOpen]);

  // Create custom marker icon
  const getPickerMarkerIcon = () => {
    return L.divIcon({
      className: 'custom-leaflet-marker',
      html: `
        <div style="position: relative; width: 34px; height: 34px; transform: translate(-50%, -100%); cursor: grab;">
          <svg viewBox="0 0 24 24" width="34" height="34" style="filter: drop-shadow(0 4px 6px rgba(0,0,0,0.35));">
            <path
              d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"
              fill="#1d4ed8"
              stroke="#ffffff"
              stroke-width="1.2"
            />
            <circle cx="12" cy="9" r="3.2" fill="#ffffff" />
          </svg>
        </div>
      `,
      iconSize: [0, 0],
      iconAnchor: [0, 0]
    });
  };

  // Initialize and update interactive mini map for pin-picking
  useEffect(() => {
    if (!isOpen || !showMiniMap) return;

    const timer = setTimeout(() => {
      if (!miniMapContainerRef.current) return;

      const currentLat = Number(lat) || -6.95;
      const currentLng = Number(lng) || 107.65;

      if (!miniMapInstanceRef.current) {
        const map = L.map(miniMapContainerRef.current, {
          center: [currentLat, currentLng],
          zoom: 11,
          zoomControl: true,
          attributionControl: false
        });

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          maxZoom: 19
        }).addTo(map);

        // Add draggable marker
        const marker = L.marker([currentLat, currentLng], {
          icon: getPickerMarkerIcon(),
          draggable: true
        }).addTo(map);

        marker.on('dragend', (e) => {
          const newPos = e.target.getLatLng();
          setLat(Number(newPos.lat.toFixed(5)));
          setLng(Number(newPos.lng.toFixed(5)));
        });

        // Click map to reposition marker
        map.on('click', (e) => {
          marker.setLatLng(e.latlng);
          setLat(Number(e.latlng.lat.toFixed(5)));
          setLng(Number(e.latlng.lng.toFixed(5)));
        });

        miniMapInstanceRef.current = map;
        miniMarkerRef.current = marker;
      } else {
        miniMapInstanceRef.current.setView([currentLat, currentLng], miniMapInstanceRef.current.getZoom());
        if (miniMarkerRef.current) {
          miniMarkerRef.current.setLatLng([currentLat, currentLng]);
        }
        miniMapInstanceRef.current.invalidateSize();
      }
    }, 150);

    return () => {
      clearTimeout(timer);
    };
  }, [isOpen, showMiniMap]);

  // Clean up map when modal closes
  useEffect(() => {
    if (!isOpen && miniMapInstanceRef.current) {
      miniMapInstanceRef.current.remove();
      miniMapInstanceRef.current = null;
      miniMarkerRef.current = null;
    }
  }, [isOpen]);

  // Update default coordinates when region changes if not editing
  const handleWilayahChange = (newWilayah: string) => {
    setWilayah(newWilayah);
    if (!editLocation) {
      let targetLat = -6.95;
      let targetLng = 107.65;

      if (newWilayah === 'Garut') {
        targetLat = -7.16; targetLng = 107.89;
      } else if (newWilayah === 'Cianjur') {
        targetLat = -6.82; targetLng = 107.14;
      } else if (newWilayah === 'Sukabumi') {
        targetLat = -6.92; targetLng = 106.92;
      } else if (newWilayah === 'Bandung Barat') {
        targetLat = -6.74; targetLng = 107.44;
      } else if (newWilayah === 'Kota Bandung') {
        targetLat = -6.91; targetLng = 107.61;
      }

      setLat(targetLat);
      setLng(targetLng);

      if (miniMapInstanceRef.current) {
        miniMapInstanceRef.current.flyTo([targetLat, targetLng], 11, { duration: 0.8 });
        if (miniMarkerRef.current) {
          miniMarkerRef.current.setLatLng([targetLat, targetLng]);
        }
      }
    }
  };

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const finalLat = Number(lat) || -6.95;
    const finalLng = Number(lng) || 107.65;

    const savedLoc: DistributionLocation = {
      id: editLocation ? editLocation.id : `loc-${Date.now()}`,
      nama,
      wilayah,
      kecamatan: kecamatan || 'Pusat',
      alamat,
      jumlahMushaf: Number(jumlahMushaf) || 30,
      status,
      tanggal,
      pic,
      penerimaManfaat,
      lat: finalLat,
      lng: finalLng
    };

    onSaveLocation(savedLoc);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full p-6 sm:p-8 border border-slate-200 animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <span className="p-2 bg-emerald-100 text-emerald-700 rounded-xl">
              <MapPin className="w-5 h-5" />
            </span>
            <div>
              <h3 className="text-lg font-black text-slate-800 tracking-tight">
                {editLocation ? 'Edit Titik Penyaluran' : 'Tambah Titik Penyaluran Baru'}
              </h3>
              <p className="text-xs text-slate-500">
                Pilih titik di peta atau masukkan koordinat secara manual
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

        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
              Nama Madrasah / Pesantren / TPA
            </label>
            <input
              type="text"
              placeholder="Contoh: Madrasah Nurul Huda"
              value={nama}
              onChange={(e) => setNama(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-sm text-slate-800 focus:ring-2 focus:ring-emerald-500 font-medium"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Wilayah (Kab / Kota)
              </label>
              <select
                value={wilayah}
                onChange={(e) => handleWilayahChange(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:ring-2 focus:ring-emerald-500 font-medium"
              >
                <option value="Kab. Bandung">Kab. Bandung</option>
                <option value="Bandung Barat">Bandung Barat</option>
                <option value="Garut">Garut</option>
                <option value="Cianjur">Cianjur</option>
                <option value="Sukabumi">Sukabumi</option>
                <option value="Kota Bandung">Kota Bandung</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Kecamatan
              </label>
              <input
                type="text"
                placeholder="Contoh: Rancabali"
                value={kecamatan}
                onChange={(e) => setKecamatan(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-sm text-slate-800 focus:ring-2 focus:ring-emerald-500 font-medium"
              />
            </div>
          </div>

          {/* Interactive Mini Leaflet Map Pin Picker */}
          <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                <Crosshair className="w-4 h-4 text-emerald-600" />
                <span>Klik Peta untuk Menentukan Pin Titik Penyaluran:</span>
              </div>
              <span className="text-[11px] font-mono font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-md">
                {Number(lat).toFixed(4)}, {Number(lng).toFixed(4)}
              </span>
            </div>

            {/* Map Canvas Container */}
            <div className="relative rounded-xl overflow-hidden border border-slate-200 shadow-inner h-48 w-full z-0">
              <div 
                ref={miniMapContainerRef} 
                className="w-full h-full bg-slate-100"
              />
            </div>

            <p className="text-[11px] text-slate-500 mt-1.5 flex items-center justify-between">
              <span>💡 Klik atau geser pin biru di peta untuk memilih lokasi tepat.</span>
              <span className="text-[10px] text-slate-400">Jawa Barat</span>
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Latitude (Garis Lintang)
              </label>
              <input
                type="number"
                step="0.0001"
                placeholder="-6.95"
                value={lat}
                onChange={(e) => setLat(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono text-slate-800 focus:ring-2 focus:ring-emerald-500 font-medium"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Longitude (Garis Bujur)
              </label>
              <input
                type="number"
                step="0.0001"
                placeholder="107.65"
                value={lng}
                onChange={(e) => setLng(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono text-slate-800 focus:ring-2 focus:ring-emerald-500 font-medium"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
              Alamat Lengkap
            </label>
            <textarea
              rows={2}
              placeholder="Contoh: Kp. Sapan RT 02/08 Desa Tegalluar"
              value={alamat}
              onChange={(e) => setAlamat(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-sm text-slate-800 focus:ring-2 focus:ring-emerald-500 font-medium"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Jumlah Mushaf
              </label>
              <input
                type="number"
                value={jumlahMushaf}
                onChange={(e) => setJumlahMushaf(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-sm text-slate-800 focus:ring-2 focus:ring-emerald-500 font-medium"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Status Penyaluran
              </label>
              <select
                value={status}
                onChange={(e: any) => setStatus(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:ring-2 focus:ring-emerald-500 font-medium"
              >
                <option value="Terjadwal">Terjadwal</option>
                <option value="Tersalurkan">Tersalurkan</option>
                <option value="Survei">Survei</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                PIC Lapangan
              </label>
              <input
                type="text"
                placeholder="Ketik nama PIC (contoh: Ust. Fajar)..."
                value={pic}
                onChange={(e) => setPic(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:ring-2 focus:ring-emerald-500 font-medium"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Tanggal Penyaluran
              </label>
              <input
                type="text"
                placeholder="15 September 2026"
                value={tanggal}
                onChange={(e) => setTanggal(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:ring-2 focus:ring-emerald-500 font-medium"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
              Target Penerima Manfaat
            </label>
            <input
              type="text"
              placeholder="Contoh: 75 Santri Tahfidz"
              value={penerimaManfaat}
              onChange={(e) => setPenerimaManfaat(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-sm text-slate-800 focus:ring-2 focus:ring-emerald-500 font-medium"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold px-4 py-2.5 rounded-xl transition-all"
            >
              Batal
            </button>
            <button
              type="submit"
              className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-5 py-2.5 rounded-xl shadow-md shadow-emerald-600/20 transition-all flex items-center gap-2"
            >
              <Save className="w-4 h-4" /> {editLocation ? 'Perbarui Lokasi' : 'Simpan Titik Lokasi'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
