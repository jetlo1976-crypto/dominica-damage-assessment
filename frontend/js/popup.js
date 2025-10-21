// js/popup.js - PopupManager Class (OOP Exercise)
class PopupManager {
    constructor(map) {
        console.log('🔧 PopupManager created with map:', map); // Debug log
        this.map = map;
        this.activePopups = [];
        this.defaultOptions = {
            closeButton: true,
            closeOnClick: true,
            maxWidth: '300px'
        };
    }

    showHexagonPopup(lngLat, hexagonData) {
        console.log('🎯 showHexagonPopup called with:', { lngLat, hexagonData }); // Debug log
        this.closeAllPopups();

        const popupContent = this.createHexagonPopupContent(hexagonData);
        console.log('📝 Popup content created:', popupContent); // Debug log

        const popup = new mapboxgl.Popup(this.defaultOptions)
            .setLngLat(lngLat)
            .setHTML(popupContent)
            .addTo(this.map);

        this.activePopups.push(popup);
        console.log('✅ Popup added to map. Total popups:', this.activePopups.length); // Debug log
        return popup;
    }

    // Method to show building popup
    showBuildingPopup(lngLat, buildingData) {
        this.closeAllPopups(); // Close any existing popups

        const popupContent = this.createBuildingPopupContent(buildingData);
        const popup = new mapboxgl.Popup(this.defaultOptions)
            .setLngLat(lngLat)
            .setHTML(popupContent)
            .addTo(this.map);

        this.activePopups.push(popup);
        return popup;
    }


    // Method to close all popups
    closeAllPopups() {
        this.activePopups.forEach(popup => popup.remove());
        this.activePopups = [];
    }

    // Private method to create building popup content
    createBuildingPopupContent(buildingData) {
        return `
            <div class="popup-content">
                <h4>🏠 Building Details</h4>
                <div class="popup-grid">
                    <div class="popup-item">
                        <strong>Damage Category:</strong>
                        <span class="damage-category-${buildingData.Category_i}">
                            ${buildingData.Category_i}
                        </span>
                    </div>
                    ${buildingData.area ? `
                    <div class="popup-item">
                        <strong>Area:</strong>
                        <span>${buildingData.area} m²</span>
                    </div>
                    ` : ''}
                    ${buildingData.height ? `
                    <div class="popup-item">
                        <strong>Height:</strong>
                        <span>${buildingData.height} m</span>
                    </div>
                    ` : ''}
                </div>
            </div>
        `;
    }

    // Private method to create hexagon popup content
    createHexagonPopupContent(hexagonData) {
        const damageBreakdown = hexagonData.damage_breakdown ?
            Object.entries(hexagonData.damage_breakdown)
                .map(([category, count]) => `
                    <div class="damage-breakdown-item">
                        <span class="category-color color-${category}"></span>
                        <span>Category ${category}: ${count} buildings</span>
                    </div>
                `).join('') : 'No building data';

        return `
            <div class="popup-content">
                <h4>📊 Hexagon Analysis</h4>
                <div class="popup-grid">
                    <div class="popup-item">
                        <strong>Total Buildings:</strong>
                        <span class="stat-value">${hexagonData.total_buildings}</span>
                    </div>
                </div>
                <div class="damage-breakdown">
                    <strong>Damage Breakdown:</strong>
                    ${damageBreakdown}
                </div>
            </div>
        `;
    }

    // Utility method to check if any popups are open
    hasActivePopups() {
        return this.activePopups.length > 0;
    }

    // Method to get popup count (demonstrating encapsulation)
    getPopupCount() {
        return this.activePopups.length;
    }
}


    // ... rest of your class methods
}