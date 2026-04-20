// Configuración de la API
const hostname = window.location.hostname;
const API_BASE_URL = window.location.origin + '/api/api';

// Estado global
let map = null;
let modalMap = null;
let modalMarker = null;
let markers = [];
let categories = [];
let subcategories = [];
let points = [];
let activePointId = null;

// Inicialización
document.addEventListener('DOMContentLoaded', () => {
    initializeMap();
    loadInitialData();
    setupEventListeners();
});

// Inicializar mapa Leaflet
function initializeMap() {
    // Centrar en Guatemala
    map = L.map('map').setView([14.6349, -90.5069], 12);

    // Capa de OpenStreetMap
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19
    }).addTo(map);

    // Click en el mapa para obtener coordenadas
    map.on('click', function (e) {
        const { lat, lng } = e.latlng;
        document.getElementById('pointLatitude').value = lat.toFixed(6);
        document.getElementById('pointLongitude').value = lng.toFixed(6);

        // Mostrar modal si no está abierto
        if (!document.getElementById('modalAddPoint').classList.contains('active')) {
            showMessage('Coordenadas capturadas. Haz clic en "Agregar Nuevo Punto" para usarlas.', 'success');
        }
    });
}

// Event listeners
function setupEventListeners() {
    // Botón agregar punto
    document.getElementById('btnAddPoint').addEventListener('click', openAddModal);

    // Modal
    document.querySelector('.modal-close').addEventListener('click', closeModal);
    document.getElementById('btnCancelModal').addEventListener('click', closeModal);

    // Click fuera del modal
    document.getElementById('modalAddPoint').addEventListener('click', function (e) {
        if (e.target === this) closeModal();
    });

    // Formulario agregar punto
    document.getElementById('addPointForm').addEventListener('submit', handleAddPoint);

    // Cambio de categoría
    document.getElementById('pointCategory').addEventListener('change', handleCategoryChange);

    // Filtros
    document.getElementById('filterCategory').addEventListener('change', handleFilterChange);
    document.getElementById('filterSubcategory').addEventListener('change', handleFilterChange);
    document.getElementById('searchBox').addEventListener('input', handleFilterChange);

    // Botón geolocalización
    document.getElementById('btnGeolocate').addEventListener('click', handleGeolocation);

    // Actualizar mapa del modal cuando cambian las coordenadas
    document.getElementById('pointLatitude').addEventListener('input', updateModalMapFromInputs);
    document.getElementById('pointLongitude').addEventListener('input', updateModalMapFromInputs);
}

// Cargar datos iniciales
async function loadInitialData() {
    try {
        await loadCategories();
        await loadSubcategories();
        await loadPoints();
    } catch (error) {
        console.error('Error loading initial data:', error);
        showMessage('Error al cargar los datos iniciales. Verifica que la API esté corriendo.', 'error');
    }
}

// API Calls
async function apiRequest(endpoint, options = {}) {
    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            },
            ...options
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error('API Request Error:', error);
        throw error;
    }
}

// Cargar categorías
async function loadCategories() {
    try {
        categories = await apiRequest('/categories');
        populateCategorySelects();
    } catch (error) {
        showMessage('Error al cargar las categorías', 'error');
    }
}

// Cargar subcategorías
async function loadSubcategories() {
    try {
        subcategories = await apiRequest('/subcategories');
    } catch (error) {
        showMessage('Error al cargar las subcategorías', 'error');
    }
}

// Cargar puntos
async function loadPoints() {
    try {
        points = await apiRequest('/points-of-interest');
        displayPoints(points);
        updateMap(points);
    } catch (error) {
        showMessage('Error al cargar los puntos de interés', 'error');
    }
}

