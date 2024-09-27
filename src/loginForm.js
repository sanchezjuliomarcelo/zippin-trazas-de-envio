document.getElementById('login-form').addEventListener('submit', async function (e) {
    e.preventDefault();

    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    try {
        const response = await fetch('/api/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ usuario: username, clave: password }),
        });

        // Verifica que la respuesta sea válida
        if (!response.ok) {
            throw new Error('Error en la respuesta del servidor');
        }

        const data = await response.json();

        if (data.success) {
            localStorage.setItem('auth', 'true');
            window.location.href = 'trazas.html';
        } else {
            showAlert('Usuario o contraseña incorrectos.', 'danger');
        }
    } catch (error) {
        console.error('Error en la conexión:', error);
        showAlert('Ocurrió un error al intentar iniciar sesión. Por favor, intenta de nuevo.', 'danger');
    }
});

