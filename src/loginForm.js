document.getElementById('login-form').addEventListener('submit', function (e) {
    e.preventDefault();

    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    // Enviar credenciales al servidor para validación
    fetch('/api/login', {  // Ajusta la ruta según tu estructura
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ usuario: username, clave: password })
    })
    .then(response => {
        if (response.ok) {
            localStorage.setItem('auth', 'true'); // Guardar estado de autenticación
            window.location.href = 'trazas.html'; // Redirigir a trazas
        } else {
            alert('Usuario o contraseña incorrectos.');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('Hubo un problema con la validación.');
    });
});