// Mostrar puntos en el sidebar
function displayPoints(pointsToDisplay) {
    const listContainer = document.getElementById('pointsList');
    const countElement = document.getElementById('resultsCount');

    countElement.textContent = pointsToDisplay.length;

    if (pointsToDisplay.length === 0) {
        listContainer.innerHTML = '<p class="loading">No hay puntos de interés</p>';
        return;
    }

    listContainer.innerHTML = pointsToDisplay.map(point => `
        <div class="point-item ${point.id === activePointId ? 'active' : ''}" onclick="selectPoint(${point.id})">
            <h4>${point.name}</h4>
            <div>
                <span class="category-badge">${point.subcategory?.category?.name || 'Sin categoría'}</span>
                <span class="subcategory-badge">${point.subcategory?.name || 'Sin subcategoría'}</span>
            </div>
            ${point.description ? `<p class="description">${point.description}</p>` : ''}
            <p class="coordinates">📍 ${point.latitude.toFixed(6)}, ${point.longitude.toFixed(6)}</p>
            <div class="actions">
                <button class="btn btn-danger" onclick="deletePoint(${point.id}, event)">🗑️</button>
            </div>
        </div>
    `).join('');
}

// Actualizar mapa con marcadores
function updateMap(pointsToDisplay) {
    // Limpiar marcadores existentes
    markers.forEach(marker => map.removeLayer(marker));
    markers = [];

    if (pointsToDisplay.length === 0) return;

    // Agregar nuevos marcadores
    pointsToDisplay.forEach(point => {
        const marker = L.marker([point.latitude, point.longitude])
            .addTo(map)
            .bindPopup(createPopupContent(point));

        marker.pointId = point.id;

        marker.on('click', () => {
            selectPoint(point.id);
        });

        markers.push(marker);
    });

    // Ajustar vista del mapa
    if (pointsToDisplay.length > 0) {
        const group = L.featureGroup(markers);
        map.fitBounds(group.getBounds().pad(0.1));
    }
}

// Crear contenido del popup
function createPopupContent(point) {
    return `
        <div class="popup-content">
            <h3>${point.name}</h3>
            <div>
                <span class="badge">${point.subcategory?.category?.name || 'Sin categoría'}</span>
                <span class="badge subcategory">${point.subcategory?.name || 'Sin subcategoría'}</span>
            </div>
            ${point.description ? `<p>${point.description}</p>` : ''}
            <p class="coords">📍 ${point.latitude.toFixed(6)}, ${point.longitude.toFixed(6)}</p>
            <div class="popup-actions">
                <button class="btn btn-danger" onclick="deletePoint(${point.id}, event)">🗑️ Eliminar</button>
            </div>
        </div>
    `;
}

// Seleccionar punto
function selectPoint(pointId) {
    activePointId = pointId;

    // Actualizar UI
    document.querySelectorAll('.point-item').forEach(item => {
        item.classList.remove('active');
    });
    event.currentTarget?.classList.add('active');

    // Centrar mapa en el marcador
    const point = points.find(p => p.id === pointId);
    if (point) {
        map.setView([point.latitude, point.longitude], 15);

        // Abrir popup del marcador
        const marker = markers.find(m => m.pointId === pointId);
        if (marker) {
            marker.openPopup();
        }
    }
}

// Popular selects de categorías
function populateCategorySelects() {
    const filterCategorySelect = document.getElementById('filterCategory');
    const pointCategorySelect = document.getElementById('pointCategory');

    const categoryOptions = categories.map(cat =>
        `<option value="${cat.id}">${cat.name}</option>`
    ).join('');

    filterCategorySelect.innerHTML = '<option value="">Todas</option>' + categoryOptions;
    pointCategorySelect.innerHTML = '<option value="">Seleccione...</option>' + categoryOptions;
}

// Manejar cambio de categoría en formulario
function handleCategoryChange(e) {
    const categoryId = parseInt(e.target.value);
    const subcategorySelect = document.getElementById('pointSubcategory');
    const filterSubcategorySelect = document.getElementById('filterSubcategory');

    if (!categoryId) {
        subcategorySelect.innerHTML = '<option value="">Primero seleccione categoría</option>';
        subcategorySelect.disabled = true;
        return;
    }

    const filteredSubcategories = subcategories.filter(sub => sub.categoryId === categoryId);

    subcategorySelect.innerHTML = '<option value="">Seleccione...</option>' +
        filteredSubcategories.map(sub =>
            `<option value="${sub.id}">${sub.name}</option>`
        ).join('');

    subcategorySelect.disabled = false;
}

