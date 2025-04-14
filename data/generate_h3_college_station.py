# generate_h3_college_station.py
# This script generates a hexagonal grid over College Station, TX using Uber's H3 geospatial indexing system.
# The output is a GeoJSON file containing H3 polygons and a mock "morning_score" field for each hexagon.

import h3
import geojson

# 1️⃣ Define the bounding box for College Station, TX
min_lat, max_lat = 30.57, 30.685
min_lng, max_lng = -96.42, -96.285
resolution = 9  # H3 resolution level (higher = smaller hexagons)

# 2️⃣ Generate H3 indices that fall within the bounding box
print("🔄 Generating H3 hexagons...")
hexes = set()
lat = min_lat
while lat < max_lat:
    lng = min_lng
    while lng < max_lng:
        hexes.add(h3.geo_to_h3(lat, lng, resolution))
        lng += 0.002  # Smaller step = denser coverage
    lat += 0.002

print(f"✅ Total H3 cells generated: {len(hexes)}")

# 3️⃣ Convert each H3 index to a polygon and attach mock attribute data
features = []
for i, h in enumerate(hexes):
    boundary = h3.h3_to_geo_boundary(h, geo_json=True)
    if boundary[0] != boundary[-1]:
        boundary.append(boundary[0])  # Close the polygon
    polygon = geojson.Polygon([boundary])
    feature = geojson.Feature(
        geometry=polygon,
        properties={
            "h3_index": h,
            "morning_score": (i * 17) % 100  # Mock attribute for visualization
        }
    )
    features.append(feature)

# 4️⃣ Output the hexagons as a GeoJSON FeatureCollection
feature_collection = geojson.FeatureCollection(features)
output_file = "h3_morning.geojson"

with open(output_file, "w") as f:
    geojson.dump(feature_collection, f)

print(f"🎉 Export complete. File saved as: {output_file}")
