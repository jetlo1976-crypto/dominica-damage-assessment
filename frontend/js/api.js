// API Configuration
const API_BASE_URL = "https://dominica-damage-assessment-production.up.railway.app";

// API Functions for Python backend communication
async function loadDamageSummary() {
    try {
        const response = await fetch(`${API_BASE_URL}/api/damage-summary`);
        const data = await response.json();
        console.log('Damage summary from Python API:', data);
        createDamageDashboard(data);
    } catch (error) {
        console.error('Failed to load damage summary:', error);
    }
}

async function loadHexagonStats(hexagonId) {
    try {
        const response = await fetch(`${API_BASE_URL}/api/hexagon-stats/${hexagonId}`);
        return await response.json();
    } catch (error) {
        console.error('Failed to fetch hexagon stats:', error);
        return null;
    }
}

function createDamageDashboard(data) {
    const existingDashboard = document.getElementById('damage-dashboard');
    if (existingDashboard) existingDashboard.remove();

    const dashboard = document.createElement('div');
    dashboard.id = 'damage-dashboard';
    dashboard.className = 'dashboard-panel';

    dashboard.innerHTML = `
        <h3>🏠 Dominica Damage Assessment</h3>
        <div class="stats-grid">
            <div class="stat-item total">
                <strong>Total Buildings</strong>
                <div class="stat-value">${data.total_buildings.toLocaleString()}</div>
            </div>
        </div>
        
        <div class="chart-section">
            <h4>Damage Distribution</h4>
            <div id="damage-pie-chart"></div>
        </div>
        
        <div class="damage-categories">
            <h4>Damage Categories:</h4>
            <div class="category-grid">
                ${Object.entries(data.building_count).map(([category, count]) => `
                    <div class="category-item" data-category="${category}">
                        <span class="category-color color-${category}"></span>
                        <strong>Category ${category}:</strong>
                        <span>${count.toLocaleString()} buildings</span>
                    </div>
                `).join('')}
            </div>
        </div>
    `;

    document.getElementById('map').appendChild(dashboard);

    // Create the D3 pie chart
    createDamagePieChart(data);
}