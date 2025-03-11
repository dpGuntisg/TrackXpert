import React from 'react';
import { Link } from "react-router-dom";


export default function TrackCard({ track }) {

    const truncatedDescription = track.description.length > 200 ? track.description.substring(0, 200) + "..." : track.description;
    const FormatedDistance = `${parseFloat(track.distance).toFixed(2).replace('.', ',')} km`;

    return (
        <Link to={`/tracks/${track._id}`} 
            className='flex flex-col bg-mainBlue drop-shadow-lg outline outline-12 outline-mainRed overflow-hidden hover:scale-105 transition-all ease-in-out duration-300 h-[500px]'>
            
            <div className='w-full h-3/5'>
                <img src={track.image} alt={track.name} className="w-full h-full object-cover" loading="lazy"/>
            </div>

            {track.distance > 0 && (
                <div className="absolute bottom-4 right-4 bg-mainYellow text-mainBlue text-xs font-semibold px-3 py-1 opacity-80 rounded">
                    {FormatedDistance}
                </div>
            
            )}

            <div className="p-6 flex flex-col justify-center w-full">
                <h3 className='font-bold text-xl text-white'>{track.name}</h3>
                <p className='text-sm text-gray-300 line-clamp-3'>{truncatedDescription}</p>
                <p className='text-sm text-gray-400'>{track.location}</p>
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
                            <p className="text-xs text-gray-400">+{track.availability.length - 3} more</p>
                        )}
                    </div>
                )}
                </div>
            </div>


            <div className='fixed bottom-2 left-1/2 transform -translate-x-1/2'>
                <span className="mt-2 text-sm font-semibold">View Details</span>
            </div>
        </Link>
    );
}
