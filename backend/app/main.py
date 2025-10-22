from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
import geopandas as gpd
import numpy as np
import json
from pathlib import Path
import traceback

# Initialize FastAPI app
app = FastAPI(
    title="Dominica Damage Assessment API",
    description="Backend API for Dominica building damage visualization",
    version="1.0.0"
)

# Configure CORS for frontend communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "https://dominica-damage-assessment.netlify.app",  # Your Netlify domain
        "https://your-app-name.netlify.app"  # Any future domains
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Data file paths
DATA_DIR = Path("data")
BUILDINGS_FILE = DATA_DIR / "buildings.geojson"    # Remove the extra "data/"
HEXAGONS_FILE = DATA_DIR / "hexagons.geojson"      # Remove the extra "data/"

# Load data on startup
@app.on_event("startup")
async def load_data():
    """Load GeoJSON data on application startup"""
    try:
        if not BUILDINGS_FILE.exists():
            raise FileNotFoundError(f"Buildings file not found: {BUILDINGS_FILE}")
        if not HEXAGONS_FILE.exists():
            raise FileNotFoundError(f"Hexagons file not found: {HEXAGONS_FILE}")

        print("✅ Data files found, ready to load on first request...")
    except Exception as e:
        print(f"❌ Error during startup: {e}")


@app.get("/")
async def root():
    """Root endpoint with API information"""
    return {
        "message": "Dominica Damage Assessment API",
        "endpoints": {
            "damage_summary": "/api/damage-summary",
            "hexagon_stats": "/api/hexagon-stats/{hexagon_id}",
            "health": "/health",
            "test": "/api/test"
        }
    }


@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "service": "Dominica API"}


@app.get("/api/test")
async def test_endpoint():
    """Simple test endpoint to verify API is working"""
    return {
        "message": "API is working",
        "status": "success",
        "data": {"test": 123}
    }


@app.get("/api/damage-summary")
async def get_damage_summary():
    """Get summary statistics by damage category"""
    try:
        print("Loading buildings data...")
        buildings_gdf = gpd.read_file(BUILDINGS_FILE)

        # Debug: print columns to see what's available
        print(f"Available columns: {list(buildings_gdf.columns)}")

        # Check if Category_i column exists
        if 'Category_i' not in buildings_gdf.columns:
            return {
                "error": "Category_i column not found in data",
                "available_columns": list(buildings_gdf.columns)
            }

        # Simple manual counting to avoid pandas serialization issues
        damage_counts = {}
        total_buildings = 0

        for index, row in buildings_gdf.iterrows():
            category = row['Category_i']
            # Convert numpy types to native Python types
            if hasattr(category, 'item'):
                category = category.item()
            category = int(category)

            if category in damage_counts:
                damage_counts[category] += 1
            else:
                damage_counts[category] = 1
            total_buildings += 1

        result = {
            "building_count": damage_counts,
            "total_buildings": total_buildings,
            "categories_found": list(damage_counts.keys())
        }

        print(f"Result: {result}")
        return result

    except Exception as e:
        print(f"Error in damage-summary: {str(e)}")
        traceback.print_exc()
        return {"error": f"Error processing data: {str(e)}"}


@app.get("/api/hexagon-stats/{hexagon_id}")
async def get_hexagon_stats(hexagon_id: str):
    """Get detailed stats for a specific hexagon"""
    try:
        print(f"Loading data for hexagon: {hexagon_id}")

        # Load data
        hexagons_gdf = gpd.read_file(HEXAGONS_FILE)
        buildings_gdf = gpd.read_file(BUILDINGS_FILE)

        print(f"Hexagons columns: {list(hexagons_gdf.columns)}")
        print(f"Buildings columns: {list(buildings_gdf.columns)}")

        # Find the specific hexagon
        hexagon = hexagons_gdf[hexagons_gdf['id'] == hexagon_id]
        if len(hexagon) == 0:
            return {"error": f"Hexagon {hexagon_id} not found"}

        # Simple spatial join manually
        damage_breakdown = {}
        buildings_count = 0

        for building_idx, building in buildings_gdf.iterrows():
            # Check if building is within hexagon
            if building.geometry.within(hexagon.iloc[0].geometry):
                buildings_count += 1
                if 'Category_i' in building:
                    category = building['Category_i']
                    if hasattr(category, 'item'):
                        category = category.item()
                    category = int(category)

                    if category in damage_breakdown:
                        damage_breakdown[category] += 1
                    else:
                        damage_breakdown[category] = 1

        stats = {
            'hexagon_id': hexagon_id,
            'total_buildings': buildings_count,
            'damage_breakdown': damage_breakdown,
            'damage_categories_present': list(damage_breakdown.keys())
        }

        print(f"Hexagon stats: {stats}")
        return stats

    except Exception as e:
        print(f"Error in hexagon-stats: {str(e)}")
        traceback.print_exc()
        return {"error": f"Error processing hexagon data: {str(e)}"}


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000)