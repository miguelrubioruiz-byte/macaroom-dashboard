'use client';
import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';

export function useKPIs() {
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);

  async function fetchData() {
    // Reservas totales y por sala
    const { data: reservas } = await supabase
      .from('reservas')
      .select('*')
      .order('fecha', { ascending: false });

    // Próximas reservas de hoy
    const hoy = new Date().toISOString().split('T')[0];
    const { data: hoy_reservas } = await supabase
      .from('reservas')
      .select('*')
      .eq('fecha', hoy)
      .eq('estado', 'CONFIRMADA')
      .order('hora');

    setData({ reservas: reservas || [], hoy: hoy_reservas || [] });
    setLoading(false);
  }

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000); // cada 30 seg
    return () => clearInterval(interval);
  }, []);

  return { data, loading };
}
