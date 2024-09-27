const handler = async (event, context) => {
    // Devuelve las variables de entorno
    const credentials = {
        KEY: process.env.KEY,
        SECRET: process.env.SECRET
    };

    return {
        statusCode: 200,
        body: JSON.stringify(credentials)
    };
};

export { handler };
