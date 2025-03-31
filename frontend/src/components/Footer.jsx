import React from 'react';
import { useTranslation } from 'react-i18next';

const Footer = () => {
    const { t } = useTranslation();
    
    return (
        <footer className="bg-accentBlue text-gray-400 p-6 sm:p-10">
            <div className="container mx-auto px-4 flex flex-col sm:flex-row justify-between items-start sm:items-center">
                <p className="mb-4 sm:mb-0">{t('footer.copyright')}</p>
                
                <div className="flex flex-col sm:flex-row gap-4 sm:space-x-4 whitespace-nowrap">
                    <p className="sm:text-left sm:mb-0">{t('footer.terms')}</p>
                    <p className="sm:text-left sm:mb-0">{t('footer.privacy')}</p>
                </div>
            </div>
        </footer>
    );
}

export default Footer;
