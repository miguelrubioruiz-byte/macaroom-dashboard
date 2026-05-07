'use client';

import { useState } from 'react';

export default function LoginPage() {
  const [password, setPassword] = useState('');

  const entrar = async (e) => {
    e.preventDefault();
    // Esta alerta nos dirá si el código llega hasta aquí
    alert("Intentando conectar con la API..."); 

    const res = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    });

    if (res.ok) {
      window.location.href = '/';
    } else {
      alert("Contraseña incorrecta");
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#0f172a' }}>
      <form onSubmit={entrar} style={{ background: 'white', padding: '2rem', borderRadius: '1rem' }}>
        <h2 style={{ color: 'black', marginBottom: '1rem' }}>Acceso Macaroom</h2>
        <input 
          type="password" 
          value={password} 
          onChange={(e) => setPassword(e.target.value)}
          style={{ display: 'block', marginBottom: '1rem', padding: '0.5rem', border: '1px solid #ccc', color: 'black' }}
          placeholder="Clave"
        />
        <button type="submit" style={{ width: '100%', padding: '0.5rem', background: 'blue', color: 'white', border: 'none', borderRadius: '0.5rem', cursor: 'pointer' }}>
          Entrar
        </button>
      </form>
    </div>
  );
}
