document.getElementById('login-form').addEventListener('submit', function (e) {
    e.preventDefault();

    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    // Validar con las variables de entorno en Vercel
    const apiUsuario = process.env.USUARIO; // Variable de entorno
    const apiClave = process.env.CLAVE; // Variable de entorno

    if (username === apiUsuario && password === apiClave) {
        localStorage.setItem('auth', 'true'); // Guardar estado de autenticación
        window.location.href = 'trazas.html'; // Redirigir a trazas
    } else {
        alert('Usuario o contraseña incorrectos.');
    }
});