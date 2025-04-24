import React from "react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';   
import { faCheck } from '@fortawesome/free-solid-svg-icons';

const CustomCheckbox = ({ label, checked, onChange, className = "" }) => {
    return (
        <label className={`flex items-center space-x-2 text-sm font-medium text-gray-300 cursor-pointer ${className}`}>
            <div className="relative flex items-center justify-center">
                <input
                    type="checkbox"
                    checked={checked}
                    onChange={onChange}
                    className="sr-only"
                />
                <div className={`w-5 h-5 rounded border transition-colors duration-200 flex items-center justify-center
                    ${checked ? 'bg-mainRed border-mainRed' : 'border-gray-500 bg-gray-700'}`}>
                    {checked && <FontAwesomeIcon icon={faCheck} className="text-white text-xs" />}                
                </div>
            </div>
            <span>{label}</span>
        </label>
    );  
}

export default CustomCheckbox;