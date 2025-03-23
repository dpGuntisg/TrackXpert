import React from "react";
import { Link } from "react-router-dom";
import { useTranslation } from 'react-i18next';

function App() {
  const { t } = useTranslation();

  return (
    <div>
      <div className="flex flex-row sm:h-screen">
        <div className="flex flex-col w-5/6 justify-center">
          <div className="w-5/6 justify-center p-20">
            <h1 className="text-6xl font-extrabold mb-6">{t('home.title')}</h1>
            <h2 className="text-3xl font-semibold">{t('home.subtitle')}</h2>
            <p className="mt-4 text-lg leading-relaxed">
              {t('home.description')}
            </p>
            <div className="flex justify-center mt-20">
              <Link to="/tracks">
                <button className="px-8 py-4 bg-mainRed text-white rounded-md text-lg font-bold transition-transform transform hover:scale-110">
                  {t('home.exploreButton')}
                </button>
              </Link>      
            </div>
          </div>
        </div>

        <div className="flex items-center w-1/2 p-20">
          <div className="bg-mainBlue w-full h-5/6 outline outline-mainRed">
            {t('home.tutorialPlaceholder')}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
