import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export default function NotFoundPage() {
    const { t } = useTranslation();

    return (
        <div className="min-h-screen flex items-center justify-center bg-mainBlue">
            <div className="text-center">
                <h1 className="text-9xl font-bold text-mainRed">404</h1>
                <h2 className="text-4xl font-bold mt-4">{t('notFound.title')}</h2>
                <p className="text-gray-400 mt-4">{t('notFound.description')}</p>
                <Link
                    to="/"
                    className="inline-block mt-8 px-6 py-3 bg-mainRed  rounded-lg font-medium hover:bg-red-700 transition-colors duration-200"
                >
                    {t('notFound.backHome')}
                </Link>
            </div>
        </div>
    );
}
