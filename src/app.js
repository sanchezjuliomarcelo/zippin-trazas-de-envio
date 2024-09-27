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
            const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

            const ids = jsonData.map(row => row[0]); // Acceder a la columna A
            ids.forEach(id => {
                getTrackingData(id);
            });
        };
        reader.readAsArrayBuffer(file);
    });

    function getTrackingData(id) {
        $.ajax({
            url: '/.netlify/functions/tracking',  // Cambia esto
            method: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({ id }),
        })
        .done(function (response) {
            displayTrackingData(response, id);
        })
        .fail(function () {
            alert(`Error al obtener el seguimiento del ID ${id}`);
        });
    }

    function displayTrackingData(data, id) {
        const tableBody = document.querySelector('#tracking-table tbody');

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

        document.getElementById('export-button').style.display = 'block';
    }

    document.getElementById('export-button').addEventListener('click', function () {
        const table = document.getElementById('tracking-table');
        const wb = XLSX.utils.table_to_book(table, { sheet: "Tracking" });
        XLSX.writeFile(wb, 'tracking_data.xlsx');
    });
});
