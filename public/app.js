document.addEventListener('DOMContentLoaded', function () {
    // Verificar si el usuario ha iniciado sesión
    if (!localStorage.getItem('auth')) {
        window.location.href = 'login.html';  // Redirigir al login si no ha iniciado sesión
    }

    // Procesar archivo XLS
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
            const jsonData = XLSX.utils.sheet_to_json(worksheet);

            const ids = jsonData.map(row => row.ID);

            ids.forEach(id => {
                getTrackingData(id);
            });
        };
        reader.readAsArrayBuffer(file);
    });

    function getTrackingData(id) {
        const apiKey = localStorage.getItem('auth'); // Asumiendo que guardaste el token en localStorage

        const settings = {
            url: `https://api.zippin.com.ar/v2/shipments/${id}/tracking`,
            method: "GET",
            timeout: 0,
            headers: {
                "Accept": "application/json",
                "Content-Type": "application/json",
                "Authorization": `Bearer ${apiKey}` // Utiliza el token aquí
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

        data.forEach(trackingEvent => {
            const row = document.createElement('tr');

            const idCell = document.createElement('td');
            idCell.textContent = id;

            const statusCell = document.createElement('td');
            statusCell.textContent = trackingEvent.status.visible_name;

            const createdAtCell = document.createElement('td');
            createdAtCell.textContent = new Date(trackingEvent.created_at).toLocaleString();

            const currentLocationCell = document.createElement('td');
            currentLocationCell.textContent = trackingEvent.status.name;

            row.appendChild(idCell);
            row.appendChild(statusCell);
            row.appendChild(createdAtCell);
            row.appendChild(currentLocationCell);

            tableBody.appendChild(row);
        });

        document.getElementById('export-button').style.display = 'block';
    }

    document.getElementById('export-button').addEventListener('click', function () {
        const table = document.getElementById('tracking-table');
        const wb = XLSX.utils.table_to_book(table, { sheet: "Tracking" });
        XLSX.writeFile(wb, 'tracking_data.xlsx');
    });
});
