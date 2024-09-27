document.addEventListener('DOMContentLoaded', function () {
    if (!localStorage.getItem('auth')) {
        window.location.href = 'index.html'; 
        return; 
    }

    document.getElementById('file-upload-form').addEventListener('submit', function (e) {
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
            ids.forEach(id => {
                if (id) { // Verificar que el ID no esté vacío
                    getTrackingData(id);
                }
            });
        };
        reader.readAsArrayBuffer(file);
    });

    async function fetchCredentials() {
        const response = await fetch('/.netlify/functions/getCredentials');
        if (response.ok) {
            const data = await response.json();
            return data; // Devuelve el objeto con KEY y SECRET
        } else {
            throw new Error('Error al obtener las credenciales');
        }
    }

    async function getTrackingData(id) {
        try {
            const { KEY, SECRET } = await fetchCredentials(); // Llama a la función que obtiene las credenciales

            const settings = {
                url: `https://api.zippin.com.ar/v2/shipments/${id}/tracking`,
                method: "GET",
                headers: {
                    "Accept": "application/json",
                    "Content-Type": "application/json",
                    "Authorization": `Basic ${btoa(KEY + ':' + SECRET)}` // Basic Auth
                }
            };

            $.ajax(settings).done(function (response) {
                displayTrackingData(response, id);
            }).fail(function () {
                alert(`Error al obtener el seguimiento del ID ${id}`);
            });
        } catch (error) {
            console.error(error);
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
