'use client';
import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { BarChart, Bar, XAxis, YAxis, Tooltip,
         LineChart, Line, ResponsiveContainer, CartesianGrid } from 'recharts';

export default function AdminDashboard() {
  const [metricas, setMetricas] = useState([]);

  async function fetchMetricas() {
    const { data } = await supabase
      .from('metricas_agente')
      .select('*')
      .order('timestamp', { ascending: false })
      .limit(500);
    setMetricas(data || []);
  }

  useEffect(() => {
    fetchMetricas();
    const i = setInterval(fetchMetricas, 30000);
    return () => clearInterval(i);
  }, []);

  const total       = metricas.length;
  const errores     = metricas.filter(m => m.estado === 'ERROR').length;
  const tasaError   = total > 0 ? ((errores/total)*100).toFixed(1) : 0;
  const tiempoMedio = total > 0
    ? Math.round(metricas.filter(m=>m.duracion_ms)
        .reduce((s,m)=>s+m.duracion_ms,0) / total) : 0;
  const disponib    = total > 0
    ? (100 - tasaError).toFixed(1) : 100;

  // Errores por tipo
  const porTipo = Object.entries(
    metricas.filter(m=>m.tipo_error)
      .reduce((acc,m)=>{acc[m.tipo_error]=(acc[m.tipo_error]||0)+1;return acc;},{})
  ).map(([tipo,count])=>({tipo,count}));

  return (
    <main className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-slate-800 mb-1">
        ⚙️ Panel Admin — Macaroom
      </h1>
      <p className="text-gray-500 mb-8">Métricas técnicas del agente Víctor</p>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <KPICard label="Ejecuciones" value={total} color="blue" />
        <KPICard label="Tasa de error" value={`${tasaError}%`}
          color={tasaError > 10 ? 'red' : 'green'} />
        <KPICard label="Tiempo medio" value={`${tiempoMedio}ms`} color="purple" />
        <KPICard label="Disponibilidad" value={`${disponib}%`} color="green" />
      </div>

      {porTipo.length > 0 && (
        <div className="bg-white rounded-2xl shadow p-6 mb-6">
          <h2 className="font-bold text-lg mb-4">❌ Errores por tipo</h2>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={porTipo}>
              <XAxis dataKey="tipo" /><YAxis /><Tooltip />
              <Bar dataKey="count" fill="#DC2626" radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      <div className="bg-white rounded-2xl shadow p-6">
        <h2 className="font-bold text-lg mb-4">📋 Últimas ejecuciones</h2>
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              {['Hora','Operación','Sala','Duración','Estado'].map(h =>
                <th key={h} className="px-3 py-2 text-left">{h}</th>
              )}
            </tr>
          </thead>
          <tbody>
            {metricas.slice(0,20).map(m => (
              <tr key={m.id} className="border-t">
                <td className="px-3 py-2">
                  {new Date(m.timestamp).toLocaleTimeString('es-ES')}
                </td>
                <td className="px-3 py-2">{m.tipo_operacion}</td>
                <td className="px-3 py-2">{m.sala || '—'}</td>
                <td className="px-3 py-2">{m.duracion_ms ? `${m.duracion_ms}ms` : '—'}</td>
                <td className="px-3 py-2">
                  <span className={m.estado==='OK'
                    ? 'text-green-600 font-semibold'
                    : 'text-red-600 font-semibold'}>
                    {m.estado}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}

function KPICard({ label, value, color }) {
  const colors = {
    blue:'bg-blue-50 text-blue-700', red:'bg-red-50 text-red-700',
    green:'bg-green-50 text-green-700', purple:'bg-purple-50 text-purple-700'
  };
  return (
    <div className={`rounded-2xl p-5 ${colors[color]}`}>
      <p className="text-3xl font-bold">{value}</p>
      <p className="text-sm mt-1 opacity-75">{label}</p>
    </div>
  );
}
