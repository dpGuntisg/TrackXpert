import React from 'react';
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLocationDot} from '@fortawesome/free-solid-svg-icons';
import { useTranslation } from 'react-i18next';

export default function TrackCard({ track }) {
    const { t } = useTranslation();
    const truncatedDescription = track.description.length > 200 ? track.description.substring(0, 200) + "..." : track.description;
    const FormatedDistance = `${parseFloat(track.distance).toFixed(2).replace('.', ',')} km`;
    const firstImage = track.images?.[0]?.data;

    return (
        <Link to={`/tracks/${track._id}`} 
        className='flex flex-col bg-accentBlue drop-shadow-lg outline outline-12 outline-mainRed overflow-hidden hover:scale-105 transition-all ease-in-out duration-300
            h-[500px] w-full sm:w-auto sm:min-w-[340px] max-w-sm md:max-w-md lg:max-w-lg rounded'>
          
            <div className='relative w-full h-3/5'>
                <img src={firstImage} alt={track.name} className="w-full h-full object-cover" loading="lazy"/>
                <div className="absolute bottom-4 left-4 space-y-2 bg-gray-800 bg-opacity-50 p-2">
                    <div className='flex items-center space-x-2'>
                        <FontAwesomeIcon icon={faLocationDot} color='white' />
                        <p className='font-bold text-sm text-gray-300'>{track.location}</p>
                    </div>
                </div>
            </div>

            {track.distance > 0 && (
                <div className="absolute bottom-4 right-4 bg-mainYellow text-mainBlue text-xs font-semibold px-3 py-1 opacity-80 rounded">
                    {FormatedDistance}
                </div>
            )}

            <div className="p-6 flex flex-col justify-center w-full">
                <h3 className='font-bold text-xl text-white'>{track.name}</h3>
                <p className='text-sm text-gray-300 line-clamp-3'>{truncatedDescription}</p>
                <div className="mt-2 text-sm">
                {track.availability && track.availability.length > 0 && (
                    <div className="mt-2 text-sm text-gray-400">
                        {track.availability.slice(0, 3).map((slot, index) => (
                            <div key={index}>
                                <span className="mr-2">
                                    {slot.startDay === slot.endDay 
                                        ? slot.startDay 
                                        : `${slot.startDay} - ${slot.endDay}`}
                                </span>
                                <span>
                                    {slot.open_time} - {slot.close_time}
                                </span>
                            </div>
                        ))}
                        {track.availability.length > 3 && (
                            <p className="text-xs text-gray-400">+{track.availability.length - 3} {t('tracks.more')}</p>
                        )}
                    </div>
                )}
                </div>
            </div>

            <div className='fixed bottom-2 left-1/2 transform -translate-x-1/2'>
                <span className="mt-2 text-sm font-semibold">{t('tracks.viewDetails')}</span>
            </div>
        </Link>
    );
}
