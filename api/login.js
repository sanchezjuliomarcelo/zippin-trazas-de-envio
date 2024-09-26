export default function handler(req, res) {
    if (req.method === 'POST') {
        const { email, password } = req.body;

        // Verificar si el email y la contraseña coinciden con las variables de entorno
        if (email === process.env.USUARIO && password === process.env.CLAVE) {
            return res.status(200).json({ message: 'Login exitoso' });
        } else {
            return res.status(401).json({ message: 'Credenciales incorrectas' });
        }
    } else {
        res.setHeader('Allow', ['POST']);
        res.status(405).end(`Método ${req.method} no permitido`);
    }
}
