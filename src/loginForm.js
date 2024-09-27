const response = await fetch('/.netlify/functions/login', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
    },
    body: JSON.stringify({ usuario: username, clave: password }),
});
