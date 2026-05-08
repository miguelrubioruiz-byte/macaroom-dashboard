import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET() {
    try {
        const cookieStore = cookies();
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