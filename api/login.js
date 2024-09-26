// api/login.js
import { json } from 'body-parser';
import axios from 'axios';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { email, password } = req.body;

    const apiToken = process.env.KEY;
    const apiSecret = process.env.SECRET;

    // Lógica de autenticación con Zippin usando axios
    try {
      const response = await axios.get('https://api.zippin.com.ar/v2/shipments', {
        headers: {
          'Authorization': `Basic ${Buffer.from(`${apiToken}:${apiSecret}`).toString('base64')}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        }
      });
      res.status(200).json(response.data);
    } catch (error) {
      res.status(500).json({ message: 'Error en la autenticación' });
    }
  } else {
    // Método no permitido
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Método ${req.method} no permitido`);
  }
}
