// In UserContact component
import React from 'react';

export default function UserContact({ created_by }) {
    if (!created_by) {
        return <p>Loading user info...</p>;
    }

    return (
        <div>
            <h3>Created by: {created_by.username}</h3>
            <p>Email: {created_by.email}</p>
        </div>
    );
}
