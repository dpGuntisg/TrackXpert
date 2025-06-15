import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';
import { useTranslation } from 'react-i18next';

const DeleteConfirmationModal = ({ isOpen, onClose, onCancel, onConfirm, title, message }) => {
    const { t } = useTranslation();
    
    if (!isOpen) return null;

    const handleClose = () => {
        if (onClose) onClose();
        if (onCancel) onCancel();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-accentBlue rounded-xl shadow-lg max-w-md w-full p-6">
                <div className="flex items-center gap-3 mb-4">
                    <FontAwesomeIcon icon={faExclamationTriangle} className="text-yellow-500 text-xl" />
                    <h2 className="text-xl font-bold text-mainYellow">{title}</h2>
                </div>
                
                <p className="text-gray-300 mb-6">{message}</p>
                
                <div className="flex justify-end gap-3">
                    <button
                        onClick={handleClose}
                        className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                    >
                        {t('common.cancel')}
                    </button>
                    <button
                        onClick={onConfirm}
                        className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                    >
                        {t('common.delete')}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DeleteConfirmationModal; 