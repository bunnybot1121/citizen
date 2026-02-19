/**
 * Convert GPS coordinates to a precise, human-readable address
 * Uses Nominatim with zoom=18 for street-level detail + POI names
 */
export async function reverseGeocode(latitude, longitude) {
    const fetchWithTimeout = async (url, options, timeoutMs = 8000) => {
        const controller = new AbortController();
        const id = setTimeout(() => controller.abort(), timeoutMs);
        try {
            const res = await fetch(url, { ...options, signal: controller.signal });
            clearTimeout(id);
            return res;
        } catch (e) {
            clearTimeout(id);
            throw e;
        }
    };

    const nominatimUrl =
        `https://nominatim.openstreetmap.org/reverse?` +
        `format=json` +
        `&lat=${latitude}` +
        `&lon=${longitude}` +
        `&zoom=18` +
        `&addressdetails=1` +
        `&namedetails=1` +
        `&extratags=1`;

    const headers = { 'Accept-Language': 'en', 'User-Agent': 'Nagarsevak-CitizenApp/1.0' };

    let data = null;

    // Try up to 2 times
    for (let attempt = 0; attempt < 2; attempt++) {
        try {
            const res = await fetchWithTimeout(nominatimUrl, { headers }, 8000);
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            data = await res.json();
            break; // success
        } catch (err) {
            console.warn(`Geocode attempt ${attempt + 1} failed:`, err.message);
            if (attempt === 1) {
                // Both attempts failed — return coordinates
                console.error('Reverse geocoding failed after retries');
                return `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
            }
            await new Promise(r => setTimeout(r, 1000)); // wait 1s before retry
        }
    }

    try {
        const addr = data.address || {};
        const parts = [];

        // 1. POI / place name
        const poiName = data.namedetails?.name || addr.amenity || addr.shop ||
            addr.tourism || addr.office || addr.building;
        if (poiName) parts.push(poiName);

        // 2. House number + road
        const houseRoad = [
            addr.house_number,
            addr.road || addr.pedestrian || addr.path || addr.footway
        ].filter(Boolean).join(', ');
        if (houseRoad) parts.push(houseRoad);

        // 3. Neighbourhood / suburb / locality
        const locality = addr.neighbourhood || addr.suburb ||
            addr.residential || addr.quarter;
        if (locality) parts.push(locality);

        // 4. City / town / village
        const city = addr.city || addr.town || addr.village || addr.municipality;
        if (city) parts.push(city);

        // 5. District (useful in Indian cities)
        const district = addr.city_district || addr.district;
        if (district && district !== city) parts.push(district);

        // 6. State
        if (addr.state) parts.push(addr.state);

        // 7. Postcode
        if (addr.postcode) parts.push(addr.postcode);

        const full = [...new Set(parts)].join(', ');
        return full || `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;

    } catch (parseErr) {
        console.error('Address parse error:', parseErr);
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
