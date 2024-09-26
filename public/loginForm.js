$(document).ready(function() {
    $('#login-form').on('submit', function(event) {
        event.preventDefault(); // Prevenir el envío normal del formulario

        const username = $('#username').val();
        const password = $('#password').val();

        // Llamada al endpoint de login
        $.ajax({
            url: '/api/login',
            method: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({
                username: username,
                password: password
            }),
            success: function(response) {
                // Manejar el inicio de sesión exitoso
                alert('Inicio de sesión exitoso');
                // Redirigir a la página de listado o hacer lo que necesites
                window.location.href = 'index.html';
            },
            error: function(xhr) {
                // Manejar error de inicio de sesión
                alert('Error en el inicio de sesión: ' + xhr.responseJSON.message);
            }
        });
    });
});
