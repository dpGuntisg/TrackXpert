import React from "react";
import { Link } from "react-router-dom";
import { useTranslation } from 'react-i18next';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faMapMarkedAlt, 
  faUsers, 
  faCalendarPlus, 
  faFlagCheckered,
  faChartLine,
  faRoute
} from '@fortawesome/free-solid-svg-icons';

function FeatureCard({ icon, title, description }) {
  return (
    <div className="bg-accentBlue p-6 rounded-xl border border-accentGray hover:border-mainYellow transition-all duration-300 hover:scale-105">
      <div className="text-mainYellow text-3xl mb-4">
        <FontAwesomeIcon icon={icon} />
      </div>
      <h3 className="text-xl font-bold mb-2 text-white">{title}</h3>
      <p className="text-gray-400">{description}</p>
    </div>
  );
}

function App() {
  const { t } = useTranslation();

  const features = [
    {
      icon: faRoute,
      title: t('home.features.createTracks.title'),
      description: t('home.features.createTracks.description')
    },
    {
      icon: faUsers,
      title: t('home.features.joinTracks.title'),
      description: t('home.features.joinTracks.description')
    },
    {
      icon: faCalendarPlus,
      title: t('home.features.createEvents.title'),
      description: t('home.features.createEvents.description')
    },
    {
      icon: faFlagCheckered,
      title: t('home.features.joinEvents.title'),
      description: t('home.features.joinEvents.description')
    },
    {
      icon: faMapMarkedAlt,
      title: t('home.features.discover.title'),
      description: t('home.features.discover.description')
    },
    {
      icon: faChartLine,
      title: t('home.features.progress.title'),
      description: t('home.features.progress.description')
    }
  ];

  return (
    <div className="min-h-screen bg-mainBlue p-10">
      {/* Hero Section */}
      <div className="container mx-auto px-4 pt-32 pb-36">
        <div className="text-center max-w-4xl mx-auto">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold mb-6 bg-gradient-to-r from-mainYellow to-mainRed bg-clip-text text-transparent pb-4">
            {t('home.title')}
          </h1>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-8 text-white">
            {t('home.subtitle')}
          </h2>
          <p className="text-lg text-gray-300 mb-12 max-w-2xl mx-auto">
            {t('home.description')}
          </p>
          <Link to="/tracks">
            <button className="px-8 py-4 bg-mainRed text-white rounded-lg text-lg font-bold 
                             transition-all duration-300 hover:scale-105 hover:bg-red-700
                             shadow-lg hover:shadow-red-500/20">
              {t('home.exploreButton')}
            </button>
          </Link>
        </div>
      </div>

      <div className="border-t border-accentGray mb-20 w-8/12 mx-auto"> </div>

      {/* Features Grid */}
      <div className="container mx-auto px-4 pb-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <FeatureCard
              key={index}
              icon={feature.icon}
              title={feature.title}
              description={feature.description}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export default App;
