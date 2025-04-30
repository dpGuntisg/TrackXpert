import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faInfoCircle, faCheckCircle } from '@fortawesome/free-solid-svg-icons';

const RegistrationModal = ({ 
    isOpen, 
    onClose, 
    onRegister, 
    registrationInstructions,
    requireManualApproval,
    eventStatus
}) => {
    const { t } = useTranslation();
    const [registrationInfo, setRegistrationInfo] = useState('');

    if (!isOpen) return null;

    const handleSubmit = () => {
        onRegister(registrationInfo);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-accentBlue rounded-xl shadow-lg max-w-2xl w-full p-6 relative">
                {/* Close button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
                >
                    <FontAwesomeIcon icon={faTimes} size="lg" />
                </button>

                <h2 className="text-2xl font-bold text-mainYellow mb-6">
                    {t('event.registration')}
                </h2>

                {/* Registration instructions if available */}
                {registrationInstructions && (
                    <div className="mb-6 bg-gray-800/50 p-4 rounded-lg">
                        <div className="flex items-start gap-3">
                            <FontAwesomeIcon icon={faInfoCircle} className="text-mainYellow mt-1" />
                            <div>
                                <h3 className="font-semibold text-white mb-2">
                                    {t('event.regInstructions')}
                                </h3>
                                <p className="text-gray-300 text-sm whitespace-pre-line">
                                    {registrationInstructions}
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Manual approval notice if required */}
                {requireManualApproval && (
                    <div className="mb-6 bg-gray-800/50 p-4 rounded-lg">
                        <div className="flex items-start gap-3">
                            <FontAwesomeIcon icon={faInfoCircle} className="text-mainYellow mt-1" />
                            <div>
                                <h3 className="font-semibold text-white mb-2">
                                    {t('event.approvalRequired')}
                                </h3>
                                <p className="text-gray-300 text-sm">
                                    {t('event.approvalExplanation')}
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Registration info input if instructions are provided */}
                {registrationInstructions && (
                    <div className="mb-6">
                        <label className="block text-white font-medium mb-2">
                            {t('event.registrationInfo')}
                        </label>
                        <textarea
                            value={registrationInfo}
                            onChange={(e) => setRegistrationInfo(e.target.value)}
                            placeholder={t('event.registrationInfoPlaceholder')}
                            className="w-full bg-gray-800 text-white rounded-lg p-3 border border-gray-700 focus:border-mainYellow focus:ring-1 focus:ring-mainYellow outline-none min-h-[100px]"
                            required
                        />
                    </div>
                )}

                {/* Registration button */}
                <div className="flex justify-end gap-4">
                    <button
                        onClick={onClose}
                        className="px-6 py-2 rounded-lg bg-gray-700 text-white hover:bg-gray-600 transition-colors"
                    >
                        {t('common.cancel')}
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={registrationInstructions && !registrationInfo.trim()}
                        className={`px-6 py-2 rounded-lg flex items-center gap-2 transition-colors ${
                            registrationInstructions && !registrationInfo.trim()
                                ? 'bg-gray-700 cursor-not-allowed opacity-60'
                                : 'bg-mainRed hover:bg-red-700'
                        } text-white`}
                    >
                        <FontAwesomeIcon icon={faCheckCircle} />
                        {requireManualApproval ? t('event.requestRegistration') : t('event.register')}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default RegistrationModal; 