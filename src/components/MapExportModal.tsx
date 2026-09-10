import React, { useState, useRef, useEffect } from 'react';
import { 
  X, 
  Download, 
  Copy, 
  FileText, 
  Check, 
  Sparkles, 
  Layers, 
  MapPin, 
  ShieldCheck, 
  Sliders, 
  Eye, 
  Loader2,
  Image as ImageIcon,
  Palette,
  RotateCcw,
  CheckCircle2,
  Clock,
  Compass
} from 'lucide-react';
import { jsPDF } from 'jspdf';
import L from 'leaflet';
import { DistributionLocation } from '../types';

interface MapExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  locations: DistributionLocation[];
  mapContainerElement?: HTMLElement | null;
  onNotify?: (msg: string) => void;
}

export const MapExportModal: React.FC<MapExportModalProps> = ({
  isOpen,
  onClose,
  locations,
  onNotify,
}) => {
  // Customization states
  const [reportTitle, setReportTitle] = useState('PETA SEBARAN PENYALURAN WAKAF AL-QUR\'AN JAWA BARAT');
  const [subTitle, setSubTitle] = useState('Divisi Program • Yayasan Sarana Berbagi (Tahun Anggaran 2026)');
  const [layoutMode, setLayoutMode] = useState<'infographic' | 'clean-map' | 'report-sheet'>('infographic');
  const [colorTheme, setColorTheme] = useState<'emerald' | 'navy' | 'clean-light'>('emerald');
  const [tileSource, setTileSource] = useState<'osm' | 'satellite' | 'topo' | 'carto'>('osm');
  const [showKpiMetrics, setShowKpiMetrics] = useState(true);
  const [showLegend, setShowLegend] = useState(true);
  const [showLocationTable, setShowLocationTable] = useState(true);

  // Action states
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgressText, setExportProgressText] = useState('');
  const [copiedSuccess, setCopiedSuccess] = useState(false);

  // Leaflet preview ref
  const mapPreviewRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const markersGroupRef = useRef<L.LayerGroup | null>(null);

  // Aggregate statistics
  const totalMushaf = locations.reduce((sum, l) => sum + l.jumlahMushaf, 0);
  const totalTitik = locations.length;
  const tersalurkanCount = locations.filter(l => l.status === 'Tersalurkan').length;
  const terjadwalCount = locations.filter(l => l.status === 'Terjadwal').length;
  const uniqueWilayah = Array.from(new Set(locations.map(l => l.wilayah)));

  // Tile layer URL map
  const getTileUrl = (source: string) => {
    switch (source) {
      case 'satellite':
        return 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';
      case 'topo':
        return 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png';
      case 'carto':
        return 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png';
      case 'osm':
      default:
        return 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
    }
  };

  // 1. Initialize Real Interactive Leaflet Map for Modal Preview
  useEffect(() => {
    if (!isOpen) {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
      return;
    }

    // Small delay to ensure DOM container has rendered with proper dimensions
    const timer = setTimeout(() => {
      if (!mapPreviewRef.current) return;

      if (!mapInstanceRef.current) {
        // Calculate center based on locations
        const avgLat = locations.length > 0 
          ? locations.reduce((acc, l) => acc + l.lat, 0) / locations.length 
          : -6.95;
        const avgLng = locations.length > 0 
          ? locations.reduce((acc, l) => acc + l.lng, 0) / locations.length 
          : 107.5;

        const map = L.map(mapPreviewRef.current, {
          center: [avgLat, avgLng],
          zoom: 9,
          minZoom: 7,
          maxZoom: 16,
          attributionControl: false,
          zoomControl: true,
          scrollWheelZoom: false,
        });

        const layer = L.tileLayer(getTileUrl(tileSource), {
          maxZoom: 19,
          crossOrigin: true,
        }).addTo(map);

        tileLayerRef.current = layer;
        markersGroupRef.current = L.layerGroup().addTo(map);
        mapInstanceRef.current = map;

        // Fit bounds to all locations
        if (locations.length > 0) {
          const bounds = L.latLngBounds(locations.map(l => [l.lat, l.lng]));
          map.fitBounds(bounds, { padding: [35, 35], maxZoom: 11 });
        }

        setTimeout(() => {
          map.invalidateSize();
        }, 200);
      }
    }, 100);

    return () => {
      clearTimeout(timer);
    };
  }, [isOpen]);

  // 2. Update Map Markers when locations or active state changes
  useEffect(() => {
    if (!mapInstanceRef.current || !markersGroupRef.current) return;

    markersGroupRef.current.clearLayers();

    locations.forEach((loc) => {
      const isTersalurkan = loc.status === 'Tersalurkan';
      const pinColor = isTersalurkan ? '#059669' : '#d97706';
      const badgeBg = isTersalurkan ? '#10b981' : '#f59e0b';

      const customIcon = L.divIcon({
        className: 'export-custom-pin',
        html: `
          <div style="position: relative; display: flex; flex-direction: column; align-items: center; cursor: pointer; transform: translate(-50%, -100%);">
            <div style="
              background: #ffffff;
              color: #0f172a;
              font-family: system-ui, -apple-system, sans-serif;
              font-size: 10px;
              font-weight: 800;
              padding: 2px 7px;
              border-radius: 9999px;
              box-shadow: 0 4px 8px rgba(0,0,0,0.22);
              border: 1.5px solid ${pinColor};
              white-space: nowrap;
              margin-bottom: 3px;
              display: flex;
              align-items: center;
              gap: 4px;
            ">
              <span style="width: 6px; height: 6px; border-radius: 50%; background: ${badgeBg};"></span>
              <span>${loc.nama.length > 20 ? loc.nama.substring(0, 18) + '…' : loc.nama}</span>
              <span style="color: ${pinColor}; font-weight: 900;">(${loc.jumlahMushaf})</span>
            </div>
            <svg width="24" height="32" viewBox="0 0 24 32" fill="none" xmlns="http://www.w3.org/2000/svg" style="filter: drop-shadow(0 3px 5px rgba(0,0,0,0.3));">
              <path d="M12 0C5.37258 0 0 5.37258 0 12C0 21 12 32 12 32C12 32 24 21 24 12C24 5.37258 18.6274 0 12 0Z" fill="${pinColor}"/>
              <circle cx="12" cy="11" r="5" fill="#ffffff"/>
              <circle cx="12" cy="11" r="2.5" fill="${pinColor}"/>
            </svg>
          </div>
        `,
        iconSize: [30, 42],
        iconAnchor: [15, 42]
      });

      const marker = L.marker([loc.lat, loc.lng], { icon: customIcon });
      markersGroupRef.current?.addLayer(marker);
    });
  }, [locations, isOpen]);

  // 3. Update Tile Layer on tileSource change
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    if (tileLayerRef.current) {
      mapInstanceRef.current.removeLayer(tileLayerRef.current);
    }
    const newLayer = L.tileLayer(getTileUrl(tileSource), {
      maxZoom: 19,
      crossOrigin: true
    }).addTo(mapInstanceRef.current);
    tileLayerRef.current = newLayer;
  }, [tileSource]);

  // Handle re-center map view
  const handleRecenter = () => {
    if (!mapInstanceRef.current || locations.length === 0) return;
    const bounds = L.latLngBounds(locations.map(l => [l.lat, l.lng]));
    mapInstanceRef.current.fitBounds(bounds, { padding: [35, 35], maxZoom: 11 });
  };

  // =========================================================================
  // HIGH RESOLUTION CANVAS ENGINE FOR 100% RELIABLE DOWNLOAD & EXPORT
  // Generates sharp, professional 1800px wide image with real map tiles & pins
  // =========================================================================
  const generateExportCanvas = async (): Promise<HTMLCanvasElement> => {
    setExportProgressText('Menyiapkan tata letak kanvas...');

    const canvas = document.createElement('canvas');
    const width = 1800;

    // Height calculations
    const headerHeight = layoutMode === 'clean-map' ? 0 : 160;
    const kpiHeight = (showKpiMetrics && layoutMode !== 'clean-map') ? 130 : 0;
    const mapHeight = layoutMode === 'clean-map' ? 900 : 760;
    const tableRowHeight = 36;
    const tableRows = Math.min(locations.length, 8);
    const tableHeight = (showLocationTable && layoutMode !== 'clean-map') ? (60 + tableRows * tableRowHeight + 25) : 0;
    const footerHeight = layoutMode === 'clean-map' ? 0 : 54;

    const totalHeight = headerHeight + kpiHeight + mapHeight + tableHeight + footerHeight;
    canvas.width = width;
    canvas.height = totalHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Canvas context could not be created');

    // Smooth rendering
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    // 1. Draw Canvas Background
    const isDark = colorTheme === 'navy';
    ctx.fillStyle = isDark ? '#090d16' : '#ffffff';
    ctx.fillRect(0, 0, width, totalHeight);

    let currentY = 0;

    // 2. Draw Header (If not clean-map)
    if (layoutMode !== 'clean-map') {
      setExportProgressText('Merender kop resmi yayasan...');
      
      const grad = ctx.createLinearGradient(0, 0, width, headerHeight);
      if (colorTheme === 'emerald') {
        grad.addColorStop(0, '#064e3b');
        grad.addColorStop(0.5, '#0f766e');
        grad.addColorStop(1, '#064e3b');
      } else if (colorTheme === 'navy') {
        grad.addColorStop(0, '#030712');
        grad.addColorStop(0.6, '#0f172a');
        grad.addColorStop(1, '#1e293b');
      } else {
        grad.addColorStop(0, '#f1f5f9');
        grad.addColorStop(1, '#e2e8f0');
      }
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, headerHeight);

      // Gold bottom accent line
      ctx.fillStyle = colorTheme === 'clean-light' ? '#059669' : '#10b981';
      ctx.fillRect(0, headerHeight - 4, width, 4);

      // Logo YSB
      const logoSize = 80;
      const logoX = 50;
      const logoY = 40;
      
      ctx.fillStyle = '#10b981';
      ctx.beginPath();
      ctx.roundRect(logoX, logoY, logoSize, logoSize, 20);
      ctx.fill();

      ctx.fillStyle = '#0f172a';
      ctx.font = 'bold 36px system-ui, -apple-system, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('YSB', logoX + logoSize / 2, logoY + logoSize / 2);

      // Texts
      const isCleanLight = colorTheme === 'clean-light';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'top';

      // Sub-brand pill
      ctx.fillStyle = isCleanLight ? '#059669' : '#6ee7b7';
      ctx.font = 'bold 16px system-ui, -apple-system, sans-serif';
      ctx.fillText('YAYASAN SARANA BERBAGI • DIVISI PROGRAM', logoX + logoSize + 30, logoY + 4);

      // Main Title
      ctx.fillStyle = isCleanLight ? '#0f172a' : '#ffffff';
      ctx.font = '900 30px system-ui, -apple-system, sans-serif';
      ctx.fillText(reportTitle, logoX + logoSize + 30, logoY + 28);

      // Subtitle
      ctx.fillStyle = isCleanLight ? '#475569' : '#94a3b8';
      ctx.font = '500 17px system-ui, -apple-system, sans-serif';
      ctx.fillText(subTitle, logoX + logoSize + 30, logoY + 64);

      // Right Badges
      const rightX = width - 50;
      ctx.textAlign = 'right';
      
      // Tahun Anggaran Badge
      const badgeW = 220;
      const badgeH = 38;
      ctx.fillStyle = isCleanLight ? '#dcfce7' : 'rgba(16, 185, 129, 0.2)';
      ctx.beginPath();
      ctx.roundRect(rightX - badgeW, logoY + 6, badgeW, badgeH, 10);
      ctx.fill();

      ctx.fillStyle = isCleanLight ? '#15803d' : '#34d399';
      ctx.font = 'bold 16px system-ui, -apple-system, sans-serif';
      ctx.textBaseline = 'middle';
      ctx.fillText('Tahun Anggaran 2026', rightX - 20, logoY + 6 + badgeH / 2);

      // Date Updated
      ctx.fillStyle = isCleanLight ? '#64748b' : '#94a3b8';
      ctx.font = '13px system-ui, -apple-system, sans-serif';
      ctx.textBaseline = 'top';
      const todayStr = new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
      ctx.fillText(`Diperbarui: ${todayStr}`, rightX, logoY + 54);

      currentY += headerHeight;
    }

    // 3. Draw KPI Summary Cards (If enabled)
    if (showKpiMetrics && layoutMode !== 'clean-map') {
      setExportProgressText('Merender kartu statistik...');

      ctx.fillStyle = isDark ? '#0b1324' : '#f8fafc';
      ctx.fillRect(0, currentY, width, kpiHeight);

      // 4 cards across width
      const cardMargin = 50;
      const cardGap = 24;
      const numCards = 4;
      const cardW = (width - (cardMargin * 2) - (cardGap * (numCards - 1))) / numCards;
      const cardH = 92;
      const cardY = currentY + 19;

      const cardsData = [
        { label: 'TOTAL MUSHAF WAKAF', val: `${totalMushaf.toLocaleString('id-ID')} Mushaf`, color: '#059669', sub: 'Target Wilayah Jabar' },
        { label: 'TOTAL TITIK DISTRIBUSI', val: `${totalTitik} Lokasi`, color: isDark ? '#f8fafc' : '#0f172a', sub: 'Lembaga & Pesantren' },
        { label: 'STATUS PENYALURAN', val: `${tersalurkanCount} Salur • ${terjadwalCount} Jadwal`, color: '#0284c7', sub: 'Realisasi Berjalan' },
        { label: 'WILAYAH CAKUPAN', val: uniqueWilayah.slice(0, 4).join(', '), color: '#d97706', sub: `${uniqueWilayah.length} Kabupaten / Kota` },
      ];

      cardsData.forEach((c, idx) => {
        const cx = cardMargin + idx * (cardW + cardGap);
        ctx.fillStyle = isDark ? '#1e293b' : '#ffffff';
        ctx.beginPath();
        ctx.roundRect(cx, cardY, cardW, cardH, 14);
        ctx.fill();

        ctx.strokeStyle = isDark ? '#334155' : '#e2e8f0';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Label
        ctx.textAlign = 'left';
        ctx.fillStyle = isDark ? '#94a3b8' : '#64748b';
        ctx.font = 'bold 12px system-ui, -apple-system, sans-serif';
        ctx.fillText(c.label, cx + 18, cardY + 22);

        // Value
        ctx.fillStyle = c.color;
        ctx.font = 'bold 22px system-ui, -apple-system, sans-serif';
        ctx.fillText(c.val, cx + 18, cardY + 52);

        // Sub
        ctx.fillStyle = isDark ? '#64748b' : '#94a3b8';
        ctx.font = '12px system-ui, -apple-system, sans-serif';
        ctx.fillText(c.sub, cx + 18, cardY + 76);
      });

      currentY += kpiHeight;
    }

    // 4. Draw Real Map with Web Mercator Tiles
    setExportProgressText('Mengunduh dan merender peta riil Jawa Barat...');
    const mapY = currentY;

    // Fill map background
    ctx.fillStyle = isDark ? '#020617' : '#e2e8f0';
    ctx.fillRect(0, mapY, width, mapHeight);

    // Calculate map bounds and center
    const lats = locations.map(l => l.lat);
    const lngs = locations.map(l => l.lng);
    const centerLat = lats.length > 0 ? (Math.min(...lats) + Math.max(...lats)) / 2 : -6.95;
    const centerLng = lngs.length > 0 ? (Math.min(...lngs) + Math.max(...lngs)) / 2 : 107.5;
    const zoom = 9;

    // Web Mercator projection helpers
    const projectLng = (lng: number, z: number) => ((lng + 180) / 360) * Math.pow(2, z) * 256;
    const projectLat = (lat: number, z: number) => {
      const sin = Math.sin((lat * Math.PI) / 180);
      const y = 0.5 - Math.log((1 + sin) / (1 - sin)) / (4 * Math.PI);
      return y * Math.pow(2, z) * 256;
    };

    const centerWorldX = projectLng(centerLng, zoom);
    const centerWorldY = projectLat(centerLat, zoom);

    const mapOriginX = centerWorldX - width / 2;
    const mapOriginY = centerWorldY - mapHeight / 2;

    const minTileX = Math.floor(mapOriginX / 256);
    const maxTileX = Math.floor((mapOriginX + width) / 256);
    const minTileY = Math.floor(mapOriginY / 256);
    const maxTileY = Math.floor((mapOriginY + mapHeight) / 256);

    // Helper to fetch tile with crossOrigin and timeout
    const fetchTileImage = (tileX: number, tileY: number, z: number): Promise<HTMLImageElement | null> => {
      return new Promise((resolve) => {
        let url = `https://tile.openstreetmap.org/${z}/${tileX}/${tileY}.png`;
        if (tileSource === 'satellite') {
          url = `https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/${z}/${tileY}/${tileX}`;
        } else if (tileSource === 'carto') {
          const subdomains = ['a', 'b', 'c', 'd'];
          const sub = subdomains[(tileX + tileY) % subdomains.length];
          url = `https://${sub}.basemaps.cartocdn.com/rastertiles/voyager/${z}/${tileX}/${tileY}.png`;
        } else if (tileSource === 'topo') {
          url = `https://tile.opentopomap.org/${z}/${tileX}/${tileY}.png`;
        }

        const img = new Image();
        img.crossOrigin = 'anonymous';
        const timeout = setTimeout(() => {
          resolve(null);
        }, 3500);

        img.onload = () => {
          clearTimeout(timeout);
          resolve(img);
        };
        img.onerror = () => {
          clearTimeout(timeout);
          resolve(null);
        };
        img.src = url;
      });
    };

    // Load and draw all needed tiles
    const tilePromises: Promise<{ img: HTMLImageElement | null; x: number; y: number }>[] = [];
    for (let tx = minTileX; tx <= maxTileX; tx++) {
      for (let ty = minTileY; ty <= maxTileY; ty++) {
        tilePromises.push(
          fetchTileImage(tx, ty, zoom).then((img) => ({
            img,
            x: tx * 256 - mapOriginX,
            y: ty * 256 - mapOriginY + mapY
          }))
        );
      }
    }

    const loadedTiles = await Promise.all(tilePromises);
    loadedTiles.forEach(({ img, x, y }) => {
      if (img) {
        ctx.drawImage(img, x, y, 256, 256);
      } else {
        // Fallback grid if tile network failed
        ctx.strokeStyle = '#cbd5e1';
        ctx.strokeRect(x, y, 256, 256);
      }
    });

    // 5. Draw Decorative Overlays: Compass Rose & Scale
    // Compass
    const compassX = width - 80;
    const compassY = mapY + 60;
    ctx.save();
    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.beginPath();
    ctx.arc(compassX, compassY, 26, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#059669';
    ctx.lineWidth = 2;
    ctx.stroke();

    // North arrow
    ctx.fillStyle = '#dc2626';
    ctx.beginPath();
    ctx.moveTo(compassX, compassY - 18);
    ctx.lineTo(compassX - 6, compassY + 4);
    ctx.lineTo(compassX + 6, compassY + 4);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = '#1e293b';
    ctx.beginPath();
    ctx.moveTo(compassX, compassY + 18);
    ctx.lineTo(compassX - 6, compassY + 4);
    ctx.lineTo(compassX + 6, compassY + 4);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 12px system-ui, -apple-system, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('U', compassX, compassY - 20);
    ctx.restore();

    // Scale Bar
    const scaleX = 60;
    const scaleY = mapY + mapHeight - 40;
    ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
    ctx.fillRect(scaleX - 10, scaleY - 24, 150, 36);
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(scaleX, scaleY);
    ctx.lineTo(scaleX + 130, scaleY);
    ctx.moveTo(scaleX, scaleY - 6);
    ctx.lineTo(scaleX, scaleY + 6);
    ctx.moveTo(scaleX + 65, scaleY - 4);
    ctx.lineTo(scaleX + 65, scaleY + 4);
    ctx.moveTo(scaleX + 130, scaleY - 6);
    ctx.lineTo(scaleX + 130, scaleY + 6);
    ctx.stroke();

    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 11px system-ui, -apple-system, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('0', scaleX, scaleY - 8);
    ctx.fillText('15 km', scaleX + 65, scaleY - 8);
    ctx.fillText('30 km', scaleX + 130, scaleY - 8);

    // 6. Draw All 12 Location Pins on the Map
    setExportProgressText('Menempatkan pin titik distribusi...');
    locations.forEach((loc) => {
      const px = projectLng(loc.lng, zoom) - mapOriginX;
      const py = projectLat(loc.lat, zoom) - mapOriginY + mapY;

      const isTersalurkan = loc.status === 'Tersalurkan';
      const pinColor = isTersalurkan ? '#059669' : '#d97706';

      // Pin Pinhead shadow
      ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
      ctx.beginPath();
      ctx.ellipse(px, py + 2, 8, 4, 0, 0, Math.PI * 2);
      ctx.fill();

      // Draw vector Pin
      const pinW = 28;
      const pinH = 38;
      const pinTopY = py - pinH;

      ctx.fillStyle = pinColor;
      ctx.beginPath();
      ctx.moveTo(px, py);
      ctx.bezierCurveTo(px - pinW / 2, py - pinH * 0.4, px - pinW / 2, pinTopY, px, pinTopY);
      ctx.bezierCurveTo(px + pinW / 2, pinTopY, px + pinW / 2, py - pinH * 0.4, px, py);
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Pin center dot
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(px, pinTopY + pinW / 2, 6, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = pinColor;
      ctx.beginPath();
      ctx.arc(px, pinTopY + pinW / 2, 3, 0, Math.PI * 2);
      ctx.fill();

      // Draw Location Name Label Pill
      const labelText = `${loc.nama} (${loc.jumlahMushaf})`;
      ctx.font = 'bold 12px system-ui, -apple-system, sans-serif';
      const textMetrics = ctx.measureText(labelText);
      const labelWidth = textMetrics.width + 20;
      const labelHeight = 24;
      const labelX = px - labelWidth / 2;
      const labelY = pinTopY - labelHeight - 4;

      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.roundRect(labelX, labelY, labelWidth, labelHeight, 12);
      ctx.fill();
      ctx.strokeStyle = pinColor;
      ctx.lineWidth = 1.5;
      ctx.stroke();

      ctx.fillStyle = '#0f172a';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(labelText, px, labelY + labelHeight / 2);
    });

    currentY += mapHeight;

    // 7. Draw Location Detail Table (If enabled)
    if (showLocationTable && layoutMode !== 'clean-map') {
      setExportProgressText('Merender tabel direktori titik lokasi...');

      ctx.fillStyle = isDark ? '#090d16' : '#ffffff';
      ctx.fillRect(0, currentY, width, tableHeight);

      // Section Title
      ctx.fillStyle = isDark ? '#34d399' : '#059669';
      ctx.font = 'bold 16px system-ui, -apple-system, sans-serif';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'top';
      ctx.fillText('DIREKTORI TITIK PENYALURAN WAKAF AL-QUR\'AN JAWA BARAT', 50, currentY + 16);

      // Table Header
      const tableY = currentY + 44;
      ctx.fillStyle = isDark ? '#1e293b' : '#f1f5f9';
      ctx.fillRect(50, tableY, width - 100, 32);

      const colX = {
        no: 70,
        nama: 120,
        wilayah: 600,
        mushaf: 900,
        status: 1150,
        pic: 1400
      };

      ctx.fillStyle = isDark ? '#94a3b8' : '#475569';
      ctx.font = 'bold 12px system-ui, -apple-system, sans-serif';
      ctx.textBaseline = 'middle';
      ctx.fillText('NO', colX.no, tableY + 16);
      ctx.fillText('NAMA LEMBAGA / PESANTREN', colX.nama, tableY + 16);
      ctx.fillText('KABUPATEN / KOTA', colX.wilayah, tableY + 16);
      ctx.fillText('ALOKASI MUSHAF', colX.mushaf, tableY + 16);
      ctx.fillText('STATUS', colX.status, tableY + 16);
      ctx.fillText('PENANGGUNG JAWAB (PIC)', colX.pic, tableY + 16);

      // Table Rows (up to 8 rows shown)
      locations.slice(0, 8).forEach((loc, idx) => {
        const rowY = tableY + 32 + idx * tableRowHeight;
        if (idx % 2 === 1) {
          ctx.fillStyle = isDark ? 'rgba(30, 41, 59, 0.4)' : '#f8fafc';
          ctx.fillRect(50, rowY, width - 100, tableRowHeight);
        }

        ctx.strokeStyle = isDark ? '#1e293b' : '#e2e8f0';
        ctx.lineWidth = 1;
        ctx.strokeRect(50, rowY, width - 100, tableRowHeight);

        ctx.fillStyle = isDark ? '#e2e8f0' : '#1e293b';
        ctx.font = '500 13px system-ui, -apple-system, sans-serif';
        ctx.fillText(String(idx + 1), colX.no, rowY + tableRowHeight / 2);
        ctx.fillText(loc.nama, colX.nama, rowY + tableRowHeight / 2);
        ctx.fillText(loc.wilayah, colX.wilayah, rowY + tableRowHeight / 2);
        
        ctx.fillStyle = '#059669';
        ctx.font = 'bold 13px system-ui, -apple-system, sans-serif';
        ctx.fillText(`${loc.jumlahMushaf} Mushaf`, colX.mushaf, rowY + tableRowHeight / 2);

        // Status Badge
        const isTersalur = loc.status === 'Tersalurkan';
        ctx.fillStyle = isTersalur ? '#10b981' : '#f59e0b';
        ctx.font = 'bold 12px system-ui, -apple-system, sans-serif';
        ctx.fillText(loc.status, colX.status, rowY + tableRowHeight / 2);

        ctx.fillStyle = isDark ? '#94a3b8' : '#64748b';
        ctx.font = '13px system-ui, -apple-system, sans-serif';
        ctx.fillText(loc.pic, colX.pic, rowY + tableRowHeight / 2);
      });

      currentY += tableHeight;
    }

    // 8. Draw Official Document Footer
    if (layoutMode !== 'clean-map') {
      ctx.fillStyle = isDark ? '#020617' : '#f1f5f9';
      ctx.fillRect(0, currentY, width, footerHeight);

      ctx.strokeStyle = isDark ? '#1e293b' : '#cbd5e1';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, currentY);
      ctx.lineTo(width, currentY);
      ctx.stroke();

      ctx.fillStyle = isDark ? '#94a3b8' : '#64748b';
      ctx.font = 'bold 12px system-ui, -apple-system, sans-serif';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      ctx.fillText('DOKUMEN RESMI DIVISI PROGRAM • YAYASAN SARANA BERBAGI (YSB)', 50, currentY + footerHeight / 2);

      ctx.textAlign = 'right';
      ctx.font = 'mono 12px system-ui, -apple-system, sans-serif';
      ctx.fillText('KODE DOKUMEN: YSB-MAP-JABAR-2026 • TERVERIFIKASI SISTEM', width - 50, currentY + footerHeight / 2);
    }

    return canvas;
  };

  // =========================================================================
  // ACTIONS: UNDUH PNG, UNDUH PDF, SALIN CLIPBOARD
  // =========================================================================

  // Direct trigger download helper
  const triggerDownload = (dataUrl: string, filename: string) => {
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  // 1. Download PNG HD
  const handleDownloadImage = async () => {
    if (isExporting) return;
    setIsExporting(true);
    setExportProgressText('Mempersiapkan gambar HD...');

    // Safety failsafe to ensure button NEVER stays disabled
    const failsafe = setTimeout(() => {
      setIsExporting(false);
    }, 10000);

    try {
      const canvas = await generateExportCanvas();
      const safeName = reportTitle.toLowerCase().replace(/[^a-z0-9]/g, '_').slice(0, 35);
      const filename = `${safeName}_ysb_2026.png`;
      const dataUrl = canvas.toDataURL('image/png', 1.0);
      
      triggerDownload(dataUrl, filename);

      if (onNotify) {
        onNotify('Gambar Peta Sebaran (PNG HD) berhasil diunduh! Siap dimasukkan ke laporan atau slide Anda.');
      }
    } catch (err) {
      console.error('Download PNG failed:', err);
      if (onNotify) onNotify('Terjadi kendala saat membuat gambar. Silakan coba lagi.');
    } finally {
      clearTimeout(failsafe);
      setIsExporting(false);
      setExportProgressText('');
    }
  };

  // 2. Download PDF A4 Landscape
  const handleDownloadPdf = async () => {
    if (isExporting) return;
    setIsExporting(true);
    setExportProgressText('Mempersiapkan berkas PDF A4...');

    const failsafe = setTimeout(() => {
      setIsExporting(false);
    }, 10000);

    try {
      const canvas = await generateExportCanvas();
      const imgData = canvas.toDataURL('image/jpeg', 0.95);

      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4'
      });

      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();

      // Fit with 10mm margins
      const margin = 10;
      const usableW = pageWidth - margin * 2;
      const usableH = pageHeight - margin * 2;

      let drawW = usableW;
      let drawH = (canvas.height * usableW) / canvas.width;

      if (drawH > usableH) {
        drawH = usableH;
        drawW = (canvas.width * usableH) / canvas.height;
      }

      const posX = margin + (usableW - drawW) / 2;
      const posY = margin + (usableH - drawH) / 2;

      pdf.addImage(imgData, 'JPEG', posX, posY, drawW, drawH);
      
      const safeName = reportTitle.toLowerCase().replace(/[^a-z0-9]/g, '_').slice(0, 35);
      pdf.save(`${safeName}_laporan_ysb.pdf`);

      if (onNotify) {
        onNotify('Dokumen PDF Laporan Peta berhasil diunduh (A4 Landscape)!');
      }
    } catch (err) {
      console.error('Download PDF failed:', err);
      if (onNotify) onNotify('Gagal membuat berkas PDF. Silakan coba kembali.');
    } finally {
      clearTimeout(failsafe);
      setIsExporting(false);
      setExportProgressText('');
    }
  };

  // 3. Copy to Clipboard (Ctrl + V to Word / PPT)
  const handleCopyToClipboard = async () => {
    if (isExporting) return;
    setIsExporting(true);
    setExportProgressText('Menyalin gambar peta...');

    const failsafe = setTimeout(() => {
      setIsExporting(false);
    }, 10000);

    try {
      const canvas = await generateExportCanvas();
      
      canvas.toBlob(async (blob) => {
        if (!blob) {
          throw new Error('Blob generation failed');
        }

        try {
          if (navigator.clipboard && navigator.clipboard.write) {
            await navigator.clipboard.write([
              new ClipboardItem({ 'image/png': blob })
            ]);
            setCopiedSuccess(true);
            setTimeout(() => setCopiedSuccess(false), 4000);
            if (onNotify) {
              onNotify('Gambar peta berhasil disalin! Tekan Ctrl + V di Word atau PowerPoint Anda.');
            }
          } else {
            throw new Error('Clipboard API not available');
          }
        } catch (clipErr) {
          // Graceful fallback: If browser/iframe blocks clipboard, auto download PNG
          console.warn('Clipboard write restricted by browser context, auto downloading PNG instead:', clipErr);
          const safeName = reportTitle.toLowerCase().replace(/[^a-z0-9]/g, '_').slice(0, 35);
          triggerDownload(canvas.toDataURL('image/png', 1.0), `${safeName}_ysb_2026.png`);
          if (onNotify) {
            onNotify('Izin clipboard browser dibatasi dalam pratinjau. Berkas PNG HD otomatis diunduh untuk laporan Anda!');
          }
        } finally {
          clearTimeout(failsafe);
          setIsExporting(false);
          setExportProgressText('');
        }
      }, 'image/png');

    } catch (err) {
      console.error('Copy to clipboard failed:', err);
      clearTimeout(failsafe);
      setIsExporting(false);
      setExportProgressText('');
      if (onNotify) onNotify('Gunakan tombol "Unduh PNG HD" untuk mengunduh gambar laporan.');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 font-sans animate-in fade-in duration-200">
      <div className="relative w-full max-w-6xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[94vh]">
        
        {/* Modal Top Bar */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 text-white flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-300">
              <Download className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black tracking-tight flex items-center gap-2">
                <span>Unduh Peta & Generator Infografis Laporan</span>
                <span className="text-[10px] bg-emerald-500/30 text-emerald-200 border border-emerald-400/30 font-bold px-2 py-0.5 rounded-full">
                  Peta Riil Jawa Barat
                </span>
              </h2>
              <p className="text-xs text-emerald-100/80">
                Ekspor peta sebaran menjadi gambar beresolusi tinggi, infografis resmi, atau dokumen PDF
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-300 hover:text-white hover:bg-white/10 p-2 rounded-xl transition-all"
            title="Tutup Modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content: Controls on Left / Top, Live Map Preview on Right */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 bg-slate-50/50">
          
          {/* Settings & Customization Panel (4 Cols) */}
          <div className="lg:col-span-4 space-y-4">
            
            {/* 1. Quick Download Action Card */}
            <div className="bg-white p-4 rounded-2xl border border-emerald-200 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-black uppercase tracking-wider text-emerald-800 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Aksi Cepat Unduh</span>
                </h3>
                {isExporting && (
                  <span className="flex items-center gap-1 text-[11px] text-emerald-700 font-bold animate-pulse">
                    <Loader2 className="w-3 h-3 animate-spin" /> {exportProgressText || 'Memproses...'}
                  </span>
                )}
              </div>

              {/* Instant Copy to Clipboard Button (Ctrl + V to Word / PPT) */}
              <button
                onClick={handleCopyToClipboard}
                disabled={isExporting}
                className="w-full py-2.5 px-3 bg-emerald-700 hover:bg-emerald-800 active:scale-[0.99] disabled:opacity-50 text-white font-extrabold text-xs rounded-xl shadow-md shadow-emerald-700/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
                title="Salin gambar langsung ke clipboard untuk ditempel di Word atau PowerPoint"
              >
                {copiedSuccess ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-300" />
                    <span>Tersalin ke Clipboard! (Ctrl + V)</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    <span>Salin Gambar Peta (Ctrl + V ke Word/PPT)</span>
                  </>
                )}
              </button>

              <div className="grid grid-cols-2 gap-2">
                {/* PNG HD Download */}
                <button
                  onClick={handleDownloadImage}
                  disabled={isExporting}
                  className="py-2 px-3 bg-slate-900 hover:bg-slate-800 active:scale-[0.99] disabled:opacity-50 text-white font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
                  title="Unduh format PNG kualitas tinggi 300 DPI"
                >
                  <ImageIcon className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Unduh PNG HD</span>
                </button>

                {/* PDF Report Download */}
                <button
                  onClick={handleDownloadPdf}
                  disabled={isExporting}
                  className="py-2 px-3 bg-slate-100 hover:bg-slate-200 active:scale-[0.99] disabled:opacity-50 border border-slate-300 text-slate-800 font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  title="Unduh lembar dokumen PDF A4 Landscape"
                >
                  <FileText className="w-3.5 h-3.5 text-emerald-700" />
                  <span>Unduh PDF A4</span>
                </button>
              </div>

              <p className="text-[11px] text-slate-500 italic text-center">
                *Peta riil resolusi tajam, tidak akan pecah saat dimasukkan ke laporan cetak.
              </p>
            </div>

            {/* 2. Format Layout Selector */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-3">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-emerald-600" />
                <span>Format Layout Tampilan</span>
              </h3>

              <div className="grid grid-cols-3 gap-1.5 bg-slate-100 p-1 rounded-xl text-xs font-bold">
                <button
                  type="button"
                  onClick={() => setLayoutMode('infographic')}
                  className={`py-2 px-2 rounded-lg transition-all text-center ${
                    layoutMode === 'infographic'
                      ? 'bg-white text-emerald-800 shadow-xs font-black'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Infografis
                </button>
                <button
                  type="button"
                  onClick={() => setLayoutMode('clean-map')}
                  className={`py-2 px-2 rounded-lg transition-all text-center ${
                    layoutMode === 'clean-map'
                      ? 'bg-white text-emerald-800 shadow-xs font-black'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                  title="Hanya peta bersih tanpa kop surat / tabel, cocok untuk ilustrasi dokumen Word"
                >
                  Peta Bersih
                </button>
                <button
                  type="button"
                  onClick={() => setLayoutMode('report-sheet')}
                  className={`py-2 px-2 rounded-lg transition-all text-center ${
                    layoutMode === 'report-sheet'
                      ? 'bg-white text-emerald-800 shadow-xs font-black'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Dokumen
                </button>
              </div>

              {/* Tile Layer Selector */}
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1.5 flex items-center gap-1">
                  <Layers className="w-3 h-3 text-slate-500" />
                  <span>Pilihan Jenis Peta (Map Layer)</span>
                </label>
                <div className="grid grid-cols-2 gap-1.5 text-xs font-bold">
                  <button
                    type="button"
                    onClick={() => setTileSource('osm')}
                    className={`py-1.5 px-2.5 rounded-lg border text-left flex items-center gap-1.5 transition-all ${
                      tileSource === 'osm'
                        ? 'border-emerald-600 bg-emerald-50 text-emerald-900 font-black'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <span>🗺️</span>
                    <span>Standar (OSM)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setTileSource('carto')}
                    className={`py-1.5 px-2.5 rounded-lg border text-left flex items-center gap-1.5 transition-all ${
                      tileSource === 'carto'
                        ? 'border-emerald-600 bg-emerald-50 text-emerald-900 font-black'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <span>🎨</span>
                    <span>Carto Bersih</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setTileSource('satellite')}
                    className={`py-1.5 px-2.5 rounded-lg border text-left flex items-center gap-1.5 transition-all ${
                      tileSource === 'satellite'
                        ? 'border-emerald-600 bg-emerald-50 text-emerald-900 font-black'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <span>🛰️</span>
                    <span>Satelit Bumi</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setTileSource('topo')}
                    className={`py-1.5 px-2.5 rounded-lg border text-left flex items-center gap-1.5 transition-all ${
                      tileSource === 'topo'
                        ? 'border-emerald-600 bg-emerald-50 text-emerald-900 font-black'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <span>⛰️</span>
                    <span>Topografi</span>
                  </button>
                </div>
              </div>

              {/* Theme Color Picker */}
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1.5 flex items-center gap-1">
                  <Palette className="w-3 h-3 text-slate-500" />
                  <span>Tema Warna Visual</span>
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setColorTheme('emerald')}
                    className={`py-1.5 px-2 rounded-xl text-xs font-bold border transition-all flex items-center justify-center gap-1.5 ${
                      colorTheme === 'emerald'
                        ? 'border-emerald-600 bg-emerald-50 text-emerald-900 font-black ring-1 ring-emerald-500'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-600"></span>
                    <span>Emerald YSB</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setColorTheme('clean-light')}
                    className={`py-1.5 px-2 rounded-xl text-xs font-bold border transition-all flex items-center justify-center gap-1.5 ${
                      colorTheme === 'clean-light'
                        ? 'border-slate-400 bg-slate-100 text-slate-900 font-black ring-1 ring-slate-400'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <span className="w-2.5 h-2.5 rounded-full bg-slate-300 border border-slate-400"></span>
                    <span>Putih Bersih</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setColorTheme('navy')}
                    className={`py-1.5 px-2 rounded-xl text-xs font-bold border transition-all flex items-center justify-center gap-1.5 ${
                      colorTheme === 'navy'
                        ? 'border-slate-800 bg-slate-900 text-white font-black ring-1 ring-teal-400'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <span className="w-2.5 h-2.5 rounded-full bg-slate-900 border border-teal-400"></span>
                    <span>Dark Navy</span>
                  </button>
                </div>
              </div>

              {/* Title Inputs */}
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">
                  Judul Infografis / Dokumen Laporan
                </label>
                <input
                  type="text"
                  value={reportTitle}
                  onChange={(e) => setReportTitle(e.target.value)}
                  className="w-full text-xs font-bold p-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">
                  Sub-Judul & Divisi
                </label>
                <input
                  type="text"
                  value={subTitle}
                  onChange={(e) => setSubTitle(e.target.value)}
                  className="w-full text-xs p-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {/* Toggles */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <label className="flex items-center justify-between text-xs text-slate-700 cursor-pointer">
                  <span>Tampilkan Kartu Metrik (Total Mushaf/Titik)</span>
                  <input
                    type="checkbox"
                    checked={showKpiMetrics}
                    onChange={(e) => setShowKpiMetrics(e.target.checked)}
                    className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4 cursor-pointer"
                  />
                </label>
                <label className="flex items-center justify-between text-xs text-slate-700 cursor-pointer">
                  <span>Tampilkan Tabel Rincian Titik Lokasi</span>
                  <input
                    type="checkbox"
                    checked={showLocationTable}
                    onChange={(e) => setShowLocationTable(e.target.checked)}
                    className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4 cursor-pointer"
                  />
                </label>
              </div>

            </div>

          </div>

          {/* Infographic / Map Preview Canvas (8 Cols) */}
          <div className="lg:col-span-8 flex flex-col items-center">
            
            <div className="w-full mb-2 flex items-center justify-between text-xs font-semibold text-slate-500 px-1">
              <span className="flex items-center gap-1.5">
                <Eye className="w-3.5 h-3.5 text-emerald-600" />
                <span>Pratinjau Peta Riil Jawa Barat & Laporan Ekspor:</span>
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleRecenter}
                  className="text-[11px] text-emerald-700 hover:text-emerald-800 font-bold flex items-center gap-1 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200"
                  title="Pusatkan kembali ke seluruh titik Jawa Barat"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Pusatkan Peta</span>
                </button>
                <span className="text-[11px] bg-slate-200/70 px-2 py-0.5 rounded-md font-mono">
                  {locations.length} Titik Sebaran
                </span>
              </div>
            </div>

            {/* LIVE PREVIEW CONTAINER */}
            <div className="w-full rounded-2xl shadow-xl overflow-hidden border border-slate-200 bg-white transition-all">
              
              {/* Executive Header Preview */}
              {layoutMode !== 'clean-map' && (
                <div className={`p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-white ${
                  colorTheme === 'emerald'
                    ? 'bg-gradient-to-r from-emerald-900 via-teal-900 to-emerald-950'
                    : colorTheme === 'navy'
                    ? 'bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950'
                    : 'bg-slate-100 text-slate-900 border-b border-slate-200'
                }`}>
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-xl bg-emerald-500 text-slate-950 flex items-center justify-center font-black text-lg shadow-md shrink-0">
                      YSB
                    </div>
                    <div>
                      <div className={`inline-flex items-center gap-1 text-[10px] font-bold ${
                        colorTheme === 'clean-light' ? 'text-emerald-700' : 'text-emerald-300'
                      }`}>
                        <ShieldCheck className="w-3 h-3" />
                        <span>Yayasan Sarana Berbagi</span>
                      </div>
                      <h1 className={`text-sm sm:text-base font-black tracking-tight ${
                        colorTheme === 'clean-light' ? 'text-slate-900' : 'text-white'
                      }`}>
                        {reportTitle}
                      </h1>
                      <p className={`text-xs ${
                        colorTheme === 'clean-light' ? 'text-slate-500' : 'text-slate-300'
                      }`}>
                        {subTitle}
                      </p>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="inline-block px-2.5 py-0.5 rounded-lg bg-emerald-500/20 text-emerald-400 font-bold text-xs border border-emerald-400/30">
                      Tahun Anggaran 2026
                    </span>
                  </div>
                </div>
              )}

              {/* KPI Metrics Summary Bar */}
              {showKpiMetrics && layoutMode !== 'clean-map' && (
                <div className="p-3 sm:p-4 border-b border-slate-200 grid grid-cols-2 sm:grid-cols-4 gap-2.5 bg-slate-50/80">
                  <div className="p-2.5 bg-white rounded-xl border border-slate-200">
                    <p className="text-[10px] uppercase font-bold text-slate-500">Total Mushaf</p>
                    <p className="text-base sm:text-lg font-black text-emerald-700">
                      {totalMushaf.toLocaleString('id-ID')} <span className="text-xs font-semibold text-slate-500">Mushaf</span>
                    </p>
                  </div>

                  <div className="p-2.5 bg-white rounded-xl border border-slate-200">
                    <p className="text-[10px] uppercase font-bold text-slate-500">Total Titik</p>
                    <p className="text-base sm:text-lg font-black text-slate-900">
                      {totalTitik} <span className="text-xs font-semibold text-slate-500">Lokasi</span>
                    </p>
                  </div>

                  <div className="p-2.5 bg-white rounded-xl border border-slate-200">
                    <p className="text-[10px] uppercase font-bold text-slate-500">Status Penyaluran</p>
                    <div className="flex items-center gap-1.5 mt-0.5 text-xs font-bold">
                      <span className="text-emerald-700">{tersalurkanCount} Salur</span>
                      <span className="text-slate-300">•</span>
                      <span className="text-amber-600">{terjadwalCount} Jadwal</span>
                    </div>
                  </div>

                  <div className="p-2.5 bg-white rounded-xl border border-slate-200">
                    <p className="text-[10px] uppercase font-bold text-slate-500">Wilayah</p>
                    <p className="text-xs font-bold text-slate-800 truncate mt-1">
                      {uniqueWilayah.slice(0, 3).join(', ')}
                    </p>
                  </div>
                </div>
              )}

              {/* REAL LEAFLET MAP CONTAINER */}
              <div className="relative w-full bg-slate-100">
                <div 
                  ref={mapPreviewRef}
                  className="w-full h-[360px] sm:h-[420px] z-10"
                  style={{ width: '100%' }}
                />

                {/* Map Type Badge floating */}
                <div className="absolute top-3 right-3 z-20 bg-white/90 backdrop-blur-xs px-2.5 py-1 rounded-lg border border-slate-300 text-[11px] font-bold text-slate-700 shadow-sm flex items-center gap-1">
                  <span>Peta Riil:</span>
                  <span className="text-emerald-700 font-extrabold capitalize">{tileSource.toUpperCase()}</span>
                </div>
              </div>

              {/* Location Detail Table */}
              {showLocationTable && layoutMode !== 'clean-map' && (
                <div className="p-4 bg-white border-t border-slate-200">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Rincian Titik Distribusi Jawa Barat</span>
                    </h4>
                    <span className="text-[10px] text-slate-400">
                      Menampilkan {Math.min(locations.length, 6)} dari {locations.length} titik
                    </span>
                  </div>

                  <div className="overflow-x-auto rounded-xl border border-slate-200 text-xs">
                    <table className="w-full text-left">
                      <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
                        <tr>
                          <th className="py-2 px-3">No</th>
                          <th className="py-2 px-3">Lembaga / Pesantren</th>
                          <th className="py-2 px-3">Wilayah</th>
                          <th className="py-2 px-3">Alokasi</th>
                          <th className="py-2 px-3">Status</th>
                          <th className="py-2 px-3">PIC</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {locations.slice(0, 6).map((loc, idx) => (
                          <tr key={loc.id || idx} className="hover:bg-slate-50/60">
                            <td className="py-1.5 px-3 font-semibold text-slate-500">{idx + 1}</td>
                            <td className="py-1.5 px-3 font-bold text-slate-900">{loc.nama}</td>
                            <td className="py-1.5 px-3 text-slate-600">{loc.wilayah}</td>
                            <td className="py-1.5 px-3 font-black text-emerald-700">{loc.jumlahMushaf} Mushaf</td>
                            <td className="py-1.5 px-3">
                              <span className={`inline-block text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                                loc.status === 'Tersalurkan' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                              }`}>
                                {loc.status}
                              </span>
                            </td>
                            <td className="py-1.5 px-3 text-slate-600">{loc.pic}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Official Document Footer */}
              {layoutMode !== 'clean-map' && (
                <div className="px-5 py-3 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-500 gap-2">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span>Dokumen Laporan Resmi Divisi Program • Yayasan Sarana Berbagi</span>
                  </div>
                  <span className="font-mono text-[10px]">
                    ID: YSB-MAP-2026 • Valid & Terverifikasi
                  </span>
                </div>
              )}

            </div>

          </div>

        </div>

        {/* Modal Bottom Bar */}
        <div className="p-4 bg-white border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <p className="text-xs text-slate-500 text-center sm:text-left">
            💡 <strong>Tips:</strong> Klik tombol <strong>Unduh PNG HD</strong> untuk menyimpan berkas gambar atau <strong>Salin ke Clipboard</strong> untuk langsung paste (Ctrl+V) ke PowerPoint/Word.
          </p>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              onClick={onClose}
              className="py-2 px-4 rounded-xl border border-slate-300 text-slate-700 font-bold text-xs hover:bg-slate-50 transition-all cursor-pointer"
            >
              Tutup
            </button>
            <button
              onClick={handleCopyToClipboard}
              disabled={isExporting}
              className="py-2 px-4 rounded-xl bg-emerald-700 hover:bg-emerald-800 active:scale-[0.99] disabled:opacity-50 text-white font-extrabold text-xs shadow-md shadow-emerald-700/20 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>Salin ke Clipboard (Ctrl+V)</span>
            </button>
            <button
              onClick={handleDownloadImage}
              disabled={isExporting}
              className="py-2 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 active:scale-[0.99] disabled:opacity-50 text-white font-extrabold text-xs shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Unduh Berkas Gambar HD</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
