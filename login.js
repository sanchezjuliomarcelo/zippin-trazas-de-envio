document.getElementById('login-form').addEventListener('submit', function (e) {
    e.preventDefault();

    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    if (username && password) {
        // Simular una autenticación exitosa
        localStorage.setItem('auth', true);
        window.location.href = 'listado.html';  // Redirigir al listado
    } else {
        alert('Por favor, ingresa un usuario y una contraseña válidos.');
    }
});
