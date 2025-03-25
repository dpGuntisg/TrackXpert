import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

function EventPage() {
    const { t } = useTranslation();
    return (
        <div>
            <h1>{t('event.title')}</h1>
            <Link to="/create-event">{t('event.createEvent')}</Link>
        </div>
    );
}       

export default EventPage
