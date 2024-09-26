import { NextResponse } from 'next/server';

// Endpoint para manejar la autenticación
export async function POST(request) {
    const { username, password } = await request.json();

    // Variables de entorno
    const apiToken = process.env.KEY;
    const apiSecret = process.env.SECRET;

    // Validación de las credenciales
    if (username === apiToken && password === apiSecret) {
        // Respuesta de éxito
        return NextResponse.json({ message: 'Login successful' });
    } else {
        // Respuesta de error
        return NextResponse.json({ message: 'Invalid credentials' }, { status: 401 });
    }
}
