/**
 * Convert GPS coordinates to human-readable address
 */
export async function reverseGeocode(latitude, longitude) {
    try {
        // Using OpenStreetMap Nominatim API (free, no API key needed)
        // IMPORTANT: Respect Usage Policy (User-Agent required, limit requests)
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000); // 5s timeout

        const fetchWithRetry = async (retries = 1) => {
            try {
                const response = await fetch(
                    `https://nominatim.openstreetmap.org/reverse?` +
                    `format=json&lat=${latitude}&lon=${longitude}&addressdetails=1`,
                    {
                        headers: {
                            'User-Agent': 'Nagarsevak-Citizen-App'
                        },
                        signal: controller.signal
                    }
                );
                if (!response.ok) throw new Error('Geocoding failed');
                return response;
            } catch (err) {
                if (retries > 0 && err.name !== 'AbortError') {
                    console.log('Retrying geocode...', err);
                    return fetchWithRetry(retries - 1);
                }
                throw err;
            }
        };

        const response = await fetchWithRetry();
        clearTimeout(timeoutId);

        const data = await response.json();

        // Format address nicely
        const address = data.address;
        const parts = [];

        // 1. Specific Location (Building/Road)
        if (address.building) parts.push(address.building);
        if (address.road) parts.push(address.road);

        // 2. Area/Neighborhood
        if (address.suburb) parts.push(address.suburb);
        else if (address.neighbourhood) parts.push(address.neighbourhood);
        else if (address.residential) parts.push(address.residential);

        // 3. City/Town/Village
        if (address.city) parts.push(address.city);
        else if (address.town) parts.push(address.town);
        else if (address.village) parts.push(address.village);
        else if (address.municipality) parts.push(address.municipality);

        // 4. State/Province
        if (address.state) parts.push(address.state);

        // 5. Postal Code
        if (address.postcode) parts.push(address.postcode);

        // 6. Country
        if (address.country) parts.push(address.country);

        // Filter duplicates and join
        return [...new Set(parts)].join(', ');

    } catch (error) {
        console.error('Reverse geocoding error:', error);
        // Fallback to coordinates
        return `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
    }
}

/**
 * Get formatted location for display
 */
export function formatLocation(latitude, longitude) {
    return {
        latitude: latitude.toFixed(6),
        longitude: longitude.toFixed(6),
        mapsUrl: `https://www.google.com/maps?q=${latitude},${longitude}`,
        embedUrl: `https://www.google.com/maps/embed/v1/place?key=YOUR_KEY&q=${latitude},${longitude}&zoom=16`
    };
}
