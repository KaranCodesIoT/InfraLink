// Google Maps / Geocoding integration stub
import logger from '../utils/logger.js';

export const geocodeAddress = async (address) => {
    logger.warn('Maps service is a stub. Configure GOOGLE_MAPS_API_KEY.');
    // Example using @googlemaps/google-maps-services-js:
    // const { Client } = await import('@googlemaps/google-maps-services-js');
    // const client = new Client();
    // const resp = await client.geocode({ params: { address, key: process.env.GOOGLE_MAPS_API_KEY } });
    // const { lat, lng } = resp.data.results[0].geometry.location;
    return { lat: 0, lng: 0 };
};

export const reverseGeocode = async (lat, lng) => {
    logger.warn('Maps service is a stub.');
    return { address: `${lat},${lng}` };
};
