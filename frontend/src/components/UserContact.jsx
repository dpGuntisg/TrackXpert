// In UserContact component
import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEnvelope } from '@fortawesome/free-solid-svg-icons';

export default function UserContact({ created_by }) {
    return (
        <div className="gap-4 p-6 rounded-lg bg-gray-800 w-full hover:bg-gray-700 transition duration-300">
            <h3>Created by: {created_by.username}</h3>
            <p> <FontAwesomeIcon icon={faEnvelope}/> {created_by.email}</p>
        </div>
    );
}
