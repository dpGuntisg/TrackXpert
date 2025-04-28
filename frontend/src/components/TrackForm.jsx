import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faExclamationCircle, faTimes, faPlus } from '@fortawesome/free-solid-svg-icons';
import { useTranslation } from 'react-i18next';
import TagManager from './TagManager';
import LocationSelector from './LocationSelector';

export const TrackForm = ({ 
  values, 
  setValues, 
  errors = {}, 
  touched = {},
  currentImageIndex,
  setCurrentImageIndex
}) => {
  const { t } = useTranslation();
  const [imagePreviews, setImagePreviews] = useState([]);

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    
    if (files.length > 0) {

      if ((values.images?.length || 0) + files.length > 7) {
        alert(t('tracks.form.validation.tooManyImages'));
        return;
      }

      const fileReaders = files.map(file => {
        return new Promise((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => {
            resolve({
              data: reader.result,
              mimeType: file.type,
              file: file,
              name: file.name
            });
          };
          reader.readAsDataURL(file);
        });
      });

      Promise.all(fileReaders).then(newFileData => {
        setValues(prev => ({
          ...prev,
          images: [
            ...(prev.images || []),
            ...newFileData
          ]
        }));
        
        setImagePreviews(prev => [...prev, ...newFileData]);
      });
    }
  };

  // Remove an image
  const removeImage = (indexToRemove) => {
    // Update the form values by removing the image at the specified index
    setValues(prev => {
      const updatedImages = prev.images.filter((_, index) => index !== indexToRemove);
  
      // If all images are removed, reset currentImageIndex to 0
      if (updatedImages.length === 0) {
        if (setCurrentImageIndex) {
          setCurrentImageIndex(0);
        }
      } else if (indexToRemove === prev.images.length - 1 && indexToRemove > 0) {
        // Update the currentImageIndex if it's passed as a prop
        if (currentImageIndex !== undefined && setCurrentImageIndex) {
          setCurrentImageIndex(Math.max(0, indexToRemove - 1));
        }
      }
  
      return {
        ...prev,
        images: updatedImages
      };
    });
  
    //update the previews
    setImagePreviews(prev => prev.filter((_, index) => index !== indexToRemove));
  };

  //handle input changes
  const handleInputChange = (field, value) => {
    setValues({
      ...values,
      [field]: value
    });
  };

  // Handle tag changes
  const handleTagChange = (tags) => {
    setValues({
      ...values,
      tags
    });
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1">{t('tracks.form.trackName')}</label>
        <input
          type="text"
          placeholder={t('tracks.form.enterTrackName')}
          value={values.name || ''}
          onChange={(e) => handleInputChange('name', e.target.value)}
          className={`w-full px-4 py-3 rounded-lg bg-gray-800 border transition-all duration-200 outline-none
            ${errors.name && touched.name ? 'border-red-500 focus:border-red-500' : 'border-gray-700 focus:border-mainRed'}`}
        />
        {errors.name && touched.name && (
          <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
            <FontAwesomeIcon icon={faExclamationCircle} className="text-sm" />
            {errors.name}
          </p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1">{t('tracks.form.description')}</label>
        <textarea
          value={values.description || ''}
          onChange={(e) => handleInputChange('description', e.target.value)}
          placeholder={t('tracks.form.enterDescription')}
          className={`w-full px-4 py-3 rounded-lg bg-gray-800 border transition-all duration-200 outline-none
            ${errors.description && touched.description ? 'border-red-500 focus:border-red-500' : 'border-gray-700 focus:border-mainRed'}`}
          rows="4"
        />
        {errors.description && touched.description && (
          <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
            <FontAwesomeIcon icon={faExclamationCircle} className="text-sm" />
            {errors.description}
          </p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1">{t('tracks.form.location')}</label>
        <LocationSelector
          value={values.location}
          onChange={(value) => handleInputChange('location', value)}
          error={errors.location}
          touched={touched.location}
        />
      </div>

      <div>
        <TagManager
          value={values.tags || []}
          onChange={handleTagChange}
          type="track"
          error={errors.tags && touched.tags}
          helperText={errors.tags && touched.tags ? errors.tags : t('tracks.form.tagHelper')}
          touched={touched.tags}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">{t('tracks.form.trackImages')}</label>
        
        {/* Images Display */}
        {values.images && values.images.length > 0 && (
          <div className="mb-4 max-h-48 overflow-y-auto">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {values.images.map((image, index) => (
                <div 
                  key={`image-${index}`} 
                  className="relative group rounded-lg overflow-hidden h-32 bg-gray-800 hover:border-mainRed border-2 border-gray-700 transition-colors"
                >
                  <img 
                    src={image.data} 
                    alt={image.name || `Image ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute top-1 right-2 text-white hover:text-mainRed opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <FontAwesomeIcon icon={faTimes} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Image Upload Button */}
        <div className="relative">
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={handleImageChange}
            className="hidden"
            id="image-upload"
          />
          <label 
            htmlFor="image-upload" 
            className="flex items-center justify-center w-full py-3 px-4 bg-gray-800 border border-gray-700 hover:border-mainRed rounded-lg cursor-pointer transition-colors"
          >
            <FontAwesomeIcon icon={faPlus} className="mr-2" />
            <span>{t('tracks.form.addImages')}</span>
          </label>
          {errors.images && touched.images && (
            <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
              <FontAwesomeIcon icon={faExclamationCircle} className="text-sm" />
              {errors.images}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};