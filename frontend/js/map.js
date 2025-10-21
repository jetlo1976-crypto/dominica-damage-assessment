let map;
let hoveredPolygonId = null;

function initializeMap() {
    map = new mapboxgl.Map({
        container: 'map',
        style: 'mapbox://styles/jet-martin/cmgtf928w000x01qxat7j9z5z',
    });

    map.on('load', () => {
        const initialMapState = {
            center: map.getCenter(),
            zoom: map.getZoom(),
            pitch: map.getPitch(),
            bearing: map.getBearing()
        };

        setupMapSources();
        setupMapLayers();
        setupMapInteractions(initialMapState);
        setupResetButton(initialMapState);

        // ADD BUILDING POPUPS HERE - after layers are created
        setupBuildingPopups();

        // Load the dashboard
        loadDamageSummary();
    });

    setupMapEvents();
}

// ... your existing setupMapSources(), setupMapLayers(), etc. ...

function setupMapSources() {
    console.log('📦 Setting up map sources...');

    map.addSource('hexa', {
        type: 'geojson',
        data: "https://raw.githubusercontent.com/jetlo1976-crypto/dominica_hexa/refs/heads/main/hexagon_grid",
        generateId: true
    });

    map.addSource('buildings', {
        type: 'geojson',
        data: "https://raw.githubusercontent.com/jetlo1976-crypto/dominica_hexa/refs/heads/main/buildings",
        generateId: true
    });
}

function setupMapLayers() {
    console.log('🎨 Setting up map layers...');

    // Hexagon layer
    map.addLayer({
        'id': 'test',
        'type': 'fill',
        'source': 'hexa',
        'layout': {},
        'paint': {
            'fill-color': '#CD5C5C',
            'fill-opacity': [
                'case',
                ['boolean', ['feature-state', 'hover'], false],
                1,
                0.5
            ]
        },
        'maxzoom': 14
    });

    // Outline layer
    map.addLayer({
        'id': 'outline',
        'type': 'line',
        'source': 'hexa',
        'layout': {},
        'paint': {
            'line-color': '#c6afaf'
        }
    });

    // Buildings layer
    map.addLayer({
        'id': 'buildings_damage',
        'type': 'circle',
        'source': 'buildings',
        'paint': {
            'circle-color': [
                'match',
                ['get', 'Category_i'],
                1, '#2a630e',
                2, '#d1d569',
                3, '#d57438',
                4, '#cd2667',
                '#cccccc'
            ],
            'circle-radius': 5,
            'circle-stroke-width': 0.5,
            'circle-stroke-color': '#ffffff'
        },
        'minzoom': 14,
    });
}

function setupMapInteractions(initialMapState) {
    // Mouse enter/leave
    map.on('mouseenter', 'test', () => {
        map.getCanvas().style.cursor = 'pointer';
    });

    map.on('mouseleave', 'test', () => {
        map.getCanvas().style.cursor = '';
    });

    // Feature state handling
    map.on('mousemove', 'test', (e) => {
        if (e.features && e.features.length > 0) {
            const feature = e.features[0];
            if (feature.id === undefined) return;

            if (hoveredPolygonId !== null) {
                map.setFeatureState({ source: 'hexa', id: hoveredPolygonId }, { hover: false });
            }
            hoveredPolygonId = feature.id;
            map.setFeatureState({ source: 'hexa', id: hoveredPolygonId }, { hover: true });
        }
    });

    map.on('mouseleave', 'test', () => {
        if (hoveredPolygonId !== null) {
            map.setFeatureState({ source: 'hexa', id: hoveredPolygonId }, { hover: false });
        }
        hoveredPolygonId = null;
    });
}

function setupMapEvents() {
    map.on('click', 'test', (e) => {
        map.flyTo({
            center: e.lngLat,
            zoom: 14
        });
        map.getCanvas().style.cursor = 'crosshair';
    });

    map.on('error', (e) => {
        showError('Map failed to load: ' + (e.error?.message || 'Unknown error'));
    });
}

function setupResetButton(initialMapState) {
    const resetButton = document.getElementById('resetMapBtn');
    resetButton.addEventListener('click', () => {
        map.flyTo({
            center: initialMapState.center,
            zoom: initialMapState.zoom,
            bearing: initialMapState.bearing,
            pitch: initialMapState.pitch,
            duration: 1500
        });
    });
}

// NEW FUNCTION: Add building popups (call this INSIDE map load)
function setupBuildingPopups() {
    console.log('🏠 Setting up building popups...');

    // Remove any duplicate event listeners first
    map.off('click', 'buildings_damage');
    map.off('mouseenter', 'buildings_damage');
    map.off('mouseleave', 'buildings_damage');

    // Building click handler
    map.on('click', 'buildings_damage', (e) => {
        console.log('🏠 Building clicked!', e.features[0].properties);

        // Get the building data
        const buildingData = e.features[0].properties;
        const coordinates = e.lngLat;

        // Show ALL available properties for debugging
        let debugHTML = '<h4>Building Data</h4><div style="max-height: 200px; overflow-y: auto; font-size: 12px;">';
        for (const [key, value] of Object.entries(buildingData)) {
            debugHTML += `<p><strong>${key}:</strong> ${value}</p>`;
        }
        debugHTML += '</div>';

        new mapboxgl.Popup()
            .setLngLat(coordinates)
            .setHTML(debugHTML)
            .addTo(map);
    });

    // Hover effects
    map.on('mouseenter', 'buildings_damage', () => {
        map.getCanvas().style.cursor = 'pointer';
        console.log('🖱️ Hovering over building');
    });

    map.on('mouseleave', 'buildings_damage', () => {
        map.getCanvas().style.cursor = '';
    });
}