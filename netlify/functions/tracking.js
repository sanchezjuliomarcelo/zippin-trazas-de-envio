const axios = require('axios');

exports.handler = async function(event, context) {
    const { id } = JSON.parse(event.body);
    const username = process.env.KEY;
    const password = process.env.SECRET;

    try {
        const response = await axios.get(`https://api.zippin.com.ar/v2/shipments/${id}/tracking`, {
            headers: {
                "Accept": "application/json",
                "Content-Type": "application/json",
                "Authorization": "Basic " + Buffer.from(`${username}:${password}`).toString('base64')
            }
        });
        return {
            statusCode: 200,
            body: JSON.stringify(response.data),
        };
    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({ message: 'Error en la conexión a la API de Zippin' }),
        };
    }
};
