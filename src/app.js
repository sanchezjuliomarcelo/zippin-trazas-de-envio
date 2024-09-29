// Variables para manejar el contador y los envíos cargados
let enviosCargados = new Set(); // Usamos Set para almacenar IDs únicos de envíos

// Función para borrar envíos en pantalla y limpiar el input de archivo
function borrarEnvios() {
    $('#tracking-table tbody').empty();
    $('#enviosCount').text('0'); // Reiniciar el contador en pantalla
    enviosCargados.clear(); // Limpiar el Set para el contador
    $('#file-input').val(''); // Limpiar la selección de archivo
}

// Función para mostrar indicador de carga con GIF
function mostrarIndicadorCarga() {
    const indicador = `
        <div id="indicadorCarga" style="
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background-color: rgba(255, 255, 255, 0.8);
            padding: 20px;
            border-radius: 10px;
            box-shadow: 0 0 15px rgba(0, 0, 0, 0.3);
            z-index: 9999; /* Asegurarse que esté por encima de todos los elementos */
            text-align: center;">
            <p>Cargando...</p>
            <img src="https://mysejahtera.malaysia.gov.my/register/images/loader.gif" alt="Cargando" />
        </div>
    `;
    $('body').append(indicador); // Añadir el indicador de carga a la página
}

// Función para ocultar el indicador de carga
function ocultarIndicadorCarga() {
    $('#indicadorCarga').remove(); // Eliminar el indicador de carga
}

// Función para actualizar el contador de envíos cargados
function actualizarContador() {
    $('#enviosCount').text(enviosCargados.size); // Mostrar el tamaño del Set (IDs únicos)
}

document.addEventListener('DOMContentLoaded', function () {
    if (!localStorage.getItem('auth')) {
        window.location.href = 'index.html'; 
        return; 
    }

    // Agregar botón de borrar envíos en pantalla
    const botonBorrar = `<button id="borrar-envios" class="btn btn-danger">Borrar todos los envíos</button>`;
    $('#file-upload-form').append(botonBorrar);

    // Evento para borrar envíos
    $('#borrar-envios').click(function () {
        borrarEnvios();
        ocultarIndicadorCarga(); // Asegurarse de que el indicador de carga también desaparezca
    });

    // Evento para manejar el archivo subido
    document.getElementById('file-upload-form').addEventListener('submit', function (e) {
        e.preventDefault();

        const fileInput = document.getElementById('file-input');
        const file = fileInput.files[0];

        if (!file) {
            alert('Por favor, selecciona un archivo.');
            return;
        }

 // Mostrar el indicador de carga al iniciar el procesamiento
        mostrarIndicadorCarga();

        const reader = new FileReader();
        reader.onload = function (e) {
            const data = new Uint8Array(e.target.result);
            const workbook = XLSX.read(data, { type: 'array' });
            const firstSheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[firstSheetName];
            const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }); // Leer sin encabezados

            const ids = jsonData.map(row => row[0]); // Obtener IDs de la columna A
            let promises = [];

            ids.forEach(id => {
                if (id) { // Verificar que el ID no esté vacío
                    promises.push(getTrackingData(id));
                }
            });

            // Cuando todas las peticiones terminen, ocultar el indicador de carga
            Promise.all(promises).then(() => {
                ocultarIndicadorCarga();
            });
        };
        reader.readAsArrayBuffer(file);
    });

    async function getTrackingData(id) {
        try {
            // Cambiar la ruta a la correcta para Netlify Functions
            const response = await fetch('.netlify/functions/getCredentials'); 
            
            if (!response.ok) {
                throw new Error('Error al obtener credenciales'); // Manejar si no se encuentra
            }
            
            const credentials = await response.json();
    
            const settings = {
                url: `https://api.zippin.com.ar/v2/shipments/${id}/tracking`,
                method: "GET",
                headers: {
                    "Accept": "application/json",
                    "Content-Type": "application/json",
                    "Authorization": `Basic ${btoa(credentials.KEY + ':' + credentials.SECRET)}` // Basic Auth
                }
            };
    
            const trackingResponse = await $.ajax(settings);
            displayTrackingData(trackingResponse, id);
        } catch (error) {
            alert(error.message); // Muestra el mensaje de error
        }
    }

    function displayTrackingData(data, id) {
        const tableBody = document.querySelector('#tracking-table tbody');

        if (Array.isArray(data)) { // Verificar si data es un array
            data.forEach(trackingEvent => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${id}</td>
                    <td>${trackingEvent.status.visible_name}</td>
                    <td>${new Date(trackingEvent.created_at).toLocaleString()}</td>
                    <td>${trackingEvent.status.name}</td>
                `;
                tableBody.appendChild(row);
            });
        } else {
            alert(`No se encontraron eventos de seguimiento para el ID ${id}`);
        }

        // Agregar ID al Set para contar solo los envíos únicos
        enviosCargados.add(id);
        actualizarContador(); // Actualizar el contador en pantalla

        document.getElementById('export-button').style.display = 'block';
    }

    // Funcionalidad para exportar datos a Excel
    document.getElementById('export-button').addEventListener('click', function () {
        const table = document.getElementById('tracking-table');
        const wb = XLSX.utils.table_to_book(table, { sheet: "Tracking" });
        XLSX.writeFile(wb, 'tracking_data.xlsx');
    });
});
