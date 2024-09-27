document.getElementById('login-form').addEventListener('submit', async function (e) {
    e.preventDefault();

    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    try {
        const response = await fetch('/.netlify/functions/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ usuario: username, clave: password }),
        });

        const result = await response.json();

        if (response.ok && result.success) {
            localStorage.setItem('auth', 'true');
            window.location.href = 'trazas.html';
        } else {
            showAlert('Usuario o contraseña incorrectos.', 'danger');
        }
    } catch (error) {
        console.error('Error en la conexión:', error);
        showAlert('Error en la conexión, por favor intenta nuevamente.', 'danger');
    }
});

function showAlert(message, type) {
    const alertBox = document.createElement('div');
    alertBox.className = `alert alert-${type} alert-dismissible fade show`;
    alertBox.innerHTML = `${message} <button type="button" class="btn-close" data-bs-dismiss="alert"></button>`;
    
    // Aquí agregamos el alert al DOM
    document.body.appendChild(alertBox);

    // Remover el alert después de 3 segundos
    setTimeout(() => {
        alertBox.remove();
    }, 3000);
}
