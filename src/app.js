// Variables para manejar el contador y los productos cargados
let productosCargados = new Set(); // Usamos Set para almacenar IDs únicos

// Función para borrar productos en pantalla y limpiar el input de archivo
function borrarProductos() {
    $('#tracking-table tbody').empty();
    $('#productCount').text('0');
    productosCargados.clear(); // Limpiar el Set para el contador
    $('#file-input').val(''); // Limpiar la selección de archivo
}

// Función para mostrar indicador de carga con GIF
function mostrarIndicadorCarga() {
    const indicador = `
        <div id="indicadorCarga" class="text-center">
            <p>Cargando...</p>
            <img src="https://mysejahtera.malaysia.gov.my/register/images/loader.gif" alt="Cargando" />
        </div>
    `;
    $('body').append(indicador); // Añadir el indicador a la página
}

// Función para ocultar indicador de carga
function ocultarIndicadorCarga() {
    $('#indicadorCarga').remove(); // Eliminar el indicador de la página
}

// Función para actualizar el contador de IDs cargados
function actualizarContador() {
    $('#productCount').text(productosCargados.size); // Mostrar tamaño del Set (IDs únicos)
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
    $('#borrar-productos').click(function () {
        borrarProductos();
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

        // Agregar ID al Set para contar solo los IDs únicos
        productosCargados.add(id);
        actualizarContador(); // Actualizar el contador en pantalla

        document.getElementById('export-button').style.display = 'block';
    }

    document.getElementById('export-button').addEventListener('click', function () {
        const table = document.getElementById('tracking-table');
        const wb = XLSX.utils.table_to_book(table, { sheet: "Tracking" });
        XLSX.writeFile(wb, 'tracking_data.xlsx');
    });
});
