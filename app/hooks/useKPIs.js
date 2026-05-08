'use client';
import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';

export function useKPIs() {
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    fetch('/api/me')
      .then(r => r.json())
      .then(d => setIsAdmin(d.role === 'admin'));
  }, []);

  async function fetchData(admin) {
    const { data: reservas } = await supabase
      .from('reservas')
      .select('*')
      .order('fecha', { ascending: false });

    const hoy = new Date().toISOString().split('T')[0];
    const { data: hoy_reservas } = await supabase
      .from('reservas')
      .select('*')
      .eq('fecha', hoy)
      .eq('estado', 'CONFIRMADA')
      .order('hora');

    let metricas = [];
    if (admin) {
      const { data: m } = await supabase
        .from('metricas_agente')
        .select('*')
        .order('created_at', { ascending: false });
      metricas = m || [];
    }

    setData({
      reservas:  reservas     || [],
      hoy:       hoy_reservas || [],
      metricas,
    });
    setLoading(false);
  }

  useEffect(() => {
    fetchData(isAdmin);
    const interval = setInterval(() => fetchData(isAdmin), 30000);
    return () => clearInterval(interval);
  }, [isAdmin]);

  return { data, loading, isAdmin };
}

