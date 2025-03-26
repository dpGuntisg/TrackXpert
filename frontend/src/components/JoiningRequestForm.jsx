import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck, faQuestionCircle } from '@fortawesome/free-solid-svg-icons';
import { useTranslation } from 'react-i18next';

export default function JoiningRequestForm({ values, setValues }) {
    const { t } = useTranslation();
    const [showDescription, setShowDescription] = useState(false);

    const toggleDescription = () => {
        setShowDescription(!showDescription);
    };

    return (
        <div className="space-y-4 p-4 rounded-lg">
            {/* Toggle Section */}
            <div className="flex items-center gap-3">
                <button
                    type="button"
                    onClick={() => setValues(prev => ({ ...prev, joining_enabled: !prev.joining_enabled }))}
                    className={`relative flex h-6 w-6 items-center justify-center rounded border transition-colors ${
                        values.joining_enabled 
                            ? 'bg-mainRed border-mainRed' 
                            : 'border-gray-600 hover:border-gray-500'
                    }`}
                >
                    {values.joining_enabled && (
                        <FontAwesomeIcon 
                            icon={faCheck} 
                            className="h-4 w-4 text-white" 
                        />
                    )}
                </button>
                <h3 className="text-xl font-bold">{t('tracks.form.joiningEnabled')}</h3>
                <button onClick={toggleDescription}>
                    <FontAwesomeIcon 
                        icon={faQuestionCircle} 
                        className="h-4 w-4 text-gray-400 hover:text-gray-300" 
                    />
                </button>
            </div>
            
            {showDescription && (
                <p className="text-lg text-gray-300 ">{t('tracks.form.joiningDescription')}</p>
            )}
            
            {/* Details Section */}
            {values.joining_enabled && (
                <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-300">
                        {t('tracks.form.joiningDetails')}
                    </label>
                    <textarea
                        value={values.joining_details}
                        onChange={(e) => setValues(prev => ({ ...prev, joining_details: e.target.value }))}
                        placeholder={t('tracks.form.joiningDetailsPlaceholder')}
                        className="w-full px-4 py-3 rounded-lg bg-gray-800 border border-gray-700 focus:border-mainRed focus:ring-2 focus:ring-mainRed transition-all duration-200 outline-none"
                        rows="4"
                    />
                    <p className="text-sm text-gray-300">
                        {t('tracks.form.joiningDetailsHelp')}
                    </p>
                </div>
            )}
        </div>
    );
}