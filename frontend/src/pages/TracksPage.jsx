import React, { useState, useEffect } from 'react';
import axios from 'axios';
import TrackCard from '../components/TrackCard.jsx';
import { TrackForm } from '../components/TrackForm.jsx';
import AvailabilityForm from '../components/ AvailabilityForm.jsx';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faArrowLeft, faExclamationCircle, faCheckCircle} from '@fortawesome/free-solid-svg-icons';
import { MapSelector } from '../components/MapSelector';


export default function TracksPage() {
    const [tracks, setTracks] = useState([]);
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [location, setLocation] = useState('');
    const [image, setImage] = useState('');

    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    const [showCreateForm, setShowCreateForm] = useState(false);
    const [step, setStep] = useState(1);
    const [error, setError] = useState('');
    const [serverError, setServerError] = useState('');
    const [loading, setLoading] = useState(true);
    const [success, setSuccess] = useState('');
    const token = localStorage.getItem('token');

    const [coordinates, setCoordinates] = useState(null);
    const [availability, setAvailability] = useState([]);

    const [drawings, setDrawings] = useState({
        point: null,
        polygon: null,
        polyline: null
    });

    


    const getTracks = async (page = 1) => {
        setLoading(true);
        try {
            const response = await axios.get(`http://localhost:5000/api/tracks?page=${page}&limit=6`);
            setTracks(response.data.tracks);
            setTotalPages(response.data.totalPages);
        } catch (error) {
            setServerError(error.response?.data?.message || `Error fetching the tracks: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        getTracks(currentPage);
    }, [currentPage]);

    const handlePageChange = (page) => {
        setCurrentPage(page);
    };

    const toggleCreateForm = () => { 
        setShowCreateForm(!showCreateForm);
        setError(''); 
    };

    const validateStep1 = () => {
        if (!name || name.length < 5) {
            setError("Track name must be at least 5 characters long.");
            return false;
        }
        if(!name || name.length > 100){
            setError("Track name is too long.");
            return false;
        }
        if (!description || description.length < 10) {
            setError("Track description must be at least 10 characters long.");
            return false;
        }
        if(description.length > 15000){
            setError("Track description is too long.");
            return false;
        }
        if (!location || location.length < 5) {
            setError("Track location must be at least 5 characters long.");
            return false;
        }
        if(!location || location.length > 50){
            setError("Track location is too long.");
            return false;
        }
        if(!image){
            setError("Track image is required.");
            return false;
        }
        setError("");
        return true;
    };



    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setImage(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async () => {


        const trackData = {
            name, 
            description, 
            location, 
            image,
            availability: availability.length > 0 ? availability : undefined
        };

        // Add point coordinates if available
        if (coordinates) {
            trackData.latitude = coordinates[0];
            trackData.longitude = coordinates[1];
        }

        // Add polygon if available
        if (drawings.polygon && drawings.polygon.length > 2) {
            trackData.polygon = drawings.polygon;
        }

        // Add polyline if available
        if (drawings.polyline && drawings.polyline.length > 1) {
            trackData.polyline = drawings.polyline;
        }

        if(token){
            try{
                await axios.post(
                    "http://localhost:5000/api/createtrack",
                    trackData,
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                alert("Track created!");
                setSuccess("Track created!");
                setName("");
                setDescription("");
                setLocation("");
                setImage("");
                setCoordinates(null);
                setStep(1);
                setShowCreateForm(false);
                getTracks();              
            } catch(error){
                setServerError(error.response?.data?.message || "Failed to create track");
                setLoading(false);                
            }
        } else {
            setServerError("User is not authenticated");
            setLoading(false);                
        }
    };

    

    if(loading){
        return(
            <div className="flex h-screen w-screen items-center justify-center bg-mainBlue">
                <div className="flex flex-col items-center">
                    <div className="loader ease-linear rounded-full border-4 border-t-4 border-mainRed h-12 w-12 mb-4"></div>
                    <p className="text-lg">Loading...</p>
                </div>
            </div>
        )
    };

    if(serverError){
        return(
            <div className="flex h-screen w-screen items-center justify-center bg-mainBlue">
                <div className="flex flex-col items-center">
                    <p className="text-3xl">{error}</p>
                    <p className="">Please try again later.</p>
                </div>
            </div>
        )
    }

    return (
        <div className='p-10 bg-mainBlue min-h-screen'>
            <div className='flex justify-center mb-5'>
                <h1 className='text-4xl font-bold'>Explore Tracks</h1>
            </div>

            <div className="relative">
                {token && (
                    <button
                        className="sm:bottom-8 sm:right-6 z-50 fixed bottom-0 h-12 w-20 rounded bg-mainRed text-white flex items-center justify-center hover:scale-110 transition-all ease-in-out duration-300 shadow-lg hover:shadow-xl"
                        onClick={toggleCreateForm}
                        aria-label="Add new track"
                    >
                        <span className="text-2xl font-bold flex flex-col items-center">
                            <span className="text-xs">+ Add Track</span>
                        </span>
                    </button>
                )}
            </div>

            {showCreateForm && (
                <div className="fixed z-50 inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
                    <div className="bg-mainBlue rounded-xl p-6 w-full max-w-xl space-y-4">
                        <div className="flex justify-between items-center">
                            <h3 className="text-2xl font-bold">Create Track ({step}/3)</h3>
                            <button
                                onClick={() => {
                                    setShowCreateForm(false);
                                    setStep(1);
                                }}
                                className="text-gray-300 hover:text-white"
                            >
                                <FontAwesomeIcon icon={faTimes} className="text-xl" />
                            </button>
                        </div>

                    {/* Global error message */}
                    {error && (
                        <div className="mb-6 p-4 rounded-lg bg-red-500/10 border border-red-500/20">
                        <div className="flex items-center gap-2 text-red-500">
                            <FontAwesomeIcon icon={faExclamationCircle} />
                            <p className="text-sm font-medium">{error}</p>
                        </div>
                        </div>
                    )}

                    {/* Success message */}
                    {success && (
                        <div className="mb-6 p-4 rounded-lg bg-green-500/10 border border-green-500/20">
                        <div className="flex items-center gap-2 text-green-500">
                            <FontAwesomeIcon icon={faCheckCircle} />
                            <p className="text-sm font-medium">{success}</p>
                        </div>
                        </div>
                    )}

                    <div className="space-y-4">
                        {step === 1 ? (
                            <TrackForm 
                                values={{ name, description, location, image }}
                                setValues={(values) => {
                                    setName(values.name);
                                    setDescription(values.description);
                                    setLocation(values.location);
                                    setImage(values.image);
                                }}
                                handleImageChange={handleImageChange}
                            />
                        ) : step === 2 ? (
                            <AvailabilityForm 
                                availability={availability}
                                setAvailability={setAvailability}
                                error={error}
                                setError={setError}
                            />
                        ) : (                           
                            <>
                                {/* Step 3: Map Selection */}
                                <div className="h-96 w-full rounded-lg overflow-hidden">
                                    <MapSelector 
                                        position={coordinates}
                                        onPositionChange={setCoordinates}
                                        onDrawingsChange={setDrawings}
                                    />
                                </div>
                            </>
                        )}

                        {/* Navigation Buttons */}
                        <div className="flex justify-between space-x-3 pt-4">
                            {step > 1 && (
                                <button
                                    type="button"
                                    onClick={() => setStep(step - 1)}
                                    className="bg-gray-600 hover:bg-gray-700 px-6 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
                                >
                                    <FontAwesomeIcon icon={faArrowLeft} />
                                    Back
                                </button>
                            )}
                            <div className="flex-grow"></div>
                            {step < 3 ? (
                                <button
                                    type="button"
                                    onClick={() => {
                                        if (step === 1 && !validateStep1()) return;
                                        setStep(step + 1);
                                    }}
                                    className="bg-mainYellow hover:bg-yellow-400 text-mainBlue px-6 py-2 rounded-lg font-medium transition-colors"
                                >
                                    Next
                                </button>
                            ) : (
                                <button
                                    type="button"
                                    onClick={handleSubmit}
                                    className="bg-mainYellow hover:bg-yellow-400 text-mainBlue px-6 py-2 rounded-lg font-medium transition-colors"
                                >
                                    Create Track
                                </button>
                            )}
                            <button
                                type="button"
                                onClick={() => {
                                    setShowCreateForm(false);
                                    setStep(1);
                                }}
                                className="bg-mainRed hover:bg-red-700 px-6 py-2 rounded-lg font-medium transition-colors"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            )}

            
            <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-20 justify-center'>
                {tracks.map((track) => (
                    <TrackCard key={track._id} track={track} />
                ))}
            </div>

            <div className="flex justify-center mt-5">
                {currentPage > 1 && (
                    <button
                        className="mr-2"
                        onClick={() => handlePageChange(currentPage - 1)}
                    >
                        Previous
                    </button>
                )}
                <span>{currentPage} of {totalPages}</span>
                {currentPage < totalPages && (
                    <button
                        className="ml-2"
                        onClick={() => handlePageChange(currentPage + 1)}
                    >
                        Next
                    </button>
                )}
            </div>
        </div>
    );
}