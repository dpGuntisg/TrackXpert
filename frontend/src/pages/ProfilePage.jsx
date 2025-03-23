import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faImagePortrait, faPencil, faExclamationCircle, faUpload } from '@fortawesome/free-solid-svg-icons';
import TrackCard from '../components/TrackCard.jsx';

export default function ProfilePage() {
    const [profile, setProfile] = useState({
        name: "",
        surname: "",
        username: "",
        profile_image: null,
        email: "",
    });
    const [tracks, setTracks] = useState();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [serverError, setServerError] = useState(null);
    const [editMode, setEditMode] = useState(false);
    const [newUsername, setNewUsername] = useState('');
    const [newName, setNewName] = useState('');
    const [newSurname, setNewSurname] = useState('');
    const [image, setImage] = useState(null);
    const [previewImage, setPreviewImage] = useState(null);
    const navigate = useNavigate();
    
    useEffect(() => {
        const fetchProfile = async () => {
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
            } catch (error) {
                if (error.response?.status === 401) {
                    localStorage.removeItem('token');
                    setServerError("Session expired.");
                    setTimeout(() => { window.location.href = "/signin"; }, 2000);
                } else {
                    setServerError("Failed to get profile information");
                    setTimeout(() => { window.location.href = "/signin"; }, 2000);
                }
            } finally {
                setLoading(false); 
            }
        };
    
        fetchProfile();
    }, []);

    useEffect(() => {
        const fetchTracks = async () => {
            const token = localStorage.getItem('token');
            if (profile?._id && token) {
                try {
                    const tracksResponse = await axios.get(`http://localhost:5000/api/tracks/profile/${profile._id}/tracks`, {
                        headers: { Authorization: `Bearer ${token}` },
                    });
                    setTracks(tracksResponse.data.tracks || []);
                } catch (tracksError) {
                    console.error("Failed to fetch tracks", tracksError);
                }
            }
        };

        fetchTracks();
    }, [profile?._id]);

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
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error("Unauthorized: No token found.");
            }
    
            await axios.delete("http://localhost:5000/api/users/delete", {
                headers: { Authorization: `Bearer ${token}` }
            });
    
            localStorage.removeItem('token');
            navigate("/signup");
        } catch (error) {
            console.error("Error deleting profile:", error);
            setError(error.response?.data?.message || "Error deleting profile.");
        }
    };
    
    const handleProfileEdit = async () => {
        if (!newUsername.trim()) {
            setError("Username cannot be empty");
            return;
        }

        const token = localStorage.getItem('token');
        if (!token) {
            setError("Not authenticated");
            return;
        }

        try {
            // Create update data object
            const updateData = {
                name: newName,
                surname: newSurname,
                username: newUsername,
            };

            // Add image if it exists
            if (image) {
                updateData.profile_image = image;
            }

            // Send update request
            const response = await axios.patch(
                "http://localhost:5000/api/users/update",
                updateData,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json', 
                    }
                }
            );

            // Update local state with response data
            setProfile(prev => ({
                ...prev,
                username: response.data.updatedUser.username,
                name: response.data.updatedUser.name,
                surname: response.data.updatedUser.surname,
                profile_image: response.data.updatedUser.profile_image
            }));

            // Exit edit mode and clear error
            setEditMode(false);
            setError(null);

        } catch (error) {
            console.error("Failed to update profile", error);
            setError(error.response?.data?.message || "Failed to update profile");
        }
    };
    
    const toggleEditMode = () => {
        setEditMode(!editMode);
        setError(null);
        setNewUsername(profile?.username || '');
        setNewName(profile?.name || '');
        setNewSurname(profile?.surname || '');
        setImage(null);
        setPreviewImage(null);
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
                <div className='bg-gray-800/50 rounded-lg p-6 shadow-lg'>
                    <div className="flex justify-end">
                        <button 
                            className='text-xl font-semibold px-4 py-2 rounded-lg hover:text-mainRed transition-all duration-200'
                            onClick={toggleEditMode}
                        >
                            <FontAwesomeIcon icon={faPencil} className="mr-2"/>
                            {editMode ? "Cancel Editing" : "Edit Profile"}
                        </button>
                    </div>
                    
                    {/* Profile information section */}
                    <div className="flex flex-col md:flex-row gap-8">
                        {/* Left column - Profile picture */}
                        <div className="flex flex-col items-center">
                            {previewImage ? (
                                <img
                                    src={previewImage}
                                    alt="Profile"
                                    className="w-40 h-40 rounded-full object-cover"
                                />
                            ) : profile.profile_image ? (
                                <img
                                    src={profile.profile_image.data}
                                    alt="Profile"
                                    className="w-40 h-40 rounded-full object-cover"
                                />
                            ) : (
                                <FontAwesomeIcon icon={faImagePortrait} size="6x" className="w-40 h-40 p-8 rounded-full" />
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

                        {/* Right column - User info */}
                        <div className="flex-1">
                            {/* Always display the user information */}
                            <div className="mb-6">
                                <div className='flex flex-row space-x-2 mb-2'>
                                    <p className='text-2xl font-semibold'>{profile.name}</p>
                                    <p className='text-2xl font-semibold'>{profile.surname}</p>
                                </div>
                                <p className='text-xl font-semibold text-white mb-2'>@{profile.username}</p>
                                <p className='text-gray-400'>{profile.email}</p>
                            </div>

                            {/* Edit form shown conditionally under the user info */}
                            {editMode && (
                                <div className="border-t border-gray-700 pt-6 mt-4">
                                    <h3 className="text-xl font-semibold mb-4">Edit Profile</h3>
                                    
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
                                                Name
                                            </label>
                                            <input
                                                type="text"
                                                id="name"
                                                className="w-full px-4 py-3 rounded-lg bg-gray-800 border transition-all duration-200 outline-none focus:ring-2 focus:ring-mainRed border-gray-700 focus:border-mainRed"
                                                value={newName}
                                                placeholder='Name'
                                                onChange={(e) => setNewName(e.target.value)}
                                            />
                                        </div>
                                        
                                        <div>
                                            <label htmlFor="surname" className="block text-sm font-medium text-gray-300 mb-1">
                                                Surname
                                            </label>
                                            <input
                                                type="text"
                                                id="surname"
                                                className="w-full px-4 py-3 rounded-lg bg-gray-800 border transition-all duration-200 outline-none focus:ring-2 focus:ring-mainRed border-gray-700 focus:border-mainRed"
                                                value={newSurname}
                                                placeholder='Surname'
                                                onChange={(e) => setNewSurname(e.target.value)}
                                            />
                                        </div>
                                        
                                        <div className="md:col-span-2">
                                            <label htmlFor="username" className="block text-sm font-medium text-gray-300 mb-1">
                                                Username
                                            </label>
                                            <input
                                                type="text"
                                                id="username"
                                                className="w-full px-4 py-3 rounded-lg bg-gray-800 border transition-all duration-200 outline-none focus:ring-2 focus:ring-mainRed border-gray-700 focus:border-mainRed"
                                                value={newUsername}
                                                placeholder='Username'
                                                onChange={(e) => setNewUsername(e.target.value)}
                                            />
                                        </div>
                                    </div>
                                    
                                    <div className="flex space-x-4">
                                        <button 
                                            className="bg-mainYellow text-mainBlue px-6 py-3 rounded-lg font-medium hover:bg-yellow-400 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 focus:ring-offset-gray-800"
                                            onClick={handleProfileEdit}
                                        >
                                            Save Changes
                                        </button>
                                        
                                        <button 
                                            className="bg-red-500/20 text-red-400 border border-red-500/30 px-6 py-3 rounded-lg font-medium hover:bg-red-500/30 transition-colors duration-200"
                                            onClick={handleProfileDelete}
                                        > 
                                            Delete Profile 
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
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
                    {tracks && tracks.length > 0 ? (
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