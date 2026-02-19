/**
 * Convert GPS coordinates to a precise, human-readable address
 * Uses Nominatim with zoom=18 for street-level detail + POI names
 */
export async function reverseGeocode(latitude, longitude) {
    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 8000);

        const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?` +
            `format=json` +
            `&lat=${latitude}` +
            `&lon=${longitude}` +
            `&zoom=18` +          // street/building level detail
            `&addressdetails=1` +
            `&namedetails=1` +    // includes place/POI name
            `&extratags=1`,       // extra tags like shop type, amenity etc.
            {
                headers: { 'User-Agent': 'Nagarsevak-CitizenApp/1.0' },
                signal: controller.signal
            }
        );

        clearTimeout(timeoutId);
        if (!response.ok) throw new Error('Geocoding failed');

        const data = await response.json();
        const addr = data.address;
        const parts = [];

        // 1. POI / place name (shop, restaurant, hospital, etc.)
        if (data.namedetails?.name) parts.push(data.namedetails.name);
        else if (addr.amenity) parts.push(addr.amenity);
        else if (addr.shop) parts.push(addr.shop);
        else if (addr.tourism) parts.push(addr.tourism);
        else if (addr.office) parts.push(addr.office);
        else if (addr.building) parts.push(addr.building);

        // 2. House / plot number + road
        const houseRoad = [addr.house_number, addr.road || addr.pedestrian || addr.path]
            .filter(Boolean).join(', ');
        if (houseRoad) parts.push(houseRoad);

        // 3. Locality / neighbourhood
        if (addr.neighbourhood) parts.push(addr.neighbourhood);
        else if (addr.suburb) parts.push(addr.suburb);
        else if (addr.residential) parts.push(addr.residential);
        else if (addr.quarter) parts.push(addr.quarter);

        // 4. City / town / village
        if (addr.city) parts.push(addr.city);
        else if (addr.town) parts.push(addr.town);
        else if (addr.village) parts.push(addr.village);
        else if (addr.municipality) parts.push(addr.municipality);

        // 5. District (useful in Indian cities)
        if (addr.city_district || addr.district) {
            parts.push(addr.city_district || addr.district);
        }

        // 6. State
        if (addr.state) parts.push(addr.state);

        // 7. Postcode
        if (addr.postcode) parts.push(addr.postcode);

        const fullAddress = [...new Set(parts)].join(', ');
        return fullAddress || `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;

    } catch (error) {
        console.error('Reverse geocoding error:', error);
        return `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
    }
}

/**
 * Get formatted location info
 */
export function formatLocation(latitude, longitude) {
    return {
        latitude: latitude.toFixed(6),
        longitude: longitude.toFixed(6),
        mapsUrl: `https://www.google.com/maps?q=${latitude},${longitude}`,
    };
}
