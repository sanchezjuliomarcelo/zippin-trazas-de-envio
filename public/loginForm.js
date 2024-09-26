document.getElementById('login-form').addEventListener('submit', function (e) {
    e.preventDefault();

    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    const settings = {
        url: 'https://api.zippin.com.ar/v2/login', // Asegúrate de que esta URL sea la correcta
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        data: JSON.stringify({
            usuario: username,
            clave: password
        })
    };

    $.ajax(settings).done(function (response) {
        // Almacena el token de autorización en localStorage
        localStorage.setItem('auth', response.token); // Ajusta esto según el formato de la respuesta
        window.location.href = 'index.html'; // Redirigir al listado después de iniciar sesión
    }).fail(function () {
        alert('Error al iniciar sesión. Verifica tus credenciales.');
    });
});