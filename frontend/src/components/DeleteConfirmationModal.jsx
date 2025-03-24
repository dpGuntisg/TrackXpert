import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';
import { useTranslation } from 'react-i18next';

const DeleteConfirmationModal = ({ 
    onCancel, 
    onConfirm, 
    title, 
    message
}) => {
    const { t } = useTranslation();
    
    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center p-4 z-50">
            <div className="bg-mainBlue rounded-xl p-6 max-w-md w-full shadow-2xl border border-gray-700">
                <div className="flex items-center mb-4">
                    <FontAwesomeIcon icon={faExclamationTriangle} className="text-mainRed text-2xl mr-3" />
                    <h3 className="text-xl font-bold">{title}</h3>
                </div>
                <p className="text-gray-300 mb-6">
                    {message}
                </p>
                <div className="flex justify-end space-x-3">
                    <button
                        onClick={onCancel}
                        className="bg-mainYellow hover:bg-yellow-200 text-mainBlue rounded-lg font-medium px-4 py-2 transition-all"
                    >
                        {t('common.cancel')}
                    </button>
                    <button
                        onClick={onConfirm}
                        className="bg-mainRed hover:bg-red-700 px-6 py-2 rounded-lg font-medium transition-all"
                    >
                        {t('common.delete')}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DeleteConfirmationModal; 