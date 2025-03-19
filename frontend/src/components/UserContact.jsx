import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEnvelope, faImagePortrait } from '@fortawesome/free-solid-svg-icons';

export default function UserContact({ created_by }) {
    return (
        <div className="gap-4 p-6 rounded-br-lg rounded-bl-lg bg-gray-800 w-full hover:bg-gray-700 transition duration-300 flex items-center relative">
            <div className="absolute top-3 left-10 w-[90%] h-px bg-mainRed"></div>
            {created_by?.profile_image?.data ? (
                <img
                    src={created_by.profile_image.data}
                    alt={`${created_by.username}'s Profile`}
                    className="w-10 h-10 rounded-full object-cover mr-4"
                />
            ) : (
                <FontAwesomeIcon icon={faImagePortrait} size='2xl' className="mr-4" />
            )}
            <div>
                <h3>Created by: {created_by.username}</h3>
                <p> <FontAwesomeIcon icon={faEnvelope}/> {created_by.email}</p>
            </div>
        </div>
    );
}