// Manejar filtros
function handleFilterChange() {
    const categoryId = document.getElementById('filterCategory').value;
    const subcategoryId = document.getElementById('filterSubcategory').value;
    const searchText = document.getElementById('searchBox').value.toLowerCase();

    let filteredPoints = [...points];

    // Filtrar por búsqueda de texto
    if (searchText) {
        filteredPoints = filteredPoints.filter(point =>
            point.name.toLowerCase().includes(searchText) ||
            (point.description && point.description.toLowerCase().includes(searchText))
        );
    }

    // Filtrar por categoría
    if (categoryId) {
        filteredPoints = filteredPoints.filter(point =>
            point.subcategory?.category?.id === parseInt(categoryId)
        );

        // Actualizar subcategorías en filtro
        const filterSubcategorySelect = document.getElementById('filterSubcategory');
        const currentSubcategoryId = subcategoryId; // Guardar el valor actual
        const filteredSubcats = subcategories.filter(sub => sub.categoryId === parseInt(categoryId));
        filterSubcategorySelect.innerHTML = '<option value="">Todas</option>' +
            filteredSubcats.map(sub =>
                `<option value="${sub.id}"${sub.id === parseInt(currentSubcategoryId) ? ' selected' : ''}>${sub.name}</option>`
            ).join('');
    }

    // Filtrar por subcategoría
    if (subcategoryId) {
        filteredPoints = filteredPoints.filter(point =>
            point.subcategoryId === parseInt(subcategoryId)
        );
    }

    displayPoints(filteredPoints);
    updateMap(filteredPoints);
}

// Modal
function openAddModal() {
    document.getElementById('modalAddPoint').classList.add('active');

    // Inicializar mapa del modal después de que el modal sea visible
    setTimeout(() => {
        initializeModalMap();
    }, 100);
}

function closeModal() {
    document.getElementById('modalAddPoint').classList.remove('active');
    document.getElementById('addPointForm').reset();

    // Limpiar el mapa del modal
    if (modalMap) {
        modalMap.remove();
        modalMap = null;
        modalMarker = null;
    }
}

// Inicializar mapa del modal
function initializeModalMap() {
    // Si ya existe, no recrear
    if (modalMap) {
        modalMap.invalidateSize();
        return;
    }

    // Obtener coordenadas actuales o usar default
    const lat = parseFloat(document.getElementById('pointLatitude').value) || 14.6349;
    const lng = parseFloat(document.getElementById('pointLongitude').value) || -90.5069;

    // Crear mapa
    modalMap = L.map('modalMap').setView([lat, lng], 13);

    // Agregar tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19
    }).addTo(modalMap);

    // Agregar marcador
    modalMarker = L.marker([lat, lng], {
        draggable: true
    }).addTo(modalMap);

    // Cuando se arrastra el marcador, actualizar inputs
    modalMarker.on('dragend', function (e) {
        const position = e.target.getLatLng();
        document.getElementById('pointLatitude').value = position.lat.toFixed(6);
        document.getElementById('pointLongitude').value = position.lng.toFixed(6);
    });

    // Click en el mapa para mover el marcador
    modalMap.on('click', function (e) {
        const { lat, lng } = e.latlng;
        document.getElementById('pointLatitude').value = lat.toFixed(6);
        document.getElementById('pointLongitude').value = lng.toFixed(6);

        // Mover marcador
        modalMarker.setLatLng([lat, lng]);
    });
}

// Actualizar marcador del modal desde los inputs
function updateModalMapFromInputs() {
    if (!modalMap || !modalMarker) return;

    const lat = parseFloat(document.getElementById('pointLatitude').value);
    const lng = parseFloat(document.getElementById('pointLongitude').value);

    if (!isNaN(lat) && !isNaN(lng) && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
        modalMarker.setLatLng([lat, lng]);
        modalMap.setView([lat, lng], modalMap.getZoom());
    }
}

