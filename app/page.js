'use client';
import { useState, useEffect } from 'react';
import { useKPIs } from './hooks/useKPIs';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip,
  LineChart, Line, ResponsiveContainer, CartesianGrid
} from 'recharts';

// --- SOLUCIÓN PARA LOS AVISOS AMARILLOS ---
if (typeof window !== 'undefined') {
  const originalWarn = console.warn;
  console.warn = (...args) => {
    if (args[0]?.includes?.('The width(-1) and height(-1) of chart should be greater than 0')) return;
    originalWarn(...args);
  };
}

export default function Dashboard() {
  const { data, loading } = useKPIs();
  const [activeTab, setActiveTab]     = useState('panel');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isAdmin, setIsAdmin]         = useState(false); // Controla la visibilidad del botón
  const [isMounted, setIsMounted]     = useState(false);
  
  const [filtersHoy, setFiltersHoy] = useState({ 
    hora: '', sala: '', nombre: '', telefono: '', personas: '' 
  });
  const [filtersHist, setFiltersHist] = useState({ 
    codigo: '', fecha: '', hora: '', sala: '', nombre: '', telefono: '', personas: '', email: '', estado: '' 
  });

  useEffect(() => {
    setIsMounted(true);
    // Verificación inicial de sesión (opcional si usas la contraseña manual)
    fetch('/api/me')
      .then(r => r.json())
      .then(d => { if(d?.role === 'admin') setIsAdmin(true); })
      .catch(err => console.error("Error en sesión:", err));
  }, []);

  // --- LÓGICA DE ACCESO: Pide contraseña y activa el botón ---
  const handleVerifyAdmin = () => {
    const pass = prompt("Introduce la contraseña de administrador:");
    if (pass === 'ClaveAdminPrivada2026') { 
      setIsAdmin(true);
      alert("Modo administrador activado. Ahora puedes ver el acceso en el menú.");
    } else if (pass !== null) {
      alert("Contraseña incorrecta");
    }
  };

  const logout = async () => {
    await fetch('/api/logout', { method: 'POST' });
    window.location.href = '/login';
  };

  if (loading || !isMounted) return (
    <div className="flex items-center justify-center min-h-screen bg-[#050a18]">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-yellow-400 text-lg font-bold tracking-[0.2em]">CARGANDO MACAROOM...</p>
      </div>
    </div>
  );

  const { reservas = [], hoy = [] } = data || {};

  const hoyFiltrado = hoy.filter(r => {
    return Object.keys(filtersHoy).every(key => {
      if (!filtersHoy[key]) return true;
      const val = key === 'hora' ? r[key]?.slice(0, 5) : r[key];
      return String(val || '').toLowerCase().includes(filtersHoy[key].toLowerCase());
    });
  });

  const reservasOrdenadas = [...reservas].sort((a, b) => {
    const fechaA = new Date(`${a.fecha}T${a.hora}`);
    const fechaB = new Date(`${b.fecha}T${b.hora}`);
    return fechaB - fechaA;
  });

  const historialFiltrado = reservasOrdenadas.filter(r => {
    return Object.keys(filtersHist).every(key => {
      if (!filtersHist[key]) return true;
      const val = key === 'hora' ? r[key]?.slice(0, 5) : r[key];
      return String(val || '').toLowerCase().includes(filtersHist[key].toLowerCase());
    });
  });

  const total       = reservas.length;
  const canceladas  = reservas.filter(r => r.estado === 'CANCELADA').length;
  const tasaCancel  = total > 0 ? ((canceladas / total) * 100).toFixed(1) : 0;
  const avgPersonas = total > 0 ? (reservas.reduce((s, r) => s + r.personas, 0) / total).toFixed(1) : 0;

  const porSala = ['Hotel Premier', 'Superheroes'].map(sala => ({
    sala, total: reservas.filter(r => r.sala === sala).length
  }));

  const porHora = Array.from({ length: 13 }, (_, i) => {
    const h = (i + 10).toString().padStart(2, '0') + ':00';
    return {
      hora: h,
      total: reservas.filter(r => r.hora?.startsWith(h.split(':')[0])).length
    };
  });

  return (
    <div className="flex min-h-screen bg-[#050a18] text-white font-sans tracking-tight" style={{ fontFamily: 'ui-rounded, sans-serif' }}>
      
      <div className="fixed top-0 left-0 w-full h-[3px] bg-yellow-400 shadow-[0_0_20px_#facc15] z-50"></div>
      <div className="fixed bottom-0 left-0 w-full h-[3px] bg-yellow-400 shadow-[0_0_20px_#facc15] z-50"></div>

      <button 
        onClick={() => setSidebarOpen(true)}
        className="md:hidden fixed top-6 left-6 z-40 bg-yellow-400 text-black p-2 rounded-md font-bold"
      >
        MENU
      </button>

      <aside className={`fixed md:static inset-y-0 left-0 z-50 w-72 bg-[#0a0f1d] border-r border-white/10 flex flex-col py-12 px-6 transform transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`}>
        <button onClick={() => setSidebarOpen(false)} className="md:hidden absolute top-4 right-4 text-yellow-400 font-bold">CERRAR</button>
        
        <div className="mb-12">
          <h2 className="text-2xl font-black tracking-tighter italic">MACA<span className="text-yellow-400">ROOM</span></h2>
          <div className="h-1 w-12 bg-yellow-400 mt-1"></div>
        </div>
        <nav className="flex flex-col gap-3">
          <button onClick={() => {setActiveTab('panel'); setSidebarOpen(false);}} className={`flex items-center gap-4 px-5 py-4 rounded-xl text-xs font-black tracking-widest transition-all ${activeTab === 'panel' ? 'bg-yellow-400 text-black' : 'text-slate-400 hover:text-white'}`}>
            <span>📊</span> PANEL DE CONTROL
          </button>
          <button onClick={() => {setActiveTab('historial'); setSidebarOpen(false);}} className={`flex items-center gap-4 px-5 py-4 rounded-xl text-xs font-black tracking-widest transition-all ${activeTab === 'historial' ? 'bg-yellow-400 text-black' : 'text-slate-400 hover:text-white'}`}>
            <span>📋</span> HISTORIAL COMPLETO
          </button>
          
          {/* BOTÓN CONDICIONAL: Solo aparece si isAdmin es true */}
          {isAdmin ? (
            <a href="/admin" className="flex items-center gap-4 px-5 py-4 rounded-xl text-xs font-black tracking-widest text-slate-400 hover:bg-white/5 hover:text-yellow-400">
              <span>🔐</span> ADMINISTRACIÓN
            </a>
          ) : (
            <button onClick={handleVerifyAdmin} className="flex items-center gap-4 px-5 py-4 rounded-xl text-[10px] font-black tracking-widest text-slate-600 hover:text-slate-400 transition-all italic">
              <span>🔒</span> Verificar Admin
            </button>
          )}
        </nav>
        <button onClick={logout} className="mt-auto flex items-center gap-4 px-5 py-4 text-xs font-bold text-slate-500 hover:text-red-400 transition-colors">
          <span>🚪</span> CERRAR SESIÓN
        </button>
      </aside>

      {sidebarOpen && <div onClick={() => setSidebarOpen(false)} className="fixed inset-0 bg-black/50 z-40 md:hidden"></div>}

      <div className="flex-1 flex flex-col min-w-0 bg-[radial-gradient(circle_at_top_right,_#101d35,_#050a18)]">
        <main className="flex-1 p-6 md:p-12 overflow-auto">
          
          {activeTab === 'panel' && (
            <div className="max-w-7xl mx-auto space-y-10">
              <header>
                <h1 className="text-5xl font-black uppercase tracking-tighter text-white drop-shadow-lg">Panel de <span className="text-yellow-400">Control</span></h1>
              </header>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <KPICard label="Total Reservas" value={total} icon="📈" trend={12} />
                <KPICard label="Tasa Cancelación" value={`${tasaCancel}%`} icon="⚠️" trend={-2} isCancelCard />
                <KPICard label="Promedio Grupo" value={avgPersonas} icon="👥" trend={5} />
                <KPICard label="Hoy" value={hoy.length} icon="📅" trend={8} highlight />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <ChartContainer title="RESERVAS POR SALA">
                    <BarChart data={porSala}>
                      <XAxis dataKey="sala" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                      <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                      <Tooltip cursor={{fill: 'rgba(255,255,255,0.05)'}} contentStyle={{backgroundColor: '#0a0f1d', border: '1px solid #334155', borderRadius: '8px'}} />
                      <Bar dataKey="total" fill="#facc15" radius={[4, 4, 0, 0]} barSize={40} />
                    </BarChart>
                </ChartContainer>

                <ChartContainer title="RESERVAS POR HORA">
                    <LineChart data={porHora}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                      <XAxis dataKey="hora" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                      <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                      <Tooltip contentStyle={{backgroundColor: '#0a0f1d', border: '1px solid #334155', borderRadius: '8px'}} />
                      <Line type="monotone" dataKey="total" stroke="#facc15" strokeWidth={3} dot={{ r: 4, fill: '#facc15' }} />
                    </LineChart>
                </ChartContainer>
                
                <div className="lg:col-span-2">
                  <div className="bg-white/95 backdrop-blur-xl rounded-[2rem] p-8 shadow-2xl overflow-hidden border-t-4 border-yellow-400">
                    <h3 className="text-slate-900 font-black text-3xl mb-8">RESERVAS PARA HOY</h3>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left">
                        <thead>
                          <tr className="border-b border-slate-200">
                            {['Hora', 'Sala', 'Nombre', 'Teléfono', 'Pax'].map((h) => (
                              <th key={h} className="pb-4 px-2">
                                <span className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">{h}</span>
                                <div className="relative flex items-center">
                                  <input 
                                    className="w-full bg-slate-100 border-none rounded-lg p-2 pr-8 text-xs text-slate-900 focus:ring-2 focus:ring-yellow-400 outline-none"
                                    placeholder="Filtrar..."
                                    value={filtersHoy[h.toLowerCase().replace('pax', 'personas')]}
                                    onChange={(e) => setFiltersHoy({...filtersHoy, [h.toLowerCase().replace('pax', 'personas')]: e.target.value})}
                                  />
                                  {/* BOTÓN X PARA BORRAR FILTRO */}
                                  {filtersHoy[h.toLowerCase().replace('pax', 'personas')] && (
                                    <button onClick={() => setFiltersHoy({...filtersHoy, [h.toLowerCase().replace('pax', 'personas')]: ''})} className="absolute right-2 text-slate-400 hover:text-red-500 font-bold text-sm">✕</button>
                                  )}
                                </div>
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-slate-900">
                          {hoyFiltrado.map(r => (
                            <tr key={r.id} className="hover:bg-blue-50 transition-colors">
                              <td className="py-4 px-2 font-black text-lg">{r.hora?.slice(0, 5)}</td>
                              <td className="py-4 px-2"><span className={`text-[10px] font-black px-3 py-1 rounded-full ${r.sala.includes('Hotel') ? 'bg-blue-600 text-white' : 'bg-purple-600 text-white'}`}>{r.sala}</span></td>
                              <td className="py-4 px-2 font-bold text-slate-800">{r.nombre}</td>
                              <td className="py-4 px-2 text-slate-500 font-medium">{r.telefono}</td>
                              <td className="py-4 px-2"><span className="bg-slate-900 text-yellow-400 px-4 py-1 rounded-lg font-black text-sm">{r.personas}</span></td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'historial' && (
             <div className="max-w-7xl mx-auto space-y-8">
             <header>
               <h1 className="text-5xl font-black uppercase tracking-tighter text-white">Historial <span className="text-yellow-400">General</span></h1>
             </header>
             <div className="bg-white/95 backdrop-blur-xl rounded-[2.5rem] p-8 shadow-2xl border-t-4 border-yellow-400 text-slate-900">
               <div className="overflow-x-auto">
                 <table className="w-full text-sm min-w-[1000px]">
                   <thead>
                     <tr className="border-b border-slate-200">
                       {['Código', 'Fecha', 'Hora', 'Sala', 'Nombre', 'Teléfono', 'Pax', 'Email', 'Estado'].map(h => (
                         <th key={h} className="pb-6 px-3">
                           <span className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">{h}</span>
                           <div className="relative flex items-center">
                             <input 
                               className="w-full bg-slate-100 border-none rounded-lg p-2 pr-8 text-xs text-slate-900 focus:ring-2 focus:ring-yellow-400 outline-none"
                               placeholder="..."
                               value={filtersHist[h.toLowerCase().replace('pax', 'personas').replace('é', 'e')]}
                               onChange={(e) => setFiltersHist({...filtersHist, [h.toLowerCase().replace('pax', 'personas').replace('é', 'e')]: e.target.value})}
                             />
                             {/* BOTÓN X PARA BORRAR FILTRO */}
                             {filtersHist[h.toLowerCase().replace('pax', 'personas').replace('é', 'e')] && (
                               <button onClick={() => setFiltersHist({...filtersHist, [h.toLowerCase().replace('pax', 'personas').replace('é', 'e')]: ''})} className="absolute right-2 text-slate-400 hover:text-red-500 font-bold text-sm">✕</button>
                             )}
                           </div>
                         </th>
                       ))}
                     </tr>
                   </thead>
                   <tbody className="divide-y divide-slate-100">
                     {historialFiltrado.map(r => (
                       <tr key={r.id} className="hover:bg-blue-50 transition-colors">
                         <td className="py-4 px-3 font-mono text-xs font-bold text-blue-600 uppercase">{r.codigo}</td>
                         <td className="py-4 px-3 text-slate-600 font-bold">{r.fecha}</td>
                         <td className="py-4 px-3 text-slate-900 font-black">{r.hora?.slice(0, 5)}</td>
                         <td className="py-4 px-3 text-slate-800 font-medium">{r.sala}</td>
                         <td className="py-4 px-3 text-slate-900 font-bold">{r.nombre}</td>
                         <td className="py-4 px-3 text-slate-500 font-medium">{r.telefono}</td>
                         <td className="py-4 px-3 text-center font-black text-slate-900">{r.personas}</td>
                         <td className="py-4 px-3 text-slate-400 text-xs truncate max-w-[120px]">{r.email}</td>
                         <td className="py-4 px-3 text-right">
                           <span className={`px-4 py-1 rounded-full text-[10px] font-black uppercase ${r.estado === 'CANCELADA' ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
                             {r.estado ?? 'ACTIVA'}
                           </span>
                         </td>
                       </tr>
                     ))}
                   </tbody>
                 </table>
               </div>
             </div>
           </div>
          )}
        </main>
      </div>
    </div>
  );
}

function KPICard({ label, value, icon, trend, highlight = false, isCancelCard = false }) {
  const isUp = trend > 0;
  return (
    <div className={`p-4 rounded-xl border transition-all duration-300 hover:scale-105 ${highlight ? 'bg-yellow-400 border-yellow-300 shadow-[0_0_20px_#facc15]' : 'bg-[#0a0f1d] border-white/5 shadow-xl'}`}>
      <div className="flex justify-between items-start mb-2">
        <span className="text-xl">{icon}</span>
        <div className={`flex items-center gap-1 font-black text-[10px] ${isCancelCard ? 'text-red-500' : (highlight ? 'text-black' : (isUp ? 'text-green-400' : 'text-red-400'))}`}>
          {isUp ? '▲' : '▼'} {Math.abs(trend)}%
        </div>
      </div>
      <p className={`text-2xl font-black tracking-tighter ${highlight ? 'text-black' : (isCancelCard ? 'text-red-500' : 'text-white')}`}>{value}</p>
      <p className={`text-[9px] font-black uppercase tracking-[0.2em] mt-1 ${highlight ? 'text-black/60' : 'text-slate-500'}`}>{label}</p>
    </div>
  );
}

function ChartContainer({ title, children }) {
  return (
    <div className="bg-[#0a0f1d] border border-white/5 rounded-[2.5rem] p-8 shadow-xl">
      <h3 className="text-lg font-black tracking-[0.2em] text-yellow-400 mb-8 uppercase text-center border-b border-white/5 pb-4">{title}</h3>
      <div className="h-48 w-full">
        <ResponsiveContainer width="99%" height="100%">{children}</ResponsiveContainer>
      </div>
    </div>
  );
}
