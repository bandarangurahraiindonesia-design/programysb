import React from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, LineChart, Line, CartesianGrid, Legend 
} from 'recharts';
import { BarChart3, TrendingUp, PieChart as PieIcon, Award, CheckCircle2, MapPin, Sparkles } from 'lucide-react';
import { YearlyPlans, DistributionLocation } from '../types';

interface AnalyticsViewProps {
  yearlyPlans: YearlyPlans;
  locations: DistributionLocation[];
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({ yearlyPlans, locations }) => {
  // Aggregate data per region
  const regionMap: Record<string, number> = {};
  locations.forEach(loc => {
    regionMap[loc.wilayah] = (regionMap[loc.wilayah] || 0) + loc.jumlahMushaf;
  });

  const regionData = Object.keys(regionMap).map(region => ({
    name: region,
    mushaf: regionMap[region]
  })).sort((a, b) => b.mushaf - a.mushaf);

  // 12 Months comparison data
  const monthsList = Object.keys(yearlyPlans) as (keyof YearlyPlans)[];
  const monthlyComparisonData = monthsList.map(month => ({
    name: month.slice(0, 3), // e.g. Jan, Feb
    target: yearlyPlans[month].targetMushaf,
    realisasi: yearlyPlans[month].realisasiMushaf || 0
  }));

  // Program composition breakdown
  const programComposition = [
    { name: "Al-Qur'an Reguler & Santri", value: 1650, color: "#059669" },
    { name: "Al-Qur'an & Iqra Pemula", value: 680, color: "#0d9488" },
    { name: "Program Khusus Ramadhan", value: 540, color: "#f59e0b" },
    { name: "Tahfidz, Lansia & Braille", value: 420, color: "#3b82f6" }
  ];

  // Calculate annual stats
  const totalTargetYear = monthsList.reduce((acc, m) => acc + yearlyPlans[m].targetMushaf, 0);
  const totalRealisasiYear = monthsList.reduce((acc, m) => acc + (yearlyPlans[m].realisasiMushaf || 0), 0);
  const percentYear = Math.round((totalRealisasiYear / (totalTargetYear || 1)) * 100);

  return (
    <div className="space-y-6">
      {/* KPI Top Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Target Tahunan</span>
            <span className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
              <Award className="w-4 h-4" />
            </span>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-black text-slate-800">{totalTargetYear.toLocaleString()}</div>
            <div className="text-xs text-slate-500 mt-1">Mushaf Al-Qur'an (12 Bulan)</div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Realisasi Berjalan</span>
            <span className="p-2 bg-teal-50 text-teal-600 rounded-xl">
              <CheckCircle2 className="w-4 h-4" />
            </span>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-black text-teal-700">{totalRealisasiYear.toLocaleString()}</div>
            <div className="text-xs text-emerald-600 font-semibold mt-1">
              {percentYear}% Target Tercapai
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Titik Lokasi Terdata</span>
            <span className="p-2 bg-blue-50 text-blue-600 rounded-xl">
              <MapPin className="w-4 h-4" />
            </span>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-black text-slate-800">{locations.length}</div>
            <div className="text-xs text-slate-500 mt-1">Madrasah, TPA & Pesantren</div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Cakupan Wilayah</span>
            <span className="p-2 bg-amber-50 text-amber-600 rounded-xl">
              <Sparkles className="w-4 h-4" />
            </span>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-black text-amber-600">{Object.keys(regionMap).length}</div>
            <div className="text-xs text-slate-500 mt-1">Kabupaten / Kota Jawa Barat</div>
          </div>
        </div>
      </div>

      {/* Chart Row 1: Bar Chart per Wilayah & Pie Chart Composition */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Wilayah Distribution */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-emerald-600" />
                <span>Distribusi Penyaluran Mushaf per Wilayah</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Akumulasi jumlah mushaf yang didistribusikan ke masing-masing kabupaten/kota
              </p>
            </div>
            <span className="text-xs bg-emerald-100 text-emerald-800 font-bold px-2.5 py-1 rounded-full">
              Jawa Barat
            </span>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={regionData} margin={{ top: 10, right: 20, left: -10, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '12px', color: '#fff', fontSize: '12px' }}
                  cursor={{ fill: '#f8fafc' }}
                  formatter={(value: any) => [`${value} Mushaf`, 'Total Penyaluran']}
                />
                <Bar dataKey="mushaf" fill="#059669" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Program Composition */}
        <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-800 flex items-center gap-2 mb-1">
              <PieIcon className="w-4 h-4 text-teal-600" />
              <span>Komposisi Program</span>
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Porsi mushaf berdasarkan kategori program wakaf
            </p>

            <div className="h-48 w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={programComposition}
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={75}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {programComposition.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '10px', color: '#fff', fontSize: '11px' }}
                    formatter={(val: any) => [`${val} Mushaf`, 'Alokasi']}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="space-y-2 pt-2 border-t border-slate-100">
            {programComposition.map((item, i) => (
              <div key={i} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-slate-600 font-medium truncate max-w-[140px]">{item.name}</span>
                </div>
                <span className="font-bold text-slate-800">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Chart Row 2: 12-Month Target vs Realization Trend */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-sm">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-6">
          <div>
            <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-600" />
              <span>Tren Kinerja 12 Bulan: Target vs Realisasi (2026)</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Perbandingan akumulasi target bulanan dengan realisasi fisik di lapangan
            </p>
          </div>
          <div className="flex items-center gap-4 text-xs font-semibold">
            <div className="flex items-center gap-1.5 text-slate-500">
              <span className="w-3 h-1 bg-slate-300 rounded-full" />
              <span>Target</span>
            </div>
            <div className="flex items-center gap-1.5 text-emerald-700">
              <span className="w-3 h-1.5 bg-emerald-600 rounded-full" />
              <span>Realisasi</span>
            </div>
          </div>
        </div>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={monthlyComparisonData} margin={{ top: 10, right: 20, left: -10, bottom: 10 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '12px', color: '#fff', fontSize: '12px' }}
                formatter={(value: any, name: string) => [`${value} Mushaf`, name === 'target' ? 'Target Mushaf' : 'Realisasi Mushaf']}
              />
              <Line type="monotone" dataKey="target" stroke="#94a3b8" strokeWidth={2} strokeDasharray="4 4" dot={{ r: 3 }} />
              <Line type="monotone" dataKey="realisasi" stroke="#059669" strokeWidth={3} dot={{ r: 5, fill: '#059669' }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
