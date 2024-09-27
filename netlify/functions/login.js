exports.handler = async (event) => {
    const body = JSON.parse(event.body);
    const { usuario, clave } = body;

    const validUser = process.env.USUARIO === usuario;
    const validPassword = process.env.CLAVE === clave;

    if (validUser && validPassword) {
        return {
            statusCode: 200,
            body: JSON.stringify({ success: true }),
        };
    } else {
        return {
            statusCode: 401,
            body: JSON.stringify({ success: false }),
        };
    }
};
