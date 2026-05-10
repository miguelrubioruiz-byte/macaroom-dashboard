'use client';
import { useState, useEffect, useMemo } from 'react';
import { supabase } from '../../lib/supabase';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import Link from 'next/link';

// Se mueve fuera para evitar que el input pierda el foco al re-renderizar
const FilterInput = ({ col, placeholder, value, onChange, onClear }) => (
  <div className="relative mt-2">
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(col, e.target.value)}
      placeholder={placeholder}
      className="w-full bg-[#0a0c10] border border-white/10 rounded px-2 py-1 text-[10px] text-white focus:border-[#FFD700] outline-none"
    />
    {value && (
      <button 
        onClick={() => onClear(col)}
        className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white"
      >
        ×
      </button>
    )}
  </div>
);

export default function AdminDashboard() {
  const [view, setView] = useState('admin'); // 'admin' o 'historial'
  const [metricas, setMetricas] = useState([]);
  const [filters, setFilters] = useState({ fecha: '', operacion: '', estado: '', detalles: '' });

  async function fetchMetricas() {
    const { data } = await supabase
      .from('metricas_agente')
      .select('*')
      .order('timestamp', { ascending: false });
    setMetricas(data || []);
  }

  useEffect(() => {
    fetchMetricas();
    const i = setInterval(fetchMetricas, 30000);
    return () => clearInterval(i);
  }, []);

  const filteredData = useMemo(() => {
    return metricas.filter(m => {
      const fechaStr = new Date(m.timestamp).toLocaleString('es-ES', { timeZone: 'Europe/Madrid' }).toLowerCase();
      const opStr = (m.tipo_operacion || '').toLowerCase();
      const estStr = (m.estado || '').toLowerCase();
      const detStr = (typeof m.detalles === 'object' ? JSON.stringify(m.detalles) : m.detalles || '').toLowerCase();

      return fechaStr.includes(filters.fecha.toLowerCase()) &&
             opStr.includes(filters.operacion.toLowerCase()) &&
             estStr.includes(filters.estado.toLowerCase()) &&
             detStr.includes(filters.detalles.toLowerCase());
    });
  }, [metricas, filters]);

  const stats = useMemo(() => {
    const total = filteredData.length;
    const errores = filteredData.filter(m => m.estado === 'ERROR').length;
    const tasaError = total > 0 ? ((errores / total) * 100).toFixed(1) : 0;
    const tiempoMedioMs = total > 0
      ? Math.round(filteredData.filter(m => m.duracion_ms).reduce((s, m) => s + m.duracion_ms, 0) / total) : 0;
    
    const minutos = Math.floor(tiempoMedioMs / 60000);
    const segundos = ((tiempoMedioMs % 60000) / 1000).toFixed(0);
    const tiempoFormateado = minutos > 0 ? `${minutos}m ${segundos}s` : `${segundos}s`;
    const disponib = total > 0 ? (100 - tasaError).toFixed(1) : 100;

    return { total, tasaError, tiempoFormateado, disponib };
  }, [filteredData]);

  const porTipo = useMemo(() => {
    return Object.entries(
      filteredData.filter(m => m.tipo_error && m.tipo_error !== 'null')
        .reduce((acc, m) => { acc[m.tipo_error] = (acc[m.tipo_error] || 0) + 1; return acc; }, {})
    ).map(([tipo, count]) => ({ tipo, count }));
  }, [filteredData]);

  const handleFilterChange = (column, value) => {
    setFilters(prev => ({ ...prev, [column]: value }));
  };

  const clearFilter = (column) => {
    setFilters(prev => ({ ...prev, [column]: '' }));
  };

  // Función auxiliar para formatear la duración de cada fila
  const formatDuration = (ms) => {
    if (!ms) return '—';
    if (ms < 1000) return `${ms}ms`;
    const s = (ms / 1000).toFixed(1);
    if (s < 60) return `${s}s`;
    const m = Math.floor(ms / 60000);
    const rs = ((ms % 60000) / 1000).toFixed(0);
    return `${m}m ${rs}s`;
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-[#0a0c10]">
      <aside className="w-full md:w-64 border-b md:border-b-0 md:border-r border-white/10 flex flex-col justify-between p-6 shrink-0 bg-[#0f1116]">
        <div>
          <div className="mb-8 md:mb-10 text-[#FFD700] font-black text-2xl tracking-tighter text-center md:text-left">
            MACAROOM
          </div>
          <nav className="space-y-2">
            <button 
              onClick={() => setView('admin')}
              className={`w-full px-4 py-2 rounded-lg font-bold flex items-center gap-2 transition-all ${view === 'admin' ? 'text-[#FFD700] bg-[#FFD700]/10 border border-[#FFD700]/20' : 'text-white/50 hover:text-white'}`}
            >
              <span>⚙️</span> Administración
            </button>
            <button 
              onClick={() => setView('historial')}
              className={`w-full px-4 py-2 rounded-lg font-bold flex items-center gap-2 transition-all ${view === 'historial' ? 'text-[#FFD700] bg-[#FFD700]/10 border border-[#FFD700]/20' : 'text-white/50 hover:text-white'}`}
            >
              <span>📊</span> Historial Registros
            </button>
          </nav>
        </div>
        <Link href="/" className="mt-6 md:mt-0 flex items-center justify-center md:justify-start gap-2 text-white/70 hover:text-[#FFD700] transition-colors font-bold p-2 uppercase text-xs tracking-widest border-t border-white/5 md:border-t-0 pt-4">
          ← Panel de Control
        </Link>
      </aside>

      <main className="flex-1 px-4 md:px-10 py-8 overflow-y-auto">
        <header className="mb-8 text-center md:text-left">
          <h1 className="text-3xl font-bold text-white uppercase tracking-tight">
            {view === 'admin' ? 'PANEL DE ' : 'HISTORIAL DE '}<span className="text-[#FFD700]">MÉTRICAS</span>
          </h1>
          <p className="text-gray-400">Datos actualizados del agente Víctor</p>
        </header>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
          <KPICard label="Registros" value={stats.total} color="dark" />
          <KPICard label="Tasa de error" value={`${stats.tasaError}%`} color={stats.tasaError > 10 ? 'red' : 'dark'} />
          <KPICard label="Tiempo medio" value={stats.tiempoFormateado} color="dark" />
          <KPICard label="Disponibilidad" value={`${stats.disponib}%`} color="yellow" />
        </div>

        {view === 'admin' && porTipo.length > 0 && (
          <div className="bg-[#14171c] rounded-2xl p-6 border border-white/10 shadow-2xl mb-8">
            <h2 className="font-bold text-lg mb-6 text-[#FFD700] text-center uppercase tracking-widest">Errores por tipo</h2>
            <div style={{ width: '100%', height: 200 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={porTipo}>
                  <XAxis dataKey="tipo" stroke="#555" fontSize={10} />
                  <YAxis stroke="#555" fontSize={10} />
                  <Tooltip contentStyle={{backgroundColor: '#0a0c10', border: '1px solid #333'}} />
                  <Bar dataKey="count" fill="#FFD700" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        <div className="bg-[#14171c] rounded-2xl p-4 md:p-6 border border-white/10 shadow-2xl">
          <h2 className="font-bold text-lg mb-4 text-white uppercase tracking-widest">
            {view === 'admin' ? 'Últimas 15 ejecuciones' : 'Base de datos completa'}
          </h2>
          {/* Contenedor con Scroll Vertical y Horizontal */}
          <div className="overflow-x-auto overflow-y-auto max-h-[600px] scrollbar-thin scrollbar-thumb-white/10">
            <table className="w-full text-sm text-gray-300 border-collapse">
              <thead className="sticky top-0 bg-[#14171c] z-10">
                <tr className="text-gray-500 border-b border-white/10 text-left">
                  <th className="px-3 py-4 min-w-[150px] bg-[#14171c]">
                    <span className="uppercase font-bold tracking-tighter">Fecha/hora</span>
                    <FilterInput col="fecha" placeholder="Filtrar fecha..." value={filters.fecha} onChange={handleFilterChange} onClear={clearFilter} />
                  </th>
                  <th className="px-3 py-4 min-w-[150px] bg-[#14171c]">
                    <span className="uppercase font-bold tracking-tighter">Operación</span>
                    <FilterInput col="operacion" placeholder="Operación..." value={filters.operacion} onChange={handleFilterChange} onClear={clearFilter} />
                  </th>
                  <th className="px-3 py-4 min-w-[100px] bg-[#14171c]">
                    <span className="uppercase font-bold tracking-tighter">Duración</span>
                    <div className="mt-2 h-[26px]"></div> 
                  </th>
                  <th className="px-3 py-4 min-w-[120px] bg-[#14171c]">
                    <span className="uppercase font-bold tracking-tighter">Estado</span>
                    <FilterInput col="estado" placeholder="SUCCESS/ERROR..." value={filters.estado} onChange={handleFilterChange} onClear={clearFilter} />
                  </th>
                  <th className="px-3 py-4 bg-[#14171c]">
                    <span className="uppercase font-bold tracking-tighter">Detalles</span>
                    <FilterInput col="detalles" placeholder="Contenido..." value={filters.detalles} onChange={handleFilterChange} onClear={clearFilter} />
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {(view === 'admin' ? filteredData.slice(0, 15) : filteredData).map(m => (
                  <tr key={m.id} className="hover:bg-white/5 transition-colors">
                    <td className="px-3 py-4 font-mono text-[#FFD700]/90 whitespace-nowrap">
                      {new Date(m.timestamp).toLocaleString('es-ES', { timeZone: 'Europe/Madrid', day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </td>
                    <td className="px-3 py-4 text-white font-medium whitespace-nowrap uppercase text-[11px]">{m.tipo_operacion}</td>
                    <td className="px-3 py-4 font-mono text-[11px] text-gray-400">
                      {formatDuration(m.duracion_ms)}
                    </td>
                    <td className="px-3 py-4">
                      <span className={`font-bold px-3 py-1 rounded-full text-[10px] uppercase tracking-widest ${m.estado === 'SUCCESS' ? 'text-green-400 bg-green-400/10' : 'text-red-400 bg-red-400/10'}`}>
                        {m.estado}
                      </span>
                    </td>
                    <td className="px-3 py-4 text-gray-500 italic max-w-xs truncate">
                      {m.detalles ? (typeof m.detalles === 'object' ? JSON.stringify(m.detalles) : m.detalles) : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}

function KPICard({ label, value, color }) {
  const configs = {
    dark: 'bg-[#1a1d24] text-white border-white/10 hover:border-[#FFD700]/30',
    yellow: 'bg-[#FFD700] text-black border-transparent shadow-[0_0_25px_rgba(255,215,0,0.15)]',
    red: 'bg-[#1a1d24] text-red-500 border-red-500/30',
  };
  return (
    <div className={`rounded-2xl p-6 border transition-all duration-300 ${configs[color] || configs.dark}`}>
      <p className="text-3xl md:text-4xl font-black tracking-tight">{value}</p>
      <p className="text-[10px] mt-2 uppercase font-bold opacity-70 tracking-widest leading-none">{label}</p>
    </div>
  );
}
