import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck } from '@fortawesome/free-solid-svg-icons';

const EventStepper = ({ steps, step, t }) => {
    return (
        <div className="w-full lg:w-1/4 bg-gray-800/30 rounded-xl p-4 mb-6 lg:mb-0 border border-accentGray">
            {/* Horizontal stepper for mobile (no onClick) */}
            <div className="flex lg:hidden overflow-x-auto pb-2">
                {steps.map((item) => (
                    <div
                        key={item.number}
                        className={`flex-1 text-sm whitespace-nowrap py-2 px-3 rounded-md mx-1 text-center min-w-fit ${
                            step === item.number
                                ? 'bg-mainRed text-white font-semibold'
                                : 'bg-gray-800 text-gray-300'
                        }`}
                    >
                        {item.label}
                    </div>
                ))}
            </div>

            {/* Vertical sidebar stepper for desktop (no onClick) */}
            <div className="hidden lg:block">
                {steps.map((item) => (
                    <div
                        key={item.number}
                        className={`flex items-center mb-2 py-3 px-4 rounded-lg transition-all duration-200 min-w-fit ${
                            step === item.number ? 'bg-mainRed/30' : 'hover:bg-gray-700/50'
                        }`}
                    >
                        <div
                            className={`flex items-center justify-center w-8 h-8 rounded-full ${
                                step === item.number
                                    ? 'bg-mainRed text-white border-2 border-mainRed'
                                    : item.number < step
                                    ? 'bg-mainYellow text-mainBlue border-2 border-mainYellow'
                                    : 'bg-mainBlue/20 text-gray-300 border-2 border-accentBlue'
                            }`}
                        >
                            {item.number < step ? (
                                <FontAwesomeIcon icon={faCheck} className="h-4 w-4" />
                            ) : (
                                item.number
                            )}
                        </div>
                        <span
                            className={`ml-3 ${
                                step === item.number
                                    ? 'font-medium text-white'
                                    : item.number < step
                                    ? 'text-mainYellow'
                                    : 'text-gray-400'
                            }`}
                        >
                            {item.label}
                        </span>
                    </div>
                ))}
            </div>

            {/* Progress Bar (only on desktop) */}
            <div className="mt-6 px-2 hidden lg:block">
                <div className="w-full bg-accentGray rounded-full h-2">
                    <div
                        className="bg-mainRed h-2 rounded-full transition-all duration-500"
                        style={{ width: `${((step - 1) / (steps.length - 1)) * 100}%` }}
                    />
                </div>
                <p className="text-sm text-gray-400 mt-2">
                    {t('common.step')} {step} {t('common.of')} {steps.length}
                </p>
            </div>
        </div>
    );
};

export default EventStepper;
