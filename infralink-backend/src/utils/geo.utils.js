/**
 * Parse a GeoJSON point from lat/lng inputs.
 */
export const toGeoJSONPoint = (lat, lng) => ({
    type: 'Point',
    coordinates: [parseFloat(lng), parseFloat(lat)],
});

/**
 * Build a MongoDB $near or $geoWithin query for proximity search.
 * @param {number} lat
 * @param {number} lng
 * @param {number} radiusKm
 */
export const buildNearQuery = (lat, lng, radiusKm = 50) => ({
    $near: {
        $geometry: toGeoJSONPoint(lat, lng),
        $maxDistance: radiusKm * 1000, // metres
    },
});
