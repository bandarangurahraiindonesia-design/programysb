import React, { useState, useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { 
  MapPin, Search, Plus, Filter, CheckCircle2, Clock, 
  Compass, Building2, User, Navigation, ArrowUpRight, 
  Edit2, Trash2, Layers, Check, AlertCircle, Sparkles,
  Maximize2, RotateCcw, FileText, Printer, Download, Copy,
  Image as ImageIcon
} from 'lucide-react';
import { DistributionLocation } from '../types';
import { MapExportModal } from './MapExportModal';

interface LocationMapViewProps {
  locations: DistributionLocation[];
  onOpenAddLocation: () => void;
  onOpenEditLocation: (loc: DistributionLocation) => void;
  onDeleteLocation: (id: string) => void;
  onToggleStatusLocation: (id: string) => void;
  onOpenBast?: (loc: DistributionLocation) => void;
  onNotify?: (msg: string) => void;
}

export const LocationMapView: React.FC<LocationMapViewProps> = ({
  locations,
  onOpenAddLocation,
  onOpenEditLocation,
  onDeleteLocation,
  onToggleStatusLocation,
  onOpenBast,
  onNotify
}) => {
  const [selectedWilayah, setSelectedWilayah] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeLocationId, setActiveLocationId] = useState<string>(locations[0]?.id || '');
  const [tileType, setTileType] = useState<'standard' | 'topo' | 'satellite'>('standard');
  const [showExportModal, setShowExportModal] = useState<boolean>(false);

  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);

  // Extract distinct regions
  const regions = ['ALL', 'Kab. Bandung', 'Bandung Barat', 'Garut', 'Cianjur', 'Sukabumi'];

  // Territory stats
  const regionStats: Record<string, { totalMushaf: number; count: number; color: string; bg: string }> = {
    'Kab. Bandung': { totalMushaf: 0, count: 0, color: '#059669', bg: 'from-emerald-900 to-emerald-800' },
    'Bandung Barat': { totalMushaf: 0, count: 0, color: '#0284c7', bg: 'from-sky-900 to-sky-800' },
    'Garut': { totalMushaf: 0, count: 0, color: '#d97706', bg: 'from-amber-900 to-amber-800' },
    'Cianjur': { totalMushaf: 0, count: 0, color: '#7c3aed', bg: 'from-purple-900 to-purple-800' },
    'Sukabumi': { totalMushaf: 0, count: 0, color: '#ea580c', bg: 'from-orange-900 to-orange-800' }
  };

  locations.forEach(loc => {
    if (!regionStats[loc.wilayah]) {
      regionStats[loc.wilayah] = { totalMushaf: 0, count: 0, color: '#10b981', bg: 'from-slate-900 to-slate-800' };
    }
    regionStats[loc.wilayah].totalMushaf += loc.jumlahMushaf;
    regionStats[loc.wilayah].count += 1;
  });

  const filteredLocations = locations.filter(loc => {
    const matchesWilayah = selectedWilayah === 'ALL' || loc.wilayah === selectedWilayah;
    const matchesStatus = selectedStatus === 'ALL' || loc.status === selectedStatus;
    const matchesSearch = searchQuery === '' || 
      loc.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
      loc.kecamatan.toLowerCase().includes(searchQuery.toLowerCase()) ||
      loc.alamat.toLowerCase().includes(searchQuery.toLowerCase()) ||
      loc.pic.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesWilayah && matchesStatus && matchesSearch;
  });

  const activeLocation = locations.find(l => l.id === activeLocationId) || filteredLocations[0] || locations[0];

  // Helper: Create custom marker icon matching the blue teardrop pin in the user's screenshot
  const createMarkerIcon = (isSelected: boolean, status: string) => {
    // Exact blue teardrop pin with white inner ring and dot from the user's screenshot
    const pinColor = isSelected 
      ? '#059669' 
      : status === 'Tersalurkan' 
      ? '#2563eb' 
      : status === 'Terjadwal' 
      ? '#0284c7' 
      : '#3b82f6';

    const ringScale = isSelected ? '1.15' : '1.0';

    return L.divIcon({
      className: 'custom-leaflet-marker',
      html: `
        <div style="position: relative; width: 34px; height: 44px; transform: translate(-50%, -100%) scale(${ringScale}); cursor: pointer; filter: drop-shadow(0 4px 8px rgba(0,0,0,0.38)); transition: transform 0.2s ease;">
          <svg viewBox="0 0 34 44" width="34" height="44" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M17 0C7.61116 0 0 7.61116 0 17C0 29.8 17 44 17 44C17 44 34 29.8 34 17C34 7.61116 26.3888 0 17 0Z" fill="${pinColor}" stroke="#ffffff" stroke-width="1.8"/>
            <circle cx="17" cy="16" r="6.5" fill="#ffffff"/>
            <circle cx="17" cy="16" r="3.2" fill="${pinColor}"/>
          </svg>
        </div>
      `,
      iconSize: [34, 44],
      iconAnchor: [17, 44],
      popupAnchor: [0, -42]
    });
  };

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      // West Java geographic center (around Bandung - Cianjur)
      const map = L.map(mapContainerRef.current, {
        center: [-6.96, 107.45],
        zoom: 9,
        minZoom: 7,
        maxZoom: 18,
        zoomControl: true,
        scrollWheelZoom: true
      });

      // Default OpenStreetMap Tile layer matching user's image
      const osmLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a> contributors',
        maxZoom: 19,
        crossOrigin: true
      }).addTo(map);

      tileLayerRef.current = osmLayer;
      markersLayerRef.current = L.layerGroup().addTo(map);
      mapInstanceRef.current = map;

      // Invalidate size once rendered
      setTimeout(() => {
        map.invalidateSize();
      }, 250);
    }

    return () => {
      // Do not destroy on every re-render to avoid flashing; will destroy on unmount
    };
  }, []);

  // Update Tile Layer when tileType changes
  useEffect(() => {
    if (!mapInstanceRef.current) return;

    if (tileLayerRef.current) {
      mapInstanceRef.current.removeLayer(tileLayerRef.current);
    }

    let url = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
    let attribution = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';

    if (tileType === 'topo') {
      url = 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png';
      attribution = 'Map data: &copy; OpenStreetMap contributors, SRTM | Map style: &copy; OpenTopoMap (CC-BY-SA)';
    } else if (tileType === 'satellite') {
      url = 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';
      attribution = 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community';
    }

    const newLayer = L.tileLayer(url, {
      attribution,
      maxZoom: 18
    }).addTo(mapInstanceRef.current);

    tileLayerRef.current = newLayer;
  }, [tileType]);

  // Update Markers on locations or filter changes
  useEffect(() => {
    if (!mapInstanceRef.current || !markersLayerRef.current) return;

    markersLayerRef.current.clearLayers();

    filteredLocations.forEach(loc => {
      const isSelected = loc.id === activeLocationId;
      const marker = L.marker([loc.lat, loc.lng], {
        icon: createMarkerIcon(isSelected, loc.status),
        title: loc.nama
      });

      const popupHtml = `
        <div style="font-family: 'Plus Jakarta Sans', sans-serif; padding: 4px 2px; min-width: 210px;">
          <div style="display: flex; align-items: center; justify-content: space-between; gap: 8px; margin-bottom: 4px;">
            <span style="font-size: 10px; font-weight: 800; color: #059669; text-transform: uppercase; letter-spacing: 0.5px;">${loc.wilayah}</span>
            <span style="font-size: 10px; font-weight: 700; padding: 2px 7px; border-radius: 9999px; background: ${loc.status === 'Tersalurkan' ? '#dcfce7' : loc.status === 'Terjadwal' ? '#fef3c7' : '#e0e7ff'}; color: ${loc.status === 'Tersalurkan' ? '#15803d' : loc.status === 'Terjadwal' ? '#b45309' : '#4338ca'};">
              ${loc.status}
            </span>
          </div>
          <h4 style="font-size: 13px; font-weight: 800; color: #0f172a; margin: 0 0 4px 0; line-height: 1.3;">${loc.nama}</h4>
          <p style="font-size: 11px; color: #64748b; margin: 0 0 8px 0; line-height: 1.35;">${loc.alamat}</p>
          <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 6px 8px; margin-bottom: 8px;">
            <div style="display: flex; justify-content: space-between; font-size: 11px; font-weight: 700; color: #1e293b;">
              <span>Alokasi Mushaf:</span>
              <span style="color: #059669; font-weight: 800;">${loc.jumlahMushaf} Mushaf</span>
            </div>
            <div style="display: flex; justify-content: space-between; font-size: 10px; color: #64748b; margin-top: 3px;">
              <span>PIC: ${loc.pic}</span>
              <span>${loc.kecamatan}</span>
            </div>
          </div>
          <div style="font-size: 10px; color: #0284c7; font-weight: 600; text-align: center;">
            📍 Titik Penyaluran Aktif
          </div>
        </div>
      `;

      marker.bindPopup(popupHtml, {
        closeButton: true,
        className: 'custom-leaflet-popup'
      });

      marker.on('click', () => {
        setActiveLocationId(loc.id);
      });

      markersLayerRef.current?.addLayer(marker);
    });
  }, [filteredLocations, activeLocationId]);

  // Handle flying to location when activeLocation changes
  const handleSelectLocation = (loc: DistributionLocation) => {
    setActiveLocationId(loc.id);
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([loc.lat, loc.lng], 13, {
        animate: true,
        duration: 1.0
      });
    }
  };

  // Reset view to encompass all filtered pins
  const handleFitAllLocations = () => {
    if (!mapInstanceRef.current || filteredLocations.length === 0) return;
    const bounds = L.latLngBounds(filteredLocations.map(l => [l.lat, l.lng]));
    mapInstanceRef.current.fitBounds(bounds, {
      padding: [45, 45],
      maxZoom: 12,
      animate: true
    });
  };

  return (
    <div className="space-y-6">
      {/* 1. Main Interactive Map Card (Matches User's Uploaded Screenshot Exactly) */}
      <div className="bg-white rounded-3xl p-5 sm:p-7 border border-slate-200/90 shadow-sm">
        {/* Title and Top Map Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-800 tracking-tight flex items-center gap-2.5">
              <span>Peta Sebaran Lokasi Penyaluran</span>
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                {filteredLocations.length} Titik
              </span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Peta geografis real-time sebaran madrasah, pesantren, dan titik distribusi mushaf Jawa Barat
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Tile Switcher */}
            <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs font-bold text-slate-600 border border-slate-200">
              <button
                onClick={() => setTileType('standard')}
                className={`px-2.5 py-1 rounded-lg transition-all ${
                  tileType === 'standard' ? 'bg-white text-emerald-700 shadow-xs font-extrabold' : 'hover:text-slate-900'
                }`}
              >
                Standar (OSM)
              </button>
              <button
                onClick={() => setTileType('topo')}
                className={`px-2.5 py-1 rounded-lg transition-all ${
                  tileType === 'topo' ? 'bg-white text-emerald-700 shadow-xs font-extrabold' : 'hover:text-slate-900'
                }`}
              >
                Topografi
              </button>
              <button
                onClick={() => setTileType('satellite')}
                className={`px-2.5 py-1 rounded-lg transition-all ${
                  tileType === 'satellite' ? 'bg-white text-emerald-700 shadow-xs font-extrabold' : 'hover:text-slate-900'
                }`}
              >
                Satelit
              </button>
            </div>

            {/* Reset / Fit View Button */}
            <button
              onClick={handleFitAllLocations}
              className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold px-3 py-1.5 rounded-xl border border-slate-200 transition-all flex items-center gap-1.5"
              title="Pusatkan dan tampilkan seluruh titik sebaran"
            >
              <RotateCcw className="w-3.5 h-3.5 text-slate-600" />
              <span>Pusatkan Semua</span>
            </button>

            {/* Download & Infographic Button */}
            <button
              onClick={() => setShowExportModal(true)}
              className="bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-extrabold px-3.5 py-1.5 rounded-xl border border-emerald-800 transition-all flex items-center gap-1.5 shadow-md shadow-emerald-700/20"
              title="Unduh peta untuk laporan & buat infografis visual"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Unduh Peta / Infografis</span>
            </button>
          </div>
        </div>

        {/* Leaflet Map Canvas Container (Exact aspect ratio, rounded container with OpenStreetMap tiles) */}
        <div className="relative w-full rounded-2xl overflow-hidden border border-slate-200 shadow-inner bg-slate-100">
          <div 
            ref={mapContainerRef} 
            className="w-full h-[400px] sm:h-[480px] lg:h-[520px] z-10"
            style={{ width: '100%' }}
          />

          {/* Floating Info Overlay inside Map */}
          <div className="absolute top-3 right-3 z-[400] bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-200 shadow-md text-[11px] font-semibold text-slate-700 pointer-events-none flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-600 animate-pulse"></span>
            <span>Klik pin untuk melihat info titik</span>
          </div>
        </div>

        {/* Selected Location Quick Detail Bar */}
        {activeLocation && (
          <div className="mt-4 p-4 rounded-2xl bg-slate-50 border border-slate-200/90 flex flex-col md:flex-row justify-between items-start md:items-center gap-3 transition-all">
            <div className="flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-extrabold text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-md">
                  📍 {activeLocation.wilayah} • {activeLocation.kecamatan}
                </span>
                <span className={`text-xs font-bold px-2.5 py-0.5 rounded-md ${
                  activeLocation.status === 'Tersalurkan' ? 'bg-emerald-100 text-emerald-800' :
                  activeLocation.status === 'Terjadwal' ? 'bg-amber-100 text-amber-800' :
                  'bg-blue-100 text-blue-800'
                }`}>
                  {activeLocation.status}
                </span>
                <span className="text-xs font-bold text-slate-600">
                  Target: <strong className="text-slate-900">{activeLocation.jumlahMushaf} Mushaf</strong>
                </span>
              </div>
              <h4 className="text-base font-black text-slate-900 mt-1">{activeLocation.nama}</h4>
              <p className="text-xs text-slate-500 mt-0.5">{activeLocation.alamat}</p>
              <div className="flex items-center gap-3 text-xs text-slate-600 mt-1.5 flex-wrap">
                <span>PIC: <strong>{activeLocation.pic}</strong></span>
                <span>•</span>
                <span>Penerima: <strong>{activeLocation.penerimaManfaat}</strong></span>
                <span>•</span>
                <span>Jadwal: <strong>{activeLocation.tanggal}</strong></span>
                <span>•</span>
                <span className="font-mono text-[11px] text-slate-400">({activeLocation.lat.toFixed(4)}, {activeLocation.lng.toFixed(4)})</span>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-shrink-0 w-full sm:w-auto justify-end">
              {onOpenBast && (
                <button
                  onClick={() => onOpenBast(activeLocation)}
                  className="bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 text-xs font-bold px-3 py-2 rounded-xl transition-all flex items-center gap-1.5 shadow-xs"
                  title="Cetak Berita Acara Serah Terima (BAST) resmi"
                >
                  <FileText className="w-3.5 h-3.5 text-emerald-700" />
                  <span>Berita Acara (BAST)</span>
                </button>
              )}
              <button
                onClick={() => onOpenEditLocation(activeLocation)}
                className="bg-white hover:bg-slate-100 text-slate-700 text-xs font-bold px-3 py-2 rounded-xl border border-slate-200 transition-all flex items-center gap-1.5 shadow-xs"
              >
                <Edit2 className="w-3.5 h-3.5 text-slate-500" />
                <span>Edit Lokasi</span>
              </button>
              <button
                onClick={() => onToggleStatusLocation(activeLocation.id)}
                className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 shadow-sm shadow-emerald-600/20"
                title="Ubah status penyaluran"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Status: {activeLocation.status}</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 2. Filter & Search Controls + Add Button */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/80 shadow-sm flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4">
        <div className="flex items-center gap-3 flex-1 flex-wrap sm:flex-nowrap">
          <div className="relative flex-1 min-w-[220px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari nama madrasah, kecamatan, alamat, atau PIC..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-10 pr-4 py-2 text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            <select
              value={selectedWilayah}
              onChange={(e) => setSelectedWilayah(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              {regions.map(r => (
                <option key={r} value={r}>{r === 'ALL' ? 'Semua Wilayah' : r}</option>
              ))}
            </select>

            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="ALL">Semua Status</option>
              <option value="Tersalurkan">Tersalurkan</option>
              <option value="Terjadwal">Terjadwal</option>
              <option value="Survei">Survei</option>
            </select>
          </div>
        </div>

        <button
          onClick={onOpenAddLocation}
          className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-md shadow-emerald-600/20 transition-all flex items-center justify-center gap-2 whitespace-nowrap"
        >
          <Plus className="w-4 h-4" />
          <span>+ Tambah Titik Lokasi Baru</span>
        </button>
      </div>

      {/* 3. Territorial Cards (Clickable to Filter & Focus) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {[
          { name: 'Kab. Bandung', label: 'Bandung Raya', mushaf: regionStats['Kab. Bandung']?.totalMushaf || 105, titik: regionStats['Kab. Bandung']?.count || 4, color: '#059669', bg: 'from-emerald-900 to-emerald-800' },
          { name: 'Bandung Barat', label: 'Parahyangan Barat', mushaf: regionStats['Bandung Barat']?.totalMushaf || 70, titik: regionStats['Bandung Barat']?.count || 2, color: '#0284c7', bg: 'from-sky-900 to-sky-800' },
          { name: 'Garut', label: 'Priangan Timur', mushaf: regionStats['Garut']?.totalMushaf || 50, titik: regionStats['Garut']?.count || 1, color: '#d97706', bg: 'from-amber-900 to-amber-800' },
          { name: 'Cianjur', label: 'Wilayah Tengah', mushaf: regionStats['Cianjur']?.totalMushaf || 80, titik: regionStats['Cianjur']?.count || 2, color: '#7c3aed', bg: 'from-purple-900 to-purple-800' },
          { name: 'Sukabumi', label: 'Pesisir & Selatan', mushaf: regionStats['Sukabumi']?.totalMushaf || 65, titik: regionStats['Sukabumi']?.count || 2, color: '#ea580c', bg: 'from-orange-900 to-orange-800' }
        ].map((territory) => {
          const isSelected = selectedWilayah === territory.name;
          return (
            <button
              key={territory.name}
              onClick={() => {
                const newWil = selectedWilayah === territory.name ? 'ALL' : territory.name;
                setSelectedWilayah(newWil);
                // Fly to that region
                if (mapInstanceRef.current) {
                  const target = locations.find(l => l.wilayah === territory.name);
                  if (target) {
                    mapInstanceRef.current.flyTo([target.lat, target.lng], 10, { duration: 1.0 });
                  }
                }
              }}
              className={`p-4 rounded-2xl text-left border transition-all text-white relative overflow-hidden shadow-sm bg-gradient-to-br ${territory.bg} ${
                isSelected ? 'ring-3 ring-white scale-[1.02] shadow-lg' : 'hover:opacity-95'
              }`}
            >
              <div className="flex justify-between items-start">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-300">
                  {territory.label}
                </span>
                <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-full font-bold">
                  {territory.titik} Titik
                </span>
              </div>
              <div className="text-xl sm:text-2xl font-black mt-2 tracking-tight">
                {territory.mushaf} <span className="text-xs font-normal opacity-80">Mushaf</span>
              </div>
              <div className="text-xs font-semibold mt-0.5 text-slate-200 truncate">
                {territory.name}
              </div>
            </button>
          );
        })}
      </div>

      {/* 4. Location Directory Grid with Full CRUD */}
      <div className="space-y-3">
        <div className="flex justify-between items-center px-1">
          <h4 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
            Direktori Titik Penyaluran ({filteredLocations.length})
          </h4>
          <span className="text-xs text-slate-500">Klik kartu untuk fokus peta • Edit atau Hapus lokasi</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {filteredLocations.length === 0 ? (
            <div className="col-span-full bg-white rounded-2xl p-8 text-center text-slate-500 border border-slate-200 text-sm">
              Tidak ada lokasi penyaluran yang cocok dengan filter. Klik "+ Tambah Titik Lokasi Baru" untuk menambahkan.
            </div>
          ) : (
            filteredLocations.map((loc) => {
              const isSelected = activeLocation?.id === loc.id;
              return (
                <div
                  key={loc.id}
                  onClick={() => handleSelectLocation(loc)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-emerald-50/95 border-emerald-500 ring-2 ring-emerald-500/20 shadow-md'
                      : 'bg-white border-slate-200/80 hover:border-slate-300 hover:bg-slate-50/70 shadow-xs'
                  }`}
                >
                  <div className="flex justify-between items-start gap-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-md">
                          {loc.wilayah}
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onToggleStatusLocation(loc.id);
                          }}
                          className={`text-[11px] font-bold px-2 py-0.5 rounded-md transition-all ${
                            loc.status === 'Tersalurkan' ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200' :
                            loc.status === 'Terjadwal' ? 'bg-amber-100 text-amber-800 hover:bg-amber-200' :
                            'bg-blue-100 text-blue-800 hover:bg-blue-200'
                          }`}
                          title="Klik untuk ubah status"
                        >
                          {loc.status}
                        </button>
                      </div>
                      <h5 className="font-extrabold text-slate-900 text-sm mt-1.5">{loc.nama}</h5>
                      <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">{loc.alamat}</p>
                    </div>

                    <div className="text-right flex-shrink-0">
                      <span className="text-base font-black text-emerald-700">{loc.jumlahMushaf}</span>
                      <span className="text-[10px] block text-slate-500 font-medium">Mushaf</span>
                    </div>
                  </div>

                  <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                    <span className="flex items-center gap-1">
                      <User className="w-3 h-3 text-slate-400" /> PIC: {loc.pic}
                    </span>
                    
                    {/* Edit, BAST & Delete Controls */}
                    <div className="flex items-center gap-1">
                      {onOpenBast && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onOpenBast(loc);
                          }}
                          className="px-2 py-1 text-[11px] font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition-colors flex items-center gap-1 mr-1"
                          title="Cetak Berita Acara (BAST)"
                        >
                          <FileText className="w-3 h-3 text-emerald-700" />
                          <span>BAST</span>
                        </button>
                      )}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onOpenEditLocation(loc);
                        }}
                        className="p-1.5 text-slate-400 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors"
                        title="Edit Lokasi"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteLocation(loc.id);
                        }}
                        className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Hapus Lokasi"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Map Export & Infographic Generator Modal */}
      <MapExportModal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
        locations={filteredLocations.length > 0 ? filteredLocations : locations}
        mapContainerElement={mapContainerRef.current}
        onNotify={(msg) => {
          if (onNotify) {
            onNotify(msg);
          } else {
            alert(msg);
          }
        }}
      />
    </div>
  );
};
