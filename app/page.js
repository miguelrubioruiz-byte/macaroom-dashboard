'use client';
import { useState } from 'react';
import { useKPIs } from './hooks/useKPIs';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip,
  LineChart, Line, ResponsiveContainer, CartesianGrid
} from 'recharts';

export default function Dashboard() {
  const { data, loading } = useKPIs();
  const [activeTab, setActiveTab]     = useState('panel');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const logout = async () => {
    await fetch('/api/logout', { method: 'POST' });
    window.location.href = '/login';
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen bg-slate-50">
      <p className="text-gray-500 text-lg">Cargando datos... 🗝️</p>
    </div>
  );

  const { reservas, hoy } = data;
  const total       = reservas.length;
  const canceladas  = reservas.filter(r => r.estado === 'CANCELADA').length;
  const tasaCancel  = total > 0 ? ((canceladas / total) * 100).toFixed(1) : 0;
  const avgPersonas = total > 0
    ? (reservas.reduce((s, r) => s + r.personas, 0) / total).toFixed(1) : 0;

  const porSala = ['Hotel Premier', 'Superheroes'].map(sala => ({
    sala, total: reservas.filter(r => r.sala === sala).length
  }));

  const porHora = Array.from({ length: 12 }, (_, i) => {
    const h = i + 10;
    return {
      hora: `${h}:00`,
      total: reservas.filter(r => parseInt(r.hora) === h).length
    };
  });

  const reservasOrdenadas = [...reservas].sort((a, b) => {
    const fechaA = new Date(`${a.fecha}T${a.hora}`);
    const fechaB = new Date(`${b.fecha}T${b.hora}`);
    return fechaB - fechaA;
  });

  const navItems = [
    { id: 'panel',     label: 'Panel de control', icon: '📊' },
    { id: 'historial', label: 'Historial',        icon: '📋' },
  ];

  const handleNavClick = (id) => {
    setActiveTab(id);
    setSidebarOpen(false);
  };

  return (
    <div className="flex min-h-screen bg-slate-50">

      {/* ── Overlay oscuro (solo móvil, cuando sidebar abierto) ── */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-20 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ── Sidebar ── */}
      <aside className={`
        fixed md:static inset-y-0 left-0 z-30
        w-56 bg-slate-900 text-white flex flex-col py-8 px-4 gap-2 shrink-0
        transform transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        md:translate-x-0
      `}>
        {/* Botón cerrar (solo móvil) */}
        <button
          className="md:hidden absolute top-4 right-4 text-slate-400 hover:text-white text-xl"
          onClick={() => setSidebarOpen(false)}
        >
          ✕
        </button>

        <div className="mb-6 px-2">
          <p className="text-xl font-bold leading-tight">🗝️ Macaroom</p>
          <p className="text-slate-400 text-xs mt-1">Escaperoom Dashboard</p>
        </div>

        {navItems.map(item => (
          <button
            key={item.id}
            onClick={() => handleNavClick(item.id)}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors text-left
              ${activeTab === item.id
                ? 'bg-blue-600 text-white'
                : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
          >
            <span>{item.icon}</span>
            {item.label}
          </button>
        ))}

        {/* ── Botón cerrar sesión ── */}
        <div className="mt-auto pt-4 border-t border-slate-700">
          <button
            onClick={logout}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:bg-red-600 hover:text-white transition-colors w-full text-left"
          >
            <span>🚪</span> Cerrar sesión
          </button>
        </div>

      </aside>

      {/* ── Contenido principal ── */}
      <div className="flex-1 flex flex-col min-w-0">

        {/* ── Top bar móvil ── */}
        <header className="md:hidden flex items-center gap-3 bg-slate-900 text-white px-4 py-3 sticky top-0 z-10">
          <button
            onClick={() => setSidebarOpen(true)}
            className="text-slate-300 hover:text-white p-1"
            aria-label="Abrir menú"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <span className="font-bold text-sm">🗝️ Macaroom</span>
          <span className="text-slate-400 text-xs ml-1">
            — {navItems.find(n => n.id === activeTab)?.label}
          </span>
        </header>

        <main className="flex-1 px-4 md:px-8 py-6 md:py-8 overflow-auto">

          {/* ════ PANEL DE CONTROL ════ */}
          {activeTab === 'panel' && (
            <>
              <h1 className="text-2xl font-bold text-slate-800 mb-1">Panel de control</h1>
              <p className="text-gray-400 text-sm mb-6">Reservas en tiempo real</p>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                <KPICard label="Reservas totales"  value={total}             color="blue"   />
                <KPICard label="Cancelaciones"     value={`${tasaCancel}%`}  color="red"    />
                <KPICard label="Personas promedio" value={avgPersonas}       color="green"  />
                <KPICard label="Reservas hoy"      value={hoy.length}        color="purple" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <ChartCard title="Reservas por sala">
                  <BarChart data={porSala}>
                    <XAxis dataKey="sala" tick={{ fontSize: 12 }} />
                    <YAxis /><Tooltip /><CartesianGrid strokeDasharray="3 3" />
                    <Bar dataKey="total" fill="#2563EB" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ChartCard>
                <ChartCard title="🕒 Reservas por franja horaria">
                  <LineChart data={porHora}>
                    <XAxis dataKey="hora" tick={{ fontSize: 11 }} /><YAxis /><Tooltip />
                    <CartesianGrid strokeDasharray="3 3" />
                    <Line type="monotone" dataKey="total" stroke="#0891B2" strokeWidth={2} />
                  </LineChart>
                </ChartCard>
              </div>

              <div className="bg-white rounded-2xl shadow p-4 md:p-6">
                <h2 className="font-bold text-lg mb-4 text-gray-900">📅 Reservas de hoy</h2>
                {hoy.length === 0
                  ? <p className="text-gray-400">No hay reservas para hoy.</p>
                  : <ReservasTable reservas={hoy} />
                }
              </div>
            </>
          )}

          {/* ════ HISTORIAL ════ */}
          {activeTab === 'historial' && (
            <>
              <h1 className="text-2xl font-bold text-slate-800 mb-1">Historial de reservas</h1>
              <p className="text-gray-400 text-sm mb-6">
                Total acumulado: <span className="font-semibold text-slate-700">{total} reservas</span>
              </p>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                <KPICard label="Total reservas" value={total}       color="blue"   />
                <KPICard label="Canceladas"     value={canceladas}  color="red"    />
                <KPICard label="Hotel Premier"
                  value={reservas.filter(r => r.sala === 'Hotel Premier').length}
                  color="green" />
                <KPICard label="Superheroes"
                  value={reservas.filter(r => r.sala === 'Superheroes').length}
                  color="purple" />
              </div>

              <div className="bg-white rounded-2xl shadow p-4 md:p-6">
                <h2 className="font-bold text-lg mb-4 text-gray-900">📋 Todas las reservas</h2>
                {reservasOrdenadas.length === 0
                  ? <p className="text-gray-400">No hay reservas registradas.</p>
                  : (
                    <div className="overflow-x-auto -mx-4 md:mx-0">
                      <table className="w-full text-sm min-w-[640px]">
                        <thead className="bg-gray-50">
                          <tr>
                            {['ID', 'Código', 'Fecha', 'Hora', 'Sala', 'Nombre', 'Personas', 'Email', 'Estado'].map(h => (
                              <th key={h} className="px-3 py-2 text-left text-gray-600 font-semibold whitespace-nowrap">
                                {h}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {reservasOrdenadas.map(r => (
                            <tr key={r.id} className="border-t hover:bg-slate-50 transition-colors">
                              <td className="px-3 py-2 text-gray-500 text-xs">{r.id}</td>
                              <td className="px-3 py-2 font-mono text-xs text-blue-700">{r.codigo}</td>
                              <td className="px-3 py-2 text-gray-700 whitespace-nowrap">{r.fecha}</td>
                              <td className="px-3 py-2 text-gray-700">{r.hora?.slice(0, 5)}</td>
                              <td className="px-3 py-2">
                                <span className={`px-2 py-0.5 rounded-full text-xs font-medium
                                  ${r.sala === 'Hotel Premier'
                                    ? 'bg-blue-100 text-blue-700'
                                    : 'bg-purple-100 text-purple-700'}`}>
                                  {r.sala}
                                </span>
                              </td>
                              <td className="px-3 py-2 text-gray-900 font-medium">{r.nombre}</td>
                              <td className="px-3 py-2 text-center text-gray-700">{r.personas}</td>
                              <td className="px-3 py-2 text-gray-500 text-xs">{r.email}</td>
                              <td className="px-3 py-2">
                                <span className={`px-2 py-0.5 rounded-full text-xs font-medium
                                  ${r.estado === 'CANCELADA'
                                    ? 'bg-red-100 text-red-700'
                                    : 'bg-green-100 text-green-700'}`}>
                                  {r.estado ?? 'ACTIVA'}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )
                }
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
}

// ── Componentes auxiliares ──

function ReservasTable({ reservas }) {
  return (
    <div className="overflow-x-auto -mx-4 md:mx-0">
      <table className="w-full text-sm min-w-[400px]">
        <thead className="bg-gray-50">
          <tr>
            {['Hora', 'Sala', 'Nombre', 'Personas'].map(h => (
              <th key={h} className="px-3 py-2 text-left text-gray-600">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {reservas.map(r => (
            <tr key={r.id} className="border-t hover:bg-slate-50">
              <td className="px-3 py-2 text-gray-900">{r.hora?.slice(0, 5)}</td>
              <td className="px-3 py-2 text-gray-900">{r.sala}</td>
              <td className="px-3 py-2 text-gray-900">{r.nombre}</td>
              <td className="px-3 py-2 text-gray-900">{r.personas}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function KPICard({ label, value, color }) {
  const colors = {
    blue:   'bg-blue-50 text-blue-700',
    red:    'bg-red-50 text-red-700',
    green:  'bg-green-50 text-green-700',
    purple: 'bg-purple-50 text-purple-700',
  };
  return (
    <div className={`rounded-2xl p-4 md:p-5 ${colors[color]}`}>
      <p className="text-2xl md:text-3xl font-bold">{value}</p>
      <p className="text-xs md:text-sm mt-1 opacity-75">{label}</p>
    </div>
  );
}

function ChartCard({ title, children }) {
  return (
    <div className="bg-white rounded-2xl shadow p-4 md:p-6">
      <h2 className="font-bold text-base md:text-lg mb-4 text-gray-900">{title}</h2>
      <ResponsiveContainer width="100%" height={200}>
        {children}
      </ResponsiveContainer>
    </div>
  );
}
