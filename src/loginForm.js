document.getElementById('login-form').addEventListener('submit', async function (e) {
    e.preventDefault();

    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    try {
        const response = await fetch('/api/login', { // Cambia esto según la ruta de tu API
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ usuario: username, clave: password }),
        });

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

function showAlert(message, type) {
    const alertPlaceholder = document.createElement('div');
    alertPlaceholder.innerHTML = `
        <div class="alert alert-${type} alert-dismissible fade show" role="alert">
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        </div>
    `;
    document.body.prepend(alertPlaceholder);
}
