// Main application initialization
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Starting Dominica application...');

    // Check if Mapbox GL JS loaded successfully
    if (typeof mapboxgl === 'undefined') {
        showError('Failed to load Mapbox GL JS');
    } else {
        mapboxgl.accessToken = 'pk.eyJ1IjoiamV0LW1hcnRpbiIsImEiOiJjbWdxaHV6ZmowNnBiMmtxcXQxMDVpb2c0In0.wyLe7cifd7KztRsrARVSuQ';

        if (!mapboxgl.accessToken) {
            showError('Mapbox access token is required');
        } else {
            initializeMap();
        }
    }
});

function showError(message) {
    const errorDiv = document.getElementById('error');
    if (errorDiv) {
        errorDiv.textContent = message;
        errorDiv.style.display = 'block';
    }
    console.error(message);
}