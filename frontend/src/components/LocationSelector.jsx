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
  const [locationDetails, setLocationDetails] = useState('');
  const [hasRegions, setHasRegions] = useState(false);
  const [apiError, setApiError] = useState(null);

  // Fetch countries
  useEffect(() => {
    const fetchCountries = async () => {
      setIsLoading(true);
      setApiError(null);
      try {
        const response = await axiosInstance.get('/locations/countries');
        setCountries(response.data);
      } catch (error) {
        console.error('Error fetching countries:', error);
        setApiError(t('tracks.form.errors.fetchCountries'));
      } finally {
        setIsLoading(false);
      }
    };

    fetchCountries();
  }, [t]);

  // Fetch regions when country is selected
  useEffect(() => {
    const fetchRegions = async () => {
      if (!selectedCountry) {
        setRegions([]);
        setHasRegions(false);
        return;
      }

      setIsLoading(true);
      setApiError(null);
      try {
        const response = await axiosInstance.get(`/locations/regions/${selectedCountry}`);
        setRegions(response.data);
        setHasRegions(response.data.length > 0);
        setSelectedRegion('');
        setSelectedCity('');
      } catch (error) {
        console.error('Error fetching regions:', error);
        setHasRegions(false);
        setApiError(t('tracks.form.errors.fetchRegions'));
      } finally {
        setIsLoading(false);
      }
    };

    fetchRegions();
  }, [selectedCountry, t]);

  // Fetch cities when region is selected or when country has no regions
  useEffect(() => {
    const fetchCities = async () => {
      if (!selectedCountry || (hasRegions && !selectedRegion) || isOutsideCity) {
        setCities([]);
        return;
      }

      setIsLoading(true);
      setApiError(null);
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
        setApiError(t('tracks.form.errors.fetchCities'));
      } finally {
        setIsLoading(false);
      }
    };

    fetchCities();
  }, [selectedCountry, selectedRegion, hasRegions, isOutsideCity, t]);

  // Update the location value when form fields change
  const updateLocationValue = () => {
    if (!selectedCountry) return;
    
    const country = countries.find(c => c.code === selectedCountry);
    if (!country) return;
    
    let locationParts = [country.name];
    
    if (hasRegions && selectedRegion) {
      const region = regions.find(r => r.code === selectedRegion);
      if (region) {
        locationParts.push(region.name);
      }
    }
    
    if (selectedCity && !isOutsideCity) {
      locationParts.push(selectedCity);
    }
    
    if (locationDetails) {
      locationParts.push(locationDetails);
    }
    
    onChange(locationParts.join(', '));
  };

  const handleCountryChange = (e) => {
    const countryCode = e.target.value;
    setSelectedCountry(countryCode);
    setSelectedRegion('');
    setSelectedCity('');
    setLocationDetails('');
    setIsOutsideCity(false);
    
    const country = countries.find(c => c.code === countryCode);
    if (country) {
      onChange(country.name);
    }
  };

  const handleRegionChange = (e) => {
    const regionCode = e.target.value;
    setSelectedRegion(regionCode);
    setSelectedCity('');
    setLocationDetails('');
    setTimeout(updateLocationValue, 0);
  };

  const handleCityChange = (e) => {
    const cityName = e.target.value;
    setSelectedCity(cityName);
    setLocationDetails('');
    setTimeout(updateLocationValue, 0);
  };

  const handleLocationDetailsChange = (e) => {
    const details = e.target.value;
    setLocationDetails(details);
    setTimeout(updateLocationValue, 0);
  };

  const handleOutsideCityToggle = (e) => {
    setIsOutsideCity(e.target.checked);
    setSelectedCity('');
    setLocationDetails('');
    setTimeout(updateLocationValue, 0);
  };

  useEffect(() => {
    updateLocationValue();
  }, [selectedCountry, selectedRegion, selectedCity, locationDetails, isOutsideCity]);

  const isCityDisabled = !selectedCountry || (hasRegions && !selectedRegion);

  return (
    <div className="space-y-4">
      {/* Country Selection */}
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

      {/* Region Selection - Only show if country is selected and has regions */}
      {selectedCountry && hasRegions && (
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

      {/* City Selection - Only show if country is selected and not outside city */}
      {selectedCountry && !isOutsideCity && (!hasRegions || selectedRegion) && (
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
            disabled={isCityDisabled}
          >
            <option value="" className="text-gray-300">{t('tracks.form.selectCity')}</option>
            {cities.map((city) => (
              <option key={city.name} value={city.name} className="bg-gray-800 text-gray-300">
                {city.name}
              </option>
            ))}
          </select>
          {isCityDisabled && hasRegions && (
            <p className="text-mainRed text-xs mt-1">
              {t('tracks.form.errors.selectRegionFirst')}
            </p>
          )}
        </div>
      )}

      {/* Outside City Toggle - Only show if country is selected */}
      {selectedCountry && (!hasRegions || selectedRegion) && (
        <div className="flex items-center">
          <input
            type="checkbox"
            id="outsideCity"
            checked={isOutsideCity}
            onChange={handleOutsideCityToggle}
            className="h-4 w-4 text-mainRed focus:ring-mainRed border-gray-700 rounded bg-inputBlue"
            disabled={!selectedCountry || (hasRegions && !selectedRegion)}
          />
          <label htmlFor="outsideCity" className="ml-2 block text-sm text-gray-300">
            {t('tracks.form.outsideCity')}
          </label>
        </div>
      )}

      {/* Location Details - Show in both cases (city selected or outside city) */}
      {selectedCountry && (!hasRegions || selectedRegion) && (
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            {t('tracks.form.locationDetails')}
          </label>
          <input
            type="text"
            value={locationDetails}
            onChange={handleLocationDetailsChange}
            placeholder={t('tracks.form.enterLocationDetails')}
            className={`w-full px-4 py-3 rounded-lg bg-gray-800 border transition-all duration-200 outline-none
              ${error && touched ? 'border-red-500 focus:border-red-500' : 'border-gray-700 focus:border-mainRed'}`}
          />
        </div>
      )}

      {isLoading && (
        <div className="flex items-center text-mainYellow">
          <FontAwesomeIcon icon={faSpinner} className="animate-spin mr-2" />
          <span>{t('tracks.form.loadingLocations')}</span>
        </div>
      )}

      {apiError && (
        <p className="text-red-500 text-sm flex items-center gap-1">
          <FontAwesomeIcon icon={faExclamationCircle} className="text-sm" />
          {apiError}
        </p>
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