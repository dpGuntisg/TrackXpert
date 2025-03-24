import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';


function EventPage() {
    const { t } = useTranslation();
    return (
        <div>
            <h1>{t('event.title')}</h1>
        </div>
    );
}       

export default EventPage
