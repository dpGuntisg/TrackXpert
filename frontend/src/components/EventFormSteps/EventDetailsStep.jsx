import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleInfo } from '@fortawesome/free-solid-svg-icons';
import { useTranslation } from 'react-i18next';

export const EventDetailsStep = ({
    values, 
    setValues, 
    errors = {}, 
    touched = {},
    currentImageIndex,
    setCurrentImageIndex
}) => {
    const {t} = useTranslation();
    const [imagePreviews, setImagePreviews] = useState([]);

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

 return(
    <div>

    </div>
);
};

        