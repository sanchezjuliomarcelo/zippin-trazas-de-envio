// Función para borrar productos en pantalla
function borrarProductos() {
    $('#tracking-table tbody').empty();
    $('#productCount').text('0');
}

// Función para mostrar indicador de carga
function mostrarIndicadorCarga() {
    const indicador = `
        <div id="indicadorCarga" class="text-center">
            <p>Cargando...</p>
            <img src="https://mysejahtera.malaysia.gov.my/register/images/loader.gif" alt="Cargando" />
        </div>
    `;
    $('body').append(indicador);
}

// Función para ocultar indicador de carga
function ocultarIndicadorCarga() {
    $('#indicadorCarga').remove();
}

document.addEventListener('DOMContentLoaded', function () {
    if (!localStorage.getItem('auth')) {
        window.location.href = 'index.html'; 
        return; 
    }

    // Agregar botón de borrar productos en pantalla
    const botonBorrar = `<button id="borrar-productos" class="btn btn-danger">Borrar todos los datos</button>`;
    $('#file-upload-form').append(botonBorrar);

    // Evento para borrar productos
    $('#borrar-productos').click(borrarProductos);

    document.getElementById('file-upload-form').addEventListener('submit', function (e) {
        e.preventDefault();

        const fileInput = document.getElementById('file-input');
        const file = fileInput.files[0];

        if (!file) {
            alert('Por favor, selecciona un archivo.');
            return;
        }

        // Mostrar el indicador de carga
        mostrarIndicadorCarga();

        const reader = new FileReader();
        reader.onload = function (e) {
            const data = new Uint8Array(e.target.result);
            const workbook = XLSX.read(data, { type: 'array' });
            const firstSheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[firstSheetName];
            const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }); // Leer sin encabezados

            const ids = jsonData.map(row => row[0]); // Obtener IDs de la columna A
            ids.forEach(id => {
                if (id) { // Verificar que el ID no esté vacío
                    getTrackingData(id);
                }
            });

            // Ocultar el indicador de carga cuando se terminen de procesar los datos
            ocultarIndicadorCarga();
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

        document.getElementById('export-button').style.display = 'block';
    }

    document.getElementById('export-button').addEventListener('click', function () {
        const table = document.getElementById('tracking-table');
        const wb = XLSX.utils.table_to_book(table, { sheet: "Tracking" });
        XLSX.writeFile(wb, 'tracking_data.xlsx');
    });
});
