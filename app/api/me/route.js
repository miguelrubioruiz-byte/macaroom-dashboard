import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET() {
  try {
    // Se añade 'await' porque cookies() ahora es una función asíncrona
    const cookieStore = await cookies();
    const session = cookieStore.get('macaroom_session');

    // Si no hay sesión, devolvemos un JSON válido con role null
    // IMPORTANTE: No devolvemos error 401 para que el fetch no explote
    return NextResponse.json({
      role: session ? session.value : null
    });
  } catch (error) {
    console.error("Error en API me:", error);
    return NextResponse.json({ role: null }, { status: 200 });
  }
}