import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faExclamationCircle } from '@fortawesome/free-solid-svg-icons';

export const TrackForm = ({ 
  values, 
  setValues, 
  handleImageChange, 
  errors = {}, 
  touched = {} 
}) => {
  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1">Track Name</label>
        <input
          type="text"
          placeholder="Enter the track name *"
          value={values.name}
          onChange={(e) => setValues({ ...values, name: e.target.value })}
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
        <label className="block text-sm font-medium text-gray-300 mb-1">Description</label>
        <textarea
          value={values.description}
          onChange={(e) => setValues({ ...values, description: e.target.value })}
          placeholder="Enter the track description *"
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
        <label className="block text-sm font-medium text-gray-300 mb-1">Location</label>
        <input
          type="text"
          placeholder="Enter the track location *"
          value={values.location}
          onChange={(e) => setValues({ ...values, location: e.target.value })}
          className={`w-full px-4 py-3 rounded-lg bg-gray-800 border transition-all duration-200 outline-none
            ${errors.location && touched.location ? 'border-red-500 focus:border-red-500' : 'border-gray-700 focus:border-mainRed'}`}
        />
        {errors.location && touched.location && (
          <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
            <FontAwesomeIcon icon={faExclamationCircle} className="text-sm" />
            {errors.location}
          </p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1">Track Image</label>
        <input
          type="file"
          accept="image/*"
          onChange={handleImageChange}
          className={`w-full rounded-lg px-4 py-2 focus:ring-2 focus:ring-mainRed outline-none
            file:bg-mainYellow file:hover:bg-yellow-400 file:text-mainBlue file:border-0 
            file:px-4 file:py-2 file:rounded-lg file:cursor-pointer file:transition-colors
            ${errors.image && touched.image ? 'border-red-500 focus:border-red-500' : 'border-gray-700'}`}
        />
        {errors.image && touched.image && (
          <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
            <FontAwesomeIcon icon={faExclamationCircle} className="text-sm" />
            {errors.image}
          </p>
        )}
      </div>
    </div>
  );
};
