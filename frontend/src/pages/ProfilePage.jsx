import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../utils/axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faImagePortrait, faPencil, faExclamationCircle, faUpload, faRoute, faHeart, faCalendarAlt } from '@fortawesome/free-solid-svg-icons';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';
import '../styles/PhoneInput.css';
import TrackCard from '../components/TrackCard.jsx';
import EventCard from '../components/EventCard.jsx';
import DeleteConfirmationModal from '../components/DeleteConfirmationModal';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';

export default function ProfilePage() {
    const { t } = useTranslation();
    const [profile, setProfile] = useState({
        name: "",
        surname: "",
        username: "",
        profile_image: null,
        email: "",
    });
    const [tracks, setTracks] = useState([]);
    const [events, setEvents] = useState([]);
    const [likedTracks, setLikedTracks] = useState([]);
    const [likedEvents, setLikedEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [tracksLoading, setTracksLoading] = useState(false);
    const [eventsLoading, setEventsLoading] = useState(false);
    const [likedLoading, setLikedLoading] = useState(false);
    const [error, setError] = useState(null);
    const [editMode, setEditMode] = useState(false);
    const [newUsername, setNewUsername] = useState('');
    const [newName, setNewName] = useState('');
    const [newSurname, setNewSurname] = useState('');
    const [newPhonenumber, setNewPhonenumber] = useState('');
    const [image, setImage] = useState(null);
    const [previewImage, setPreviewImage] = useState(null);
    const [deleteConfirmation, setDeleteConfirmation] = useState(false);
    const [activeTab, setActiveTab] = useState('tracks'); // 'tracks', 'events', or 'liked'
    const [likedType, setLikedType] = useState('tracks'); // 'tracks' or 'events' for liked content
    const navigate = useNavigate();
    
    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const profileResponse = await axiosInstance.get("/users/profile");
                const user = profileResponse.data.user;
                setProfile(user);
            } catch (error) {
                setError(error.response?.data?.message || t('profile.fetchError'));
            } finally {
                setLoading(false); 
            }
        };
    
        fetchProfile();
    }, [t]);

    useEffect(() => {
        const fetchTracks = async () => {
            if (profile?._id) {
                setTracksLoading(true);
                try {
                    const tracksResponse = await axiosInstance.get(`/tracks/profile/${profile._id}/tracks`);
                    setTracks(tracksResponse.data.tracks || []);
                } catch (tracksError) {
                    setError(tracksError.response?.data?.message || t('profile.tracksError'));
                } finally {
                    setTracksLoading(false);
                }
            }
        };

        const fetchEvents = async () => {
            if (profile?._id) {
                setEventsLoading(true);
                try {
                    const eventsResponse = await axiosInstance.get(`/events/profile/${profile._id}/events`);
                    setEvents(eventsResponse.data.events || []);
                } catch (eventsError) {
                    setError(eventsError.response?.data?.message || t('profile.eventsError'));
                } finally {
                    setEventsLoading(false);
                }
            }
        };

        fetchTracks();
        fetchEvents();
    }, [profile?._id, t]);

    useEffect(() => {
        const fetchLikedContent = async () => {
            if (profile?._id && activeTab === 'liked') {
                setLikedLoading(true);
                try {
                    if (likedType === 'tracks') {
                        const tracksResponse = await axiosInstance.get(`/tracks/profile/${profile._id}/liked`);
                        setLikedTracks(tracksResponse.data.tracks || []);
                    } else {
                        const eventsResponse = await axiosInstance.get(`/events/profile/${profile._id}/liked`);
                        setLikedEvents(eventsResponse.data.events || []);
                    }
                } catch (error) {
                    setError(error.response?.data?.message || t('profile.likedError'));
                } finally {
                    setLikedLoading(false);
                }
            }
        };

        fetchLikedContent();
    }, [profile?._id, activeTab, likedType, t]);

    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setImage({
                    data: reader.result,
                    mimeType: file.type,
                });
                setPreviewImage(reader.result);
            };
            reader.readAsDataURL(file);
        } else {
            setImage(null);
            setPreviewImage(null);
        }
    };

    const handleProfileDelete = async () => {
        try {
            await axiosInstance.delete("/users/delete");
            toast.success(t('profile.deleteSuccess'));
            navigate("/signup");
        } catch (error) {
            console.error(t('profile.deleteError'), error);
            setError(error.response?.data?.message || t('profile.deleteError'));
        }
    };
    
    const handleProfileEdit = async () => {
        const errors = {};
        
        if (!newUsername || !newUsername.trim()) {
            errors.username = t('profile.validation.usernameRequired');
        } else if (newUsername.trim().length < 3) {
            errors.username = t('profile.validation.usernameTooShort');
        }
        
        if (!newName || !newName.trim()) {
            errors.name = t('profile.validation.nameRequired');
        } else if (newName.trim().length < 3) {
            errors.name = t('profile.validation.nameTooShort');
        }
        
        if (!newSurname || !newSurname.trim()) {
            errors.surname = t('profile.validation.surnameRequired');
        } else if (newSurname.trim().length < 3) {
            errors.surname = t('profile.validation.surnameTooShort');
        }

        if (Object.keys(errors).length > 0) {
            setError(Object.values(errors)[0]);
            return;
        }

        try {
            const updateData = {
                name: newName.trim(),
                surname: newSurname.trim(),
                username: newUsername.trim(),
                phonenumber: newPhonenumber || null
            };

            if (image) {
                updateData.profile_image = {
                    data: image.data,
                    mimeType: image.mimeType
                };
            }

            const response = await axiosInstance.patch(
                "/users/update",
                updateData
            );

            const updatedUser = response.data.updatedUser;
            
            setProfile(prev => ({
                ...prev,
                username: updatedUser.username,
                name: updatedUser.name,
                surname: updatedUser.surname,
                profile_image: image ? {
                    data: image.data,
                    mimeType: image.mimeType
                } : prev.profile_image,
                phonenumber: updatedUser.phonenumber
            }));

            toast.success(t('profile.successEdit'));
            setImage(null);
            setPreviewImage(null);
            setEditMode(false);
            setError(null);

        } catch (error) {
            console.error(t('profile.updateError'), error);
            setError(error.response?.data?.message || t('profile.updateError'));
        }
    };
    
    const toggleEditMode = () => {
        setEditMode(!editMode);
        setError(null);
        setNewUsername(profile?.username || '');
        setNewName(profile?.name || '');
        setNewSurname(profile?.surname || '');
        setNewPhonenumber(profile?.phonenumber || '');
        if (!editMode) {
            setImage(null);
            setPreviewImage(null);
        }
    };

    const renderTracks = () => {
        if (tracksLoading) {
            return (
                <div className="flex justify-center items-center py-16">
                    <div className="loader h-10 w-10 sm:h-14 sm:w-14 border-t-mainYellow border-4 border-white/30 rounded-full animate-spin"></div>
                </div>
            );
        }

        if (!tracks || tracks.length === 0) {
            return (
                <div className="flex flex-col items-center justify-center py-10 sm:py-16 text-center">
                    <FontAwesomeIcon icon={faRoute} className="text-3xl sm:text-4xl text-gray-500 mb-4" />
                    <p className="text-lg sm:text-xl text-gray-400">{t('profile.noTracks')}</p>
                </div>
            );
        }

        return (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                {tracks.map(track => (
                    <div key={track._id} className="flex justify-center sm:justify-start">
                        <TrackCard
                            track={track}
                            className="w-full max-w-xs sm:max-w-none"
                            onLikeChange={(trackId, isLiked, updatedLikes) => {
                                setTracks(prevTracks => 
                                    prevTracks.map(t => {
                                        if (t._id === trackId) {
                                            return { ...t, likes: updatedLikes || t.likes };
                                        }
                                        return t;
                                    })
                                );
                            }}
                        />
                    </div>
                ))}
            </div>
        );
    };

    const renderEvents = () => {
        if (eventsLoading) {
            return (
                <div className="flex justify-center items-center py-16">
                    <div className="loader h-10 w-10 sm:h-14 sm:w-14 border-t-mainYellow border-4 border-white/30 rounded-full animate-spin"></div>
                </div>
            );
        }

        if (!events || events.length === 0) {
            return (
                <div className="flex flex-col items-center justify-center py-10 sm:py-16 text-center">
                    <FontAwesomeIcon icon={faCalendarAlt} className="text-3xl sm:text-4xl text-gray-500 mb-4" />
                    <p className="text-lg sm:text-xl text-gray-400">{t('profile.noEvents')}</p>
                </div>
            );
        }

        return (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                {events.map(event => (
                    <div key={event._id} className="flex justify-center sm:justify-start">
                        <EventCard
                            event={event}
                            className="w-full max-w-xs sm:max-w-none"
                            onLikeChange={(eventId, isLiked, updatedLikes) => {
                                setEvents(prevEvents => 
                                    prevEvents.map(e => {
                                        if (e._id === eventId) {
                                            return { ...e, likes: updatedLikes || e.likes };
                                        }
                                        return e;
                                    })
                                );
                            }}
                        />
                    </div>
                ))}
            </div>
        );
    };

    const renderLikedContent = () => {
        if (likedLoading) {
            return (
                <div className="flex justify-center items-center py-16">
                    <div className="loader h-10 w-10 sm:h-14 sm:w-14 border-t-mainYellow border-4 border-white/30 rounded-full animate-spin"></div>
                </div>
            );
        }

        if (likedType === 'tracks') {
            if (!likedTracks || likedTracks.length === 0) {
                return (
                    <div className="flex flex-col items-center justify-center py-10 sm:py-16 text-center">
                        <FontAwesomeIcon icon={faRoute} className="text-3xl sm:text-4xl text-gray-500 mb-4" />
                        <p className="text-lg sm:text-xl text-gray-400">{t('profile.noLikedTracks')}</p>
                    </div>
                );
            }

            return (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                    {likedTracks.map(track => (
                        <div key={track._id} className="flex justify-center sm:justify-start">
                            <TrackCard
                                track={track}
                                className="w-full max-w-xs sm:max-w-none"
                                onLikeChange={(trackId, isLiked, updatedLikes) => {
                                    setLikedTracks(prevTracks => 
                                        prevTracks.filter(t => t._id !== trackId)
                                    );
                                }}
                            />
                        </div>
                    ))}
                </div>
            );
        } else {
            if (!likedEvents || likedEvents.length === 0) {
                return (
                    <div className="flex flex-col items-center justify-center py-10 sm:py-16 text-center">
                        <FontAwesomeIcon icon={faCalendarAlt} className="text-3xl sm:text-4xl text-gray-500 mb-4" />
                        <p className="text-lg sm:text-xl text-gray-400">{t('profile.noLikedEvents')}</p>
                    </div>
                );
            }

            return (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                    {likedEvents.map(event => (
                        <div key={event._id} className="flex justify-center sm:justify-start">
                            <EventCard
                                event={event}
                                className="w-full max-w-xs sm:max-w-none"
                                onLikeChange={(eventId, isLiked, updatedLikes) => {
                                    setLikedEvents(prevEvents => 
                                        prevEvents.filter(e => e._id !== eventId)
                                    );
                                }}
                            />
                        </div>
                    ))}
                </div>
            );
        }
    };

    if (loading) {
        return (
            <div className="flex h-screen w-screen items-center justify-center bg-mainBlue">
                <div className="flex flex-col items-center">
                    <div className="loader ease-linear rounded-full border-4 border-t-4 border-mainRed h-12 w-12 mb-4"></div>
                    <p className="text-lg">{t('common.loading')}</p>
                </div>
            </div>
        );
    }

    return (
        <div className='min-h-screen p-4 max-w-screen-2xl mx-auto'>
            {profile ? (
                <div className='bg-accentBlue rounded-lg p-4 sm:p-6 shadow-lg'>
                    <div className="flex justify-end">
                        <button 
                            className='font-semibold px-4 py-2 rounded-lg hover:text-mainRed transition-all duration-200'
                            onClick={toggleEditMode}
                        >
                            <FontAwesomeIcon icon={faPencil} className="mr-2"/>
                            {editMode ? t('profile.cancelEdit') : t('profile.editProfile')}
                        </button>
                    </div>
                    
                    {/* Profile information section */}
                    <div className="flex flex-col md:flex-row gap-6">
                        {/* Left column - Profile picture */}
                        <div className="flex flex-col items-center mb-6 md:mb-0">
                            {previewImage ? (
                                <img
                                    src={previewImage}
                                    alt={t('profile.profilePicture')}
                                    className="w-32 h-32 sm:w-40 sm:h-40 rounded-full object-cover"
                                />
                            ) : profile.profile_image ? (
                                <img
                                    src={profile.profile_image.data}
                                    alt={t('profile.profilePicture')}
                                    className="w-32 h-32 sm:w-40 sm:h-40 rounded-full object-cover"
                                />
                            ) : (
                                <FontAwesomeIcon icon={faImagePortrait} size="6x" className="w-32 h-32 sm:w-40 sm:h-40 p-6 sm:p-8 rounded-full" />
                            )}

                            {editMode && (
                                <div className="mt-4">
                                    <label htmlFor="profileImage" className="cursor-pointer flex items-center justify-center bg-mainYellow text-mainBlue px-4 py-2 rounded">
                                        <FontAwesomeIcon icon={faUpload} className="mr-2" />
                                        {t('profile.uploadPhoto')}
                                    </label>
                                    <input
                                        id="profileImage"
                                        type="file"
                                        accept="image/*"
                                        onChange={handleImageUpload}
                                        className="hidden"
                                    />
                                </div>
                            )}
                        </div>

                        <div className="flex-1">
                            <div className="mb-6 flex flex-col items-center md:items-start">
                                <div className='flex flex-row flex-wrap space-x-2 mb-2'>
                                    <p className='text-xl sm:text-2xl font-semibold'>{profile.name}</p>
                                    <p className='text-xl sm:text-2xl font-semibold'>{profile.surname}</p>
                                </div>
                                <p className='text-lg sm:text-xl font-semibold text-white mb-2'>{profile.username}</p>
                                <p className='text-sm sm:text-base text-gray-400'>{profile.email}</p>
                                {profile.phonenumber && <p className='text-sm sm:text-base text-gray-400'>+{profile.phonenumber}</p>}
                            </div>

                            {editMode && (
                                <div className="border-t border-gray-700 pt-6 mt-4">
                                    <h3 className="text-lg sm:text-xl font-semibold mb-4">{t('profile.editProfile')}</h3>
                                    
                                    {error && (
                                        <div className="mb-6 p-4 rounded-lg bg-red-500/10 border border-red-500/20">
                                            <div className="flex items-center gap-2 text-red-500">
                                                <FontAwesomeIcon icon={faExclamationCircle} />
                                                <p className="text-sm font-medium">{error}</p>
                                            </div>
                                        </div>
                                    )}
                                    
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                                        <div>
                                            <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-1">
                                                {t('profile.name')}
                                            </label>
                                            <input
                                                type="text"
                                                id="name"
                                                className="w-full px-4 py-3 rounded-lg bg-inputBlue border transition-all duration-200 outline-none focus:ring-2 focus:ring-mainRed border-gray-700 focus:border-mainRed"
                                                value={newName}
                                                placeholder={t('profile.namePlaceholder')}
                                                onChange={(e) => setNewName(e.target.value)}
                                            />
                                        </div>
                                        
                                        <div>
                                            <label htmlFor="surname" className="block text-sm font-medium text-gray-300 mb-1">
                                                {t('profile.surname')}
                                            </label>
                                            <input
                                                type="text"
                                                id="surname"
                                                className="w-full px-4 py-3 rounded-lg bg-inputBlue border transition-all duration-200 outline-none focus:ring-2 focus:ring-mainRed border-gray-700 focus:border-mainRed"
                                                value={newSurname}
                                                placeholder={t('profile.surnamePlaceholder')}
                                                onChange={(e) => setNewSurname(e.target.value)}
                                            />
                                        </div>
                                        
                                        <div className="md:col-span-2">
                                            <label htmlFor="username" className="block text-sm font-medium text-gray-300 mb-1">
                                                {t('profile.username')}
                                            </label>
                                            <input
                                                type="text"
                                                id="username"
                                                className="w-full px-4 py-3 rounded-lg bg-inputBlue border transition-all duration-200 outline-none focus:ring-2 focus:ring-mainRed border-gray-700 focus:border-mainRed"
                                                value={newUsername}
                                                placeholder={t('profile.usernamePlaceholder')}
                                                onChange={(e) => setNewUsername(e.target.value)}
                                            />
                                            <label htmlFor="phonenumber" className="block text-sm font-medium text-gray-300 mb-1 mt-4">
                                                {t('profile.phonenumber')}
                                            </label>
                                            <PhoneInput
                                                country={'lv'}
                                                value={newPhonenumber}
                                                onChange={(value) => setNewPhonenumber(value)}
                                                inputProps={{
                                                    id: 'phonenumber',
                                                    className: 'w-full px-4 py-3 rounded-lg bg-inputBlue border transition-all duration-200 outline-none focus:ring-2 focus:ring-mainRed border-gray-700 focus:border-mainRed'
                                                }}
                                                containerClass="phone-input-container"
                                                buttonClass="phone-input-button"
                                                dropdownClass="phone-input-dropdown"
                                                searchClass="phone-input-search"
                                                searchPlaceholder={t('profile.searchCountry')}
                                                enableSearch={true}
                                                disableSearchIcon={false}
                                                searchNotFound={t('profile.countryNotFound')}
                                                inputStyle={{
                                                    width: '100%',
                                                    paddingLeft: '3.5rem',
                                                    fontSize: '1rem',
                                                    height: '3rem'
                                                }}
                                            />
                                        </div>
                                    </div>
                                    
                                    <div className="flex flex-wrap gap-4">
                                        <button 
                                            className="bg-mainYellow text-mainBlue px-6 py-3 rounded-lg font-medium hover:bg-yellow-400 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 focus:ring-offset-gray-800"
                                            onClick={handleProfileEdit}
                                        >
                                            {t('profile.saveChanges')}
                                        </button>
                                        
                                        <button 
                                            className="bg-red-500/20 text-red-400 border border-red-500/30 px-6 py-3 rounded-lg font-medium hover:bg-red-500/30 transition-colors duration-200"
                                            onClick={() => setDeleteConfirmation(true)}
                                        > 
                                            {t('profile.deleteProfile')} 
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            ) : (
                <p>{t('profile.noData')}</p>
            )}

            <div className='mt-8'>
                {/* Tabs */}
                <div className="flex">
                    <button 
                        onClick={() => setActiveTab('tracks')}
                        className={`flex-1 sm:flex-none px-4 sm:px-8 py-3 sm:py-4 font-medium flex justify-center sm:justify-start items-center transition-all duration-200 text-base sm:text-lg ${
                            activeTab === 'tracks' 
                                ? 'border-b-2 border-mainYellow text-mainYellow' 
                                : 'text-gray-400 hover:text-white'
                        }`}
                    >
                        <FontAwesomeIcon icon={faRoute} className="mr-2 sm:mr-3" />
                        {t('profile.createdTracks')}
                    </button>
                    <button 
                        onClick={() => setActiveTab('events')}
                        className={`flex-1 sm:flex-none px-4 sm:px-8 py-3 sm:py-4 font-medium flex justify-center sm:justify-start items-center transition-all duration-200 text-base sm:text-lg ${
                            activeTab === 'events' 
                                ? 'border-b-2 border-mainYellow text-mainYellow' 
                                : 'text-gray-400 hover:text-white'
                        }`}
                    >
                        <FontAwesomeIcon icon={faCalendarAlt} className="mr-2 sm:mr-3" />
                        {t('profile.createdEvents')}
                    </button>
                    <button 
                        onClick={() => setActiveTab('liked')}
                        className={`flex-1 sm:flex-none px-4 sm:px-8 py-3 sm:py-4 font-medium flex justify-center sm:justify-start items-center transition-all duration-200 text-base sm:text-lg ${
                            activeTab === 'liked' 
                                ? 'border-b-2 border-mainYellow text-mainYellow' 
                                : 'text-gray-400 hover:text-white'
                        }`}
                    >
                        <FontAwesomeIcon icon={faHeart} className="mr-2 sm:mr-3" />
                        {t('profile.liked')}
                    </button>
                </div>
                
                {/* Content Grid */}
                <div className="bg-accentBlue rounded-2xl p-4 sm:p-6 shadow-xl mt-4">
                    {activeTab === 'liked' ? (
                        <div>
                            {/* Liked content type selector */}
                            <div className="flex gap-4 mb-6">
                                <button
                                    onClick={() => setLikedType('tracks')}
                                    className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                                        likedType === 'tracks'
                                            ? 'bg-mainYellow text-mainBlue'
                                            : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                                    }`}
                                >
                                    <FontAwesomeIcon icon={faRoute} className="mr-2" />
                                    {t('profile.likedTracks')}
                                </button>
                                <button
                                    onClick={() => setLikedType('events')}
                                    className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                                        likedType === 'events'
                                            ? 'bg-mainYellow text-mainBlue'
                                            : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                                    }`}
                                >
                                    <FontAwesomeIcon icon={faCalendarAlt} className="mr-2" />
                                    {t('profile.likedEvents')}
                                </button>
                            </div>
                            {renderLikedContent()}
                        </div>
                    ) : activeTab === 'tracks' ? renderTracks() : renderEvents()}
                </div>
            </div>

            {/* Delete Confirmation Modal */}
            <DeleteConfirmationModal 
                isOpen={deleteConfirmation}
                onCancel={() => setDeleteConfirmation(false)}
                onConfirm={handleProfileDelete}
                title={t('profile.deleteProfile')}
                message={t('profile.confirmDelete')}
            />
        </div>
    );
}