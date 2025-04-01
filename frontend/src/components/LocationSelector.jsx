import React, { useState, useEffect} from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner, faExclamationCircle } from '@fortawesome/free-solid-svg-icons';
import axiosInstance from '../utils/axios';
import { useTranslation } from 'react-i18next';

const LocationSelector = ({ value, onChange, error, touched, required }) => {
  const { t } = useTranslation();
  const [countries, setCountries] = useState([]);
  const [regions, setRegions] = useState([]);
  const [cities, setCities] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [isOutsideCity, setIsOutsideCity] = useState(false);
  const [customLocation, setCustomLocation] = useState('');
  const [address, setAddress] = useState('');
  const [hasRegions, setHasRegions] = useState(false);

  // Fetch countries
  useEffect(() => {
    const fetchCountries = async () => {
      setIsLoading(true);
      try {
        const response = await axiosInstance.get('/locations/countries');
        setCountries(response.data);
      } catch (error) {
        console.error('Error fetching countries:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCountries();
  }, []);

  // Fetch regions when country is selected
  useEffect(() => {
    const fetchRegions = async () => {
      if (!selectedCountry) {
        setRegions([]);
        setHasRegions(false);
        return;
      }

      setIsLoading(true);
      try {
        const response = await axiosInstance.get(`/locations/regions/${selectedCountry}`);
        setRegions(response.data);
        setHasRegions(response.data.length > 0);
        setSelectedRegion('');
        setSelectedCity('');
      } catch (error) {
        console.error('Error fetching regions:', error);
        setHasRegions(false);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRegions();
  }, [selectedCountry]);

  // Fetch cities when region is selected or when country has no regions
  useEffect(() => {
    const fetchCities = async () => {
      if (!selectedCountry || (hasRegions && !selectedRegion) || isOutsideCity) {
        setCities([]);
        return;
      }

      setIsLoading(true);
      try {
        let response;
        if (hasRegions) {
          response = await axiosInstance.get(`/locations/cities/${selectedCountry}/${selectedRegion}`);
        } else {
          response = await axiosInstance.get(`/locations/cities/${selectedCountry}`);
        }
        setCities(response.data);
        setSelectedCity('');
      } catch (error) {
        console.error('Error fetching cities:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCities();
  }, [selectedCountry, selectedRegion, hasRegions, isOutsideCity]);

  // Handle country selection
  const handleCountryChange = (e) => {
    const countryCode = e.target.value;
    const country = countries.find(c => c.code === countryCode);
    setSelectedCountry(countryCode);
    setSelectedRegion('');
    setSelectedCity('');
    setCustomLocation('');
    setAddress('');
    setIsOutsideCity(false);
    onChange(country.name);
  };

  // Handle region selection
  const handleRegionChange = (e) => {
    const regionCode = e.target.value;
    const country = countries.find(c => c.code === selectedCountry);
    const region = regions.find(r => r.code === regionCode);
    setSelectedRegion(regionCode);
    setSelectedCity('');
    setCustomLocation('');
    setAddress('');
    onChange(`${country.name}, ${region.name}`);
  };

  // Handle city selection
  const handleCityChange = (e) => {
    const cityName = e.target.value;
    const country = countries.find(c => c.code === selectedCountry);
    const region = regions.find(r => r.code === selectedRegion);
    setSelectedCity(cityName);
    setCustomLocation('');
    setAddress('');
    const location = hasRegions 
      ? `${country.name}, ${region.name}, ${cityName}`
      : `${country.name}, ${cityName}`;
    onChange(location);
  };

  // Handle custom location input
  const handleCustomLocationChange = (e) => {
    const location = e.target.value;
    const country = countries.find(c => c.code === selectedCountry);
    const region = regions.find(r => r.code === selectedRegion);
    setCustomLocation(location);
    const baseLocation = hasRegions 
      ? `${country.name}, ${region.name}`
      : country.name;
    onChange(`${baseLocation}${location ? `, ${location}` : ''}`);
  };

  // Handle address input
  const handleAddressChange = (e) => {
    const newAddress = e.target.value;
    const country = countries.find(c => c.code === selectedCountry);
    const region = regions.find(r => r.code === selectedRegion);
    setAddress(newAddress);
    const baseLocation = hasRegions 
      ? `${country.name}, ${region.name}${selectedCity ? `, ${selectedCity}` : ''}`
      : `${country.name}${selectedCity ? `, ${selectedCity}` : ''}`;
    onChange(`${baseLocation}${newAddress ? `, ${newAddress}` : ''}`);
  };

  // Handle outside city toggle
  const handleOutsideCityToggle = (e) => {
    setIsOutsideCity(e.target.checked);
    const country = countries.find(c => c.code === selectedCountry);
    const region = regions.find(r => r.code === selectedRegion);
    setSelectedCity('');
    setCustomLocation('');
    setAddress('');
    const baseLocation = hasRegions 
      ? `${country.name}, ${region.name}`
      : country.name;
    onChange(baseLocation);
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            {t('tracks.form.country')} {required && <span className="text-red-500">*</span>}
          </label>
          <select
            value={selectedCountry}
            onChange={handleCountryChange}
            className={`w-full px-4 py-3 rounded-lg bg-gray-800 border transition-all duration-200 outline-none text-gray-300
              ${error && touched ? 'border-red-500 focus:border-red-500' : 'border-gray-700 focus:border-mainRed'}`}
            required={required}
          >
            <option value="" className="text-gray-300">{t('tracks.form.selectCountry')}</option>
            {countries.map((country) => (
              <option key={country.code} value={country.code} className="bg-gray-800 text-gray-300">
                {country.name}
              </option>
            ))}
          </select>
        </div>

        {hasRegions && selectedCountry && (
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              {t('tracks.form.region')} {required && <span className="text-red-500">*</span>}
            </label>
            <select
              value={selectedRegion}
              onChange={handleRegionChange}
              className={`w-full px-4 py-3 rounded-lg bg-gray-800 border transition-all duration-200 outline-none text-gray-300
                ${error && touched ? 'border-red-500 focus:border-red-500' : 'border-gray-700 focus:border-mainRed'}`}
              required={required}
            >
              <option value="" className="text-gray-300">{t('tracks.form.selectRegion')}</option>
              {regions.map((region) => (
                <option key={region.code} value={region.code} className="bg-gray-800 text-gray-300">
                  {region.name}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {selectedCountry && !isOutsideCity && (
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            {t('tracks.form.city')} {required && <span className="text-red-500">*</span>}
          </label>
          <select
            value={selectedCity}
            onChange={handleCityChange}
            className={`w-full px-4 py-3 rounded-lg bg-gray-800 border transition-all duration-200 outline-none text-gray-300
              ${error && touched ? 'border-red-500 focus:border-red-500' : 'border-gray-700 focus:border-mainRed'}`}
            required={required}
          >
            <option value="" className="text-gray-300">{t('tracks.form.selectCity')}</option>
            {cities.map((city) => (
              <option key={city.name} value={city.name} className="bg-gray-800 text-gray-300">
                {city.name}
              </option>
            ))}
          </select>
        </div>
      )}

      <div className="flex items-center">
        <input
          type="checkbox"
          id="outsideCity"
          checked={isOutsideCity}
          onChange={handleOutsideCityToggle}
          className="h-4 w-4 text-mainRed focus:ring-mainRed border-gray-700 rounded bg-inputBlue"
        />
        <label htmlFor="outsideCity" className="ml-2 block text-sm text-gray-300">
          {t('tracks.form.outsideCity')}
        </label>
      </div>

      {isOutsideCity && (
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            {t('tracks.form.customLocation')}
          </label>
          <input
            type="text"
            value={customLocation}
            onChange={handleCustomLocationChange}
            placeholder={t('tracks.form.enterCustomLocation')}
            className={`w-full px-4 py-3 rounded-lg bg-gray-800 border transition-all duration-200 outline-none
              ${error && touched ? 'border-red-500 focus:border-red-500' : 'border-gray-700 focus:border-mainRed'}`}
          />
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1">
          {t('tracks.form.address')}
        </label>
        <input
          type="text"
          value={address}
          onChange={handleAddressChange}
          placeholder={t('tracks.form.enterAddress')}
          className={`w-full px-4 py-3 rounded-lg bg-gray-800 border transition-all duration-200 outline-none
            ${error && touched ? 'border-red-500 focus:border-red-500' : 'border-gray-700 focus:border-mainRed'}`}
        />
      </div>

      {isLoading && (
        <div className="flex items-center text-mainYellow">
          <FontAwesomeIcon icon={faSpinner} className="animate-spin mr-2" />
          <span>{t('tracks.form.loadingLocations')}</span>
        </div>
      )}

      {error && touched && (
        <p className="text-red-500 text-sm flex items-center gap-1">
          <FontAwesomeIcon icon={faExclamationCircle} className="text-sm" />
          {error}
        </p>
      )}
    </div>
  );
};

export default LocationSelector; 