import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faImagePortrait, faPencil, faExclamationCircle, faUpload } from '@fortawesome/free-solid-svg-icons';
import TrackCard from '../components/TrackCard.jsx';

export default function ProfilePage() {
    const [profile, setProfile] = useState(null);
    const [tracks, setTracks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [serverError, setServerError] = useState(null);

    const [editMode, setEditMode] = useState(false);
    const [newUsername, setNewUsername] = useState('');
    const [image, setImage] = useState(null);
    const [previewImage, setPreviewImage] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            const token = localStorage.getItem('token');
            if (!token) {
                setServerError("User is not authenticated");
                setLoading(false);
                setTimeout(() => {
                    window.location.href = "/signin";
                }, 2000);
                return;
            }

            try {
                const profileResponse = await axios.get("http://localhost:5000/api/users/profile", {
                    headers: { Authorization: `Bearer ${token}` },
                });
                const user = profileResponse.data.user;
                setProfile(user);
                setNewUsername(user.username || '');

                // If user has a profile image, fetch it
                if (user?.profile_image) {
                    try {
                        const imageResponse = await axios.get(`http://localhost:5000/api/images/${user.profile_image}`, {
                            headers: { Authorization: `Bearer ${token}` },
                            responseType: 'blob'
                        });
                        const imageUrl = URL.createObjectURL(imageResponse.data);
                        setPreviewImage(imageUrl);
                    } catch (imageError) {
                        console.error('Failed to fetch profile image', imageError);
                    }
                }

                if (user?._id) {
                    try {
                        const tracksResponse = await axios.get(`http://localhost:5000/api/tracks/profile/${user._id}/tracks`, {
                            headers: { Authorization: `Bearer ${token}` },
                        });
                        setTracks(tracksResponse.data.tracks || []); 
                    } catch (trackError) {
                        console.error('Failed to fetch tracks', trackError);
                    }
                }

                setLoading(false);
            } catch (error) {
                if (error.response?.status === 401) {
                    localStorage.removeItem('token');
                    setServerError("Session expired.");
                    setTimeout(() => { window.location.href = "/signin"; }, 2000);
                } else {
                    setServerError("Failed to get profile information");
                    setTimeout(() => { window.location.href = "/signin"; }, 2000);
                }
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const handleProfileEdit = async () => {
        if (!newUsername || !newUsername.trim()) {
            setError("Username cannot be empty");
            return;
        }
    
        const token = localStorage.getItem('token');
        try {
            // Prepare form data for multipart/form-data request
            const formData = new FormData();
            formData.append('username', newUsername);
            
            // Only append image if there's a new one
            if (image) {
                formData.append('profileImage', image);
            }
            
            const response = await axios.patch(
                "http://localhost:5000/api/users/update", 
                formData,
                { 
                    headers: { 
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'multipart/form-data'
                    } 
                }
            );
     
            // Update local state with the response
            setProfile(prev => ({
                ...prev,
                username: response.data.username,
                profile_image: response.data.profile_image
            }));
            
            setEditMode(false);
            setError(null);
            
            // If we got a new image in the update, refresh the page to show it
            if (image) {
                window.location.reload();
            }
        } catch (error) {
            console.error("Failed to update profile", error);
            setError(error.response?.data?.message || "Failed to update profile");
        }
    };

    const toggleEditMode = () => {
        setEditMode(!editMode);
        setError(null);
        setNewUsername(profile?.username || '');
        setImage(null); // Reset image when toggling edit mode
    }

    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            // Check file type
            if (!file.type.match('image.*')) {
                setError('Please select an image file');
                return;
            }
            
            // Check file size (limit to 5MB)
            if (file.size > 5 * 1024 * 1024) {
                setError('Image size should be less than 5MB');
                return;
            }
            
            // Store the file for upload
            setImage(file);
            
            // Create preview
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreviewImage(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    if (loading) {
        return (
            <div className="flex h-screen w-screen items-center justify-center bg-mainBlue">
                <div className="flex flex-col items-center">
                    <div className="loader ease-linear rounded-full border-4 border-t-4 border-mainRed h-12 w-12 mb-4"></div>
                    <p className="text-lg">Loading...</p>
                </div>
            </div>
        );
    }

    if (serverError) {
        return (
            <div className="flex h-screen w-screen items-center justify-center bg-mainBlue">
                <div className="flex flex-col items-center">
                    <p className="text-3xl">{serverError}</p>
                    <p className="">Please log in or try again later.</p>
                </div>
            </div>
        );
    }

    return (
        <div className='p-10'>
            {profile ? (
                <div className='flex'>
                    <div className="flex flex-col items-center relative">
                        {previewImage ? (
                            <img 
                                src={previewImage} 
                                alt="Profile" 
                                className="w-40 h-40 rounded-full object-cover" 
                            />
                        ) : (
                            <FontAwesomeIcon icon={faImagePortrait} size="10x" className="mr-4" />
                        )}
                        
                        {editMode && (
                            <div className="mt-4">
                                <label htmlFor="profileImage" className="cursor-pointer flex items-center justify-center bg-mainYellow text-mainBlue px-4 py-2 rounded">
                                    <FontAwesomeIcon icon={faUpload} className="mr-2" />
                                    Upload Photo
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
                    <div className="ml-8">
                        <button className='text-xl font-semibold px-2 py-1 hover:text-mainRed transition-all duration-200'
                                onClick={toggleEditMode}>
                            <FontAwesomeIcon icon={faPencil} className="mr-2"/>
                            {editMode ? "Cancel" : "Edit"}
                        </button>

                        {editMode ? (
                            <div className="flex flex-col">
                                {error && (
                                    <div className="mb-6 p-4 rounded-lg bg-red-500/10 border border-red-500/20">
                                        <div className="flex items-center gap-2 text-red-500">
                                            <FontAwesomeIcon icon={faExclamationCircle} />
                                            <p className="text-sm font-medium">{error}</p>
                                        </div>
                                    </div>
                                )}
                                <div className="flex items-center">
                                    <input 
                                        type="text"
                                        className="border-b border-mainRed bg-transparent p-1 text-2xl font-semibold focus:outline-none"
                                        value={newUsername}
                                        placeholder='Username'
                                        onChange={(e) => setNewUsername(e.target.value)}
                                    />
                                    <button className="ml-2 bg-mainYellow text-mainBlue px-2 py-2 rounded" 
                                            onClick={handleProfileEdit}>
                                        Save
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <p className='text-2xl font-semibold'>{profile.username}</p>
                        )}

                        <p>{profile.email}</p>
                    </div>
                </div>
            ) : (
                <p>No profile data found.</p>
            )}

            <div className='mt-10'>
                <div className='flex flex-row'>
                    <h2 className='text-2xl font-semibold '>Created Tracks</h2>
                    <h2 className='ml-2 text-2xl font-semibold '>Liked</h2>
                </div>
                <div className='border-b-4 border-mainRed mb-4'></div>
                <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-20">
                    {tracks.length > 0 ? (
                        tracks.map(track => (
                            <TrackCard 
                                key={track._id} 
                                track={track} 
                            />
                        ))
                    ) : (
                        <p>No tracks created yet.</p>
                    )}
                </ul>
            </div>
        </div>
    );
}