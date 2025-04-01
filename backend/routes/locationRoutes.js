import express from 'express';
import { Country, State, City } from 'country-state-city';

const router = express.Router();

// Get all countries
router.get('/countries', (req, res) => {
    try {
        const countries = Country.getAllCountries().map(country => ({
            code: country.isoCode,
            name: country.name
        }));
        res.json(countries);
    } catch (error) {
        console.error('Error fetching countries:', error);
        res.status(500).json({ error: 'Failed to fetch countries' });
    }
});

// Get regions/states for a country
router.get('/regions/:countryCode', (req, res) => {
    try {
        const { countryCode } = req.params;
        const states = State.getStatesOfCountry(countryCode).map(state => ({
            code: state.isoCode,
            name: state.name
        }));
        res.json(states);
    } catch (error) {
        console.error('Error fetching regions:', error);
        res.status(500).json({ error: 'Failed to fetch regions' });
    }
});

// Get cities for a country and region
router.get('/cities/:countryCode/:regionCode', (req, res) => {
    try {
        const { countryCode, regionCode } = req.params;
        const cities = City.getCitiesOfState(countryCode, regionCode).map(city => ({
            name: city.name
        }));
        res.json(cities);
    } catch (error) {
        console.error('Error fetching cities:', error);
        res.status(500).json({ error: 'Failed to fetch cities' });
    }
});

// Get cities for a country (when country has no regions)
router.get('/cities/:countryCode', (req, res) => {
    try {
        const { countryCode } = req.params;
        const cities = City.getCitiesOfCountry(countryCode).map(city => ({
            name: city.name
        }));
        res.json(cities);
    } catch (error) {
        console.error('Error fetching cities:', error);
        res.status(500).json({ error: 'Failed to fetch cities' });
    }
});

export default router; 