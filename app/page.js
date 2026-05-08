'use client';
import { useState } from 'react';
import { useKPIs } from './hooks/useKPIs';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip,
  LineChart, Line, ResponsiveContainer, CartesianGrid
} from 'recharts';

export default function Dashboard() {
  const { data, loading } = useKPIs();
  const [activeTab, setActiveTab] = useState('panel');

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
    { id: 'panel',    label: 'Panel de control', icon: '📊' },
    { id: 'historial', label: 'Historial',        icon: '📋' },
  ];

  return (
    <div className="flex min-h-screen bg-slate-50">

      {/* ── Sidebar ── */}
      <aside className="w-56 bg-slate-900 text-white flex flex-col py-8 px-4 gap-2 shrink-0">
        <div className="mb-6 px-2">
          <p className="text-xl font-bold leading-tight">🗝️ Macaroom</p>
          <p className="text-slate-400 text-xs mt-1">Escaperoom Dashboard</p>
        </div>

        {navItems.map(item => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors text-left
              ${activeTab === item.id
                ? 'bg-blue-600 text-white'
                : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
          >
            <span>{item.icon}</span>
            {item.label}
          </button>
        ))}
      </aside>

      {/* ── Contenido principal ── */}
      <main className="flex-1 px-8 py-8 overflow-auto">

        {/* ════ PANEL DE CONTROL ════ */}
        {activeTab === 'panel' && (
          <>
            <h1 className="text-2xl font-bold text-slate-800 mb-1">Panel de control</h1>
            <p className="text-gray-400 text-sm mb-8">Reservas en tiempo real</p>

            {/* KPIs */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <KPICard label="Reservas totales" value={total}            color="blue"   />
              <KPICard label="Cancelaciones"    value={`${tasaCancel}%`} color="red"    />
              <KPICard label="Personas promedio" value={avgPersonas}     color="green"  />
              <KPICard label="Reservas hoy"     value={hoy.length}       color="purple" />
            </div>

            {/* Gráficos */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <ChartCard title="Reservas por sala">
                <BarChart data={porSala}>
                  <XAxis dataKey="sala" />
                  <YAxis /><Tooltip /><CartesianGrid strokeDasharray="3 3" />
                  <Bar dataKey="total" fill="#2563EB" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ChartCard>
              <ChartCard title="🕒 Reservas por franja horaria">
                <LineChart data={porHora}>
                  <XAxis dataKey="hora" /><YAxis /><Tooltip />
                  <CartesianGrid strokeDasharray="3 3" />
                  <Line type="monotone" dataKey="total" stroke="#0891B2" strokeWidth={2} />
                </LineChart>
              </ChartCard>
            </div>

            {/* Tabla reservas de hoy */}
            <div className="bg-white rounded-2xl shadow p-6">
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

            {/* Mini KPIs resumen */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <KPICard label="Total reservas"    value={total}            color="blue"   />
              <KPICard label="Canceladas"        value={canceladas}       color="red"    />
              <KPICard label="Hotel Premier"
                value={reservas.filter(r => r.sala === 'Hotel Premier').length}
                color="green" />
              <KPICard label="Superheroes"
                value={reservas.filter(r => r.sala === 'Superheroes').length}
                color="purple" />
            </div>

            {/* Tabla completa */}
            <div className="bg-white rounded-2xl shadow p-6">
              <h2 className="font-bold text-lg mb-4 text-gray-900">📋 Todas las reservas</h2>
              {reservasOrdenadas.length === 0
                ? <p className="text-gray-400">No hay reservas registradas.</p>
                : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
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
  );
}

// ── Componentes auxiliares ──

function ReservasTable({ reservas }) {
  return (
    <table className="w-full text-sm">
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
    <div className={`rounded-2xl p-5 ${colors[color]}`}>
      <p className="text-3xl font-bold">{value}</p>
      <p className="text-sm mt-1 opacity-75">{label}</p>
    </div>
  );
}

function ChartCard({ title, children }) {
  return (
    <div className="bg-white rounded-2xl shadow p-6">
      <h2 className="font-bold text-lg mb-4 text-gray-900">{title}</h2>
      <ResponsiveContainer width="100%" height={220}>
        {children}
      </ResponsiveContainer>
    </div>
  );
}

