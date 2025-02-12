import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faImagePortrait, faPencil } from '@fortawesome/free-solid-svg-icons';
import TrackCard from '../components/TrackCard.jsx';

export default function ProfilePage() {
    const [profile, setProfile] = useState(null);
    const [tracks, setTracks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [editMode, setEditMode] = useState(false);
    const [newUsername, setNewUsername] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            const token = localStorage.getItem('token');
            if (!token) {
                setError("User is not authenticated");
                setLoading(false);
                setTimeout(() => {
                    window.location.href = "/signin";
                }, 2000);
                return;
            }

            try {
                const profileResponse = await axios.get("http://localhost:5000/api/profile", {
                    headers: { Authorization: `Bearer ${token}` },
                });
                const user = profileResponse.data.user;
                setProfile(user);
                setNewUsername(user.username || '');

                if (user?._id) {
                    try {
                        const tracksResponse = await axios.get(`http://localhost:5000/api/profile/${user._id}/tracks`, {
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
                    setError("Session expired.");
                    setTimeout(() => { window.location.href = "/signin"; }, 2000);
                } else {
                    setError("Failed to get profile information");
                    setTimeout(() => { window.location.href = "/signin"; }, 2000);
                }
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const handleProfileEdit = async () => {
        if (!newUsername || !newUsername.trim()) {
            alert("Username cannot be empty");
            return;
        }
    
        const token = localStorage.getItem('token');
        try {
            const response = await axios.patch("http://localhost:5000/api/profile/update", 
                { username: newUsername }, 
                { headers: { Authorization: `Bearer ${token}` } }
            );
     
            setProfile(prev => ({
                ...prev,
                username: newUsername 
            }));
            setEditMode(false);
            setNewUsername(response.data.username);
            setEditMode(false);
        } catch (error) {
            console.error("Failed to update username", error);
        }
    };

    const toggleEditMode = () => {
        setEditMode(!editMode);
    }

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

    if (error) {
        return (
            <div className="flex h-screen w-screen items-center justify-center bg-mainBlue">
                <div className="flex flex-col items-center">
                    <p className="text-3xl">{error}</p>
                    <p className="">Please log in or try again later.</p>
                </div>
            </div>
        );
    }

    return (
        <div className='p-10'>
            {profile ? (
                <div className='flex'>
                    <div className="flex flex-col items-center">
                        <FontAwesomeIcon icon={faImagePortrait} size="10x" className="mr-4" />
                    </div>
                    <div>
                        <button className='text-xl font-semibold px-2 py-1 hover:text-mainRed transition-all duration-200'
                                onClick={toggleEditMode}>
                            <FontAwesomeIcon icon={faPencil} className="mr-2"/>
                            {editMode ? "Cancel" : "Edit"}
                        </button>

                        {editMode ? (
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
                <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
