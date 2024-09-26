document.getElementById("loginForm").addEventListener("submit", async function(event) {
    event.preventDefault();

    // Capturar los valores del formulario
    const email = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    try {
        // Realizar una solicitud a un endpoint que verifique las credenciales
        const response = await fetch('/api/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });

        if (response.ok) {
            // Si la autenticación es exitosa, redirigir al listado
            window.location.href = "listado.html";
        } else {
            alert('Credenciales incorrectas. Inténtalo de nuevo.');
        }
    } catch (error) {
        console.error('Error al iniciar sesión:', error);
    }
});