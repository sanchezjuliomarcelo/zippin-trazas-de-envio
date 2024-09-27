document.getElementById('login-form').addEventListener('submit', function (e) {
    e.preventDefault();

    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    const apiUsuario = 'tu_usuario'; // Cambia esto por la forma en que obtienes el usuario
    const apiClave = 'tu_clave'; // Cambia esto por la forma en que obtienes la clave

    if (username === apiUsuario && password === apiClave) {
        localStorage.setItem('auth', 'true');
        window.location.href = 'trazas.html';
    } else {
        alert('Usuario o contraseña incorrectos.');
    }
});