// Geolocalización
function handleGeolocation() {
    const button = document.getElementById('btnGeolocate');

    if (!navigator.geolocation) {
        showMessage('❌ Tu navegador no soporta geolocalización', 'error');
        return;
    }

    // Deshabilitar botón mientras se obtiene ubicación
    button.disabled = true;
    button.textContent = '⏳ Obteniendo ubicación...';

    navigator.geolocation.getCurrentPosition(
        // Éxito
        (position) => {
            const lat = position.coords.latitude;
            const lng = position.coords.longitude;

            // Actualizar inputs
            document.getElementById('pointLatitude').value = lat.toFixed(6);
            document.getElementById('pointLongitude').value = lng.toFixed(6);

            // Actualizar mapa
            if (modalMap && modalMarker) {
                modalMarker.setLatLng([lat, lng]);
                modalMap.setView([lat, lng], 15);
            }

            showMessage('✅ Ubicación obtenida correctamente', 'success');

            // Restaurar botón
            button.disabled = false;
            button.textContent = '📡 Usar Mi Ubicación Actual';
        },
        // Error
        (error) => {
            let errorMessage = '';

            switch (error.code) {
                case error.PERMISSION_DENIED:
                    errorMessage = '❌ Debes activar los permisos de ubicación en tu navegador para usar esta función. Ve a configuración del sitio y permite el acceso a la ubicación.';
                    break;
                case error.POSITION_UNAVAILABLE:
                    errorMessage = '❌ No se pudo obtener tu ubicación. Verifica tu conexión GPS.';
                    break;
                case error.TIMEOUT:
                    errorMessage = '❌ El tiempo de espera se agotó al obtener la ubicación. Inténtalo nuevamente.';
                    break;
                default:
                    errorMessage = '❌ Error desconocido al obtener la ubicación.';
            }

            showMessage(errorMessage, 'error');

            // Restaurar botón
            button.disabled = false;
            button.textContent = '📡 Usar Mi Ubicación Actual';
        },
        // Opciones
        {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0
        }
    );
}

// Agregar nuevo punto
async function handleAddPoint(e) {
    e.preventDefault();

    const formData = {
        name: document.getElementById('pointName').value,
        description: document.getElementById('pointDescription').value,
        subcategoryId: parseInt(document.getElementById('pointSubcategory').value),
        latitude: parseFloat(document.getElementById('pointLatitude').value),
        longitude: parseFloat(document.getElementById('pointLongitude').value)
    };

    try {
        await apiRequest('/points-of-interest', {
            method: 'POST',
            body: JSON.stringify(formData)
        });

        showMessage('✅ Punto de interés agregado exitosamente', 'success');
        closeModal();
        await loadPoints();
    } catch (error) {
        showMessage('❌ Error al agregar el punto de interés', 'error');
    }
}

// Eliminar punto
async function deletePoint(id, event) {
    event?.stopPropagation();

    if (!confirm('¿Está seguro de eliminar este punto de interés?')) {
        return;
    }

    try {
        await apiRequest(`/points-of-interest/${id}`, {
            method: 'DELETE'
        });

        showMessage('✅ Punto eliminado exitosamente', 'success');
        await loadPoints();
    } catch (error) {
        showMessage('❌ Error al eliminar el punto', 'error');
    }
}

// Mensajes
function showMessage(message, type) {
    // Remover mensajes anteriores
    const existingMessages = document.querySelectorAll('.message-toast');
    existingMessages.forEach(msg => msg.remove());

    const messageDiv = document.createElement('div');
    messageDiv.className = `message-toast ${type}`;
    messageDiv.textContent = message;
    messageDiv.style.cssText = `
        position: fixed;
        top: calc(var(--header-height) + 20px);
        right: 20px;
        padding: 15px 20px;
        border-radius: 8px;
        box-shadow: var(--shadow-lg);
        z-index: 3000;
        max-width: 400px;
        animation: slideIn 0.3s ease-out;
    `;

    document.body.appendChild(messageDiv);

    setTimeout(() => {
        messageDiv.style.animation = 'slideOut 0.3s ease-out';
        setTimeout(() => messageDiv.remove(), 300);
    }, 4000);
}

// Agregar animaciones CSS para los mensajes
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from { transform: translateX(400px); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(400px); opacity: 0; }
    }
`;
document.head.appendChild(style);
