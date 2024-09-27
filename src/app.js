document.addEventListener('DOMContentLoaded', function () {
    if (!localStorage.getItem('auth')) {
        window.location.href = 'index.html'; 
        return; 
    }

    document.getElementById('file-upload-form').addEventListener('submit', async function (e) {
        e.preventDefault();

        const fileInput = document.getElementById('file-input');
        const file = fileInput.files[0];

        if (!file) {
            alert('Por favor, selecciona un archivo.');
            return;
        }

        const reader = new FileReader();
        reader.onload = function (e) {
            const data = new Uint8Array(e.target.result);
            const workbook = XLSX.read(data, { type: 'array' });
            const firstSheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[firstSheetName];
            const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }); // Leer sin encabezados

            const ids = jsonData.map(row => row[0]); // Obtener IDs de la columna A
            const validIds = ids.filter(id => id); // Filtrar IDs no vacíos

            // Mostrar contador
            const counterDiv = document.getElementById('counter');
            counterDiv.style.display = 'block';
            counterDiv.innerHTML = `Se encontraron ${validIds.length} ID(s) en el archivo.`;

            // Mostrar "reloj" de carga
            const loadingDiv = document.createElement('div');
            loadingDiv.className = 'alert alert-warning';
            loadingDiv.innerHTML = 'Cargando...';
            document.body.appendChild(loadingDiv);

            // Obtener datos de seguimiento
            for (const id of validIds) {
                await getTrackingData(id);
            }

            // Ocultar "reloj" de carga
            loadingDiv.remove();
        };
        reader.readAsArrayBuffer(file);
    });

    async function getTrackingData(id) {
        const response = await fetch('/.netlify/functions/getCredentials');
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

        $.ajax(settings).done(function (response) {
            displayTrackingData(response, id);
        }).fail(function () {
            alert(`Error al obtener el seguimiento del ID ${id}`);
        });
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
        document.getElementById('clear-button').style.display = 'block'; // Mostrar botón de borrar
    }

    document.getElementById('export-button').addEventListener('click', function () {
        const table = document.getElementById('tracking-table');
        const wb = XLSX.utils.table_to_book(table, { sheet: "Tracking" });
        XLSX.writeFile(wb, 'tracking_data.xlsx');
    });

    document.getElementById('clear-button').addEventListener('click', function () {
        const tableBody = document.querySelector('#tracking-table tbody');
        tableBody.innerHTML = ''; // Limpiar la tabla
        document.getElementById('counter').style.display = 'none'; // Ocultar contador
        document.getElementById('export-button').style.display = 'none'; // Ocultar botón de exportar
        this.style.display = 'none'; // Ocultar botón de borrar
    });
});
