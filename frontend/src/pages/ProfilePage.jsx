import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../utils/axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faImagePortrait, faPencil, faExclamationCircle, faUpload, faRoute, faHeart } from '@fortawesome/free-solid-svg-icons';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';
import '../styles/PhoneInput.css';
import TrackCard from '../components/TrackCard.jsx';
import DeleteConfirmationModal from '../components/DeleteConfirmationModal';
import { useTranslation } from 'react-i18next';

export default function ProfilePage() {
    const { t } = useTranslation();
    const [profile, setProfile] = useState({
        name: "",
        surname: "",
        username: "",
        profile_image: null,
        email: "",
    });
    const [tracks, setTracks] = useState();
    const [loading, setLoading] = useState(true);
    const [tracksLoading, setTracksLoading] = useState(false);
    const [error, setError] = useState(null);
    const [editMode, setEditMode] = useState(false);
    const [newUsername, setNewUsername] = useState('');
    const [newName, setNewName] = useState('');
    const [newSurname, setNewSurname] = useState('');
    const [newPhonenumber, setNewPhonenumber] = useState('');
    const [image, setImage] = useState(null);
    const [previewImage, setPreviewImage] = useState(null);
    const [deleteConfirmation, setDeleteConfirmation] = useState(false);
    const [activeTab, setActiveTab] = useState('created');
    const navigate = useNavigate();
    
    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const profileResponse = await axiosInstance.get("/users/profile");
                const user = profileResponse.data.user;
                setProfile(user);
            } catch (error) {
                setError(t('profile.fetchError'));
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
                setTracks([]); // Clear tracks when switching tabs
                try {
                    const endpoint = activeTab === 'created'
                        ? `/tracks/profile/${profile._id}/tracks`
                        : `/tracks/profile/${profile._id}/liked`;

                    const tracksResponse = await axiosInstance.get(endpoint);
                    setTracks(tracksResponse.data.tracks || []);
                } catch (tracksError) {
                    console.error(t('profile.tracksError'), tracksError);
                } finally {
                    setTracksLoading(false);
                }
            }
        };

        fetchTracks();
    }, [profile?._id, activeTab, t]);

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
            navigate("/signup");
        } catch (error) {
            console.error(t('profile.deleteError'), error);
            setError(error.response?.data?.message || t('profile.deleteError'));
        }
    };
    
    const handleProfileEdit = async () => {
        if (!newUsername.trim()) {
            setError(t('profile.validation.usernameRequired'));
            return;
        }

        try {
            const updateData = {
                name: newName,
                surname: newSurname,
                username: newUsername,
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
        <div className='sm:p-10'>
            {profile ? (
                <div className='bg-accentBlue rounded-lg p-6 shadow-lg'>
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
                    <div className="flex flex-col md:flex-row gap-8">
                        {/* Left column - Profile picture */}
                        <div className="flex flex-col items-center">
                            {previewImage ? (
                                <img
                                    src={previewImage}
                                    alt={t('profile.profilePicture')}
                                    className="w-40 h-40 rounded-full object-cover"
                                />
                            ) : profile.profile_image ? (
                                <img
                                    src={profile.profile_image.data}
                                    alt={t('profile.profilePicture')}
                                    className="w-40 h-40 rounded-full object-cover"
                                />
                            ) : (
                                <FontAwesomeIcon icon={faImagePortrait} size="6x" className="w-40 h-40 p-8 rounded-full" />
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
                            <div className="mb-6">
                                <div className='flex flex-row space-x-2 mb-2'>
                                    <p className='text-2xl font-semibold'>{profile.name}</p>
                                    <p className='text-2xl font-semibold'>{profile.surname}</p>
                                </div>
                                <p className='text-xl font-semibold text-white mb-2'>{profile.username}</p>
                                <p className='text-gray-400'>{profile.email}</p>
                                {profile.phonenumber && <p className='text-gray-400'>+{profile.phonenumber}</p>}
                            </div>

                            {editMode && (
                                <div className="border-t border-gray-700 pt-6 mt-4">
                                    <h3 className="text-xl font-semibold mb-4">{t('profile.editProfile')}</h3>
                                    
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
                                            <label htmlFor="phonenumber" className="block text-sm font-medium text-gray-300 mb-1">
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
                                    
                                    <div className="flex space-x-4">
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

            <div className='mt-10'>
                <div className="flex border-gray-700">
                    <button 
                        onClick={() => setActiveTab('liked')}
                        className={`px-6 py-3 font-medium flex items-center ${activeTab === 'liked' ? 'border-b-2 border-mainYellow text-mainYellow' : 'text-gray-400 hover:text-white'}`}
                    >
                        <FontAwesomeIcon icon={faHeart} className="mr-2" />
                        {t('profile.likedTracks')}
                    </button>
                    <button 
                        onClick={() => setActiveTab('created')}
                        className={`px-6 py-3 font-medium flex items-center ${activeTab === 'created' ? 'border-b-2 border-mainYellow text-mainYellow' : 'text-gray-400 hover:text-white'}`}
                    >
                        <FontAwesomeIcon icon={faRoute} className="mr-2" />
                        {t('profile.createdTracks')}
                    </button>
                </div>
                <ul className="justify-items-center grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-8 bg-accentBlue rounded-lg p-6 shadow-lg">
                    {tracksLoading ? (
                        <div className="col-span-full flex justify-center items-center">
                            <div className="loader ease-linear rounded-full border-4 border-t-4 border-mainRed h-12 w-12"></div>
                        </div>
                    ) : tracks && tracks.length > 0 ? (
                        tracks.map(track => (
                            <TrackCard
                                key={track._id}
                                track={track}
                                onLikeChange={(trackId, isLiked, updatedLikes) => {
                                    if (activeTab === 'liked' && !isLiked) {
                                        setTracks(prevTracks => 
                                            prevTracks.filter(t => t._id !== trackId)
                                        );
                                    } else {
                                        setTracks(prevTracks => 
                                            prevTracks.map(t => {
                                                if (t._id === trackId) {
                                                    return {
                                                        ...t,
                                                        likes: updatedLikes || t.likes
                                                    };
                                                }
                                                return t;
                                            })
                                        );
                                    }
                                }}
                            />
                        ))
                    ) : (
                        <p>{t('profile.noTracks')}</p>
                    )}
                </ul>
            </div>

            {/* Delete Confirmation Modal */}
            {deleteConfirmation && (
                <DeleteConfirmationModal 
                    onCancel={() => setDeleteConfirmation(false)}
                    onConfirm={handleProfileDelete}
                    title={t('profile.deleteProfile')}
                    message={t('profile.confirmDelete')}
                    confirmText={t('profile.confirmDelete')}
                    cancelText={t('profile.cancel')}
                />
            )}
        </div>
    );
}