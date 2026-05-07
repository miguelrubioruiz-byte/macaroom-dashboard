'use client';
import { useKPIs } from './hooks/useKPIs';
import { BarChart, Bar, XAxis, YAxis, Tooltip,
         LineChart, Line, ResponsiveContainer, CartesianGrid } from 'recharts';

export default function Dashboard() {
  const { data, loading } = useKPIs();

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen">
      <p className="text-gray-500 text-lg">Cargando datos... 🗝️</p>
    </div>
  );

  const { reservas, hoy } = data;
  const total       = reservas.length;
  const canceladas  = reservas.filter(r => r.estado === 'CANCELADA').length;
  const tasaCancel  = total > 0 ? ((canceladas/total)*100).toFixed(1) : 0;
  const avgPersonas = total > 0
    ? (reservas.reduce((s,r) => s + r.personas, 0) / total).toFixed(1) : 0;

  // Datos para gráfico por sala
  const porSala = ['Hotel Premier','Superheroes'].map(sala => ({
    sala, total: reservas.filter(r => r.sala === sala).length
  }));

  // Datos para gráfico por hora
  const porHora = Array.from({length:12}, (_,i) => {
    const h = i + 10;
    return { hora: `${h}:00`,
      total: reservas.filter(r => parseInt(r.hora) === h).length };
  });

  return (
    <main className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-slate-800 mb-1">
        🗝️ Macaroom Escaperoom
      </h1>
      <p className="text-gray-500 mb-8">Dashboard de reservas en vivo</p>

      {/* Tarjetas KPI */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <KPICard label="Reservas totales" value={total} color="blue" />
        <KPICard label="Cancelaciones" value={`${tasaCancel}%`} color="red" />
        <KPICard label="Personas promedio" value={avgPersonas} color="green" />
        <KPICard label="Reservas hoy" value={hoy.length} color="purple" />
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <ChartCard title="Reservas por sala">
          <BarChart data={porSala}>
            <XAxis dataKey="sala" />
            <YAxis /><Tooltip /><CartesianGrid strokeDasharray="3 3" />
            <Bar dataKey="total" fill="#2563EB" radius={[4,4,0,0]} />
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
          : <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  {['Hora','Sala','Nombre','Personas'].map(h =>
                    <th key={h} className="px-3 py-2 text-left text-gray-900">{h}</th>
                  )}
                </tr>
              </thead>
              <tbody>
                {hoy.map(r => (
                  <tr key={r.id} className="border-t">
                    <td className="px-3 py-2 text-gray-900">{r.hora?.slice(0,5)}</td>
                    <td className="px-3 py-2 text-gray-900">{r.sala}</td>
                    <td className="px-3 py-2 text-gray-900">{r.nombre}</td>
                    <td className="px-3 py-2 text-gray-900">{r.personas}</td>
                  </tr>
                ))}
              </tbody>
            </table>
        }
      </div>
    </main>
  );
}

// Componentes auxiliares
function KPICard({ label, value, color }) {
  const colors = {
    blue: 'bg-blue-50 text-blue-700',
    red: 'bg-red-50 text-red-700',
    green: 'bg-green-50 text-green-700',
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

