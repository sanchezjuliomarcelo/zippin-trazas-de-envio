import { NextResponse } from 'next/server';

export async function POST(request) {
    const { usuario, clave } = await request.json();

    // Aquí comparas las credenciales con las variables de entorno
    const validUser = process.env.USUARIO === usuario;
    const validPassword = process.env.CLAVE === clave;

    if (validUser && validPassword) {
        return NextResponse.json({ success: true });
    } else {
        return NextResponse.json({ success: false }, { status: 401 });
    }
}
