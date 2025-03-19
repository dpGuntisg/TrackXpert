// In UserContact component
import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEnvelope, faImagePortrait } from '@fortawesome/free-solid-svg-icons';

export default function UserContact({ created_by }) {
    return (
        <div className="gap-4 p-6 rounded-lg bg-gray-800 w-full hover:bg-gray-700 transition duration-300 flex items-center">
            {created_by?.profile_image?.data ? (
                <img
                    src={created_by.profile_image.data}
                    alt={`${created_by.username}'s Profile`}
                    className="w-10 h-10 rounded-full object-cover mr-4"
                />
            ) : (
                <FontAwesomeIcon icon={faImagePortrait} size="lg" className="mr-4" />
            )}
            <div>
                <h3>Created by: {created_by.username}</h3>
                <p> <FontAwesomeIcon icon={faEnvelope}/> {created_by.email}</p>
            </div>
        </div>
    );
}