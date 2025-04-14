import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faTimes, faExclamationCircle } from '@fortawesome/free-solid-svg-icons';
import { useTranslation } from 'react-i18next';
import  LocationSelector  from '../LocationSelector';
import TagManager from '../TagManager';

export const EventDetailsStep = ({
    values, 
    setValues, 
    errors = {}, 
    currentImageIndex,
    setCurrentImageIndex
}) => {
    const {t} = useTranslation();
    const [imagePreviews, setImagePreviews] = useState([]);
    const [showLocationSelector, setShowLocationSelector] = useState(false);

    const handleImageChange = (e) => {
        const files = Array.from(e.target.files);

        if(files.length > 0){  
            if ((values.images?.length || 0) + files.length > 7) {
                alert(t('event.form.validation.tooManyImages'));
                return;
            }
        
            const fileReaders = files.map(file =>{
                return new Promise((resolve)=>{
                    const reader = new FileReader();
                    reader.onloadend = () => {
                        resolve({
                            data: reader.result,
                            mimeType: reader.type,
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
            })
        };
    };

  const removeImage = (indexToRemove) => {
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

  const handleInputChange = (field, value) => {
    setValues(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const toggleLocation = (e) =>{
    setShowLocationSelector(e.target.checked);
  };

  const handleTagChange = (tags) => {
    setValues({
      ...values,
      tags
    });
  };

 return(
    <div className='flex flex-col space-y-4'>
        <div>
          <label className='block text-sm font-medium text-gray-300 mb-1'>{t('event.form.name')}</label>
          <input type="text" 
                placeholder={t('event.form.namePlaceholder')}
                value={values.name|| ''}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className={`w-full px-4 py-3 rounded-lg bg-gray-800 border transition-all duration-200 outline-none
                ${errors.name ? 'border-red-500 focus:border-red-500' : 'border-gray-700 focus:border-mainRed'}`}
          />
          {errors.name && (
            <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
              <FontAwesomeIcon icon={faExclamationCircle} className="text-sm" />
              {errors.name}
            </p>
          )}
        </div>
        <div>
          <label className='block text-sm font-medium text-gray-300 mb-1'>{t('event.form.description')}</label>
          <textarea
              value={values.description || ''}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder={t('tracks.form.enterDescription')}
              className={`w-full px-4 py-3 rounded-lg bg-gray-800 border transition-all duration-200 outline-none
                ${errors.description ? 'border-red-500 focus:border-red-500' : 'border-gray-700 focus:border-mainRed'}`}
              rows="4"
          />
          {errors.description && (
            <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
              <FontAwesomeIcon icon={faExclamationCircle} className="text-sm" />
              {errors.description}
            </p>
          )}
        </div>
        <div>
          <label className='block text-sm font-medium text-gray-300 mb-1'>{t('event.form.location')}</label>
          <div className='flex items-center'>
            <input
              type='checkbox'
              className="h-4 w-4"
              checked={showLocationSelector}
              onChange={toggleLocation}
            />
            <p className='text-sm font-medium text-gray-300 ml-1'>{t('event.form.locationEnable')}</p>
          </div>
        </div>
        {showLocationSelector &&(
          <div>
            <LocationSelector
              value={values.location}
              onChange={(value) => handleInputChange('location', value)}
              error={errors.location}
            />
          </div>
        )}
        <div>
          <TagManager
              value={values.tags || []}
              onChange={handleTagChange}
              type="event"
              error={errors.tags}
              helperText={errors.tags ? errors.tags : t('tracks.form.tagHelper')}
          />
        </div>
        {/*image preview */}
        <div>
          <label className='block text-sm font-medium text-gray-300 mb-2'>{t('event.form.images')}</label>
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
          {/* Image upload button */}
          <div>
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
              {errors.images && (
                <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                  <FontAwesomeIcon icon={faExclamationCircle} className="text-sm" />
                  {errors.images}
                </p>
              )}
            </div>
          </div>
        </div>
    </div>
  );
};

        