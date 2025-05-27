import React, { useState, useEffect, useRef } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import axiosInstance from "../utils/axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBars, faTimes, faBell, faExclamation, faUser, faSignOutAlt, faHome, faRoute, faCalendarAlt } from "@fortawesome/free-solid-svg-icons";
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from "./LanguageSwitcher";
import { useAuth } from '../context/AuthContext';
import TrackRequest from './TrackRequest';
import EventRequest from './EventRequest';
import logo from '../assets/logo.png';

const Navbar = () => {
  const { t } = useTranslation();
  const [profile, setProfile] = useState(null);
  const [alert, setAlert] = useState("");
  const [isNavOpen, setIsNavOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const { userId, setUserId, loading } = useAuth();
  const [trackRequests, setTrackRequests] = useState([]);
  const [eventRequests, setEventRequests] = useState([]);
  const navigate = useNavigate();
  const notificationsRef = useRef(null);
  const mobileMenuRef = useRef(null);

  useEffect(() => {
    const getProfile = async () => {
      if (!userId) return;
      
      try {
        const response = await axiosInstance.get("/users/profile");
        setProfile(response.data.user);
      } catch (error) {
        if (error.response?.status === 401) {
          setAlert("Your session has ended. Please sign in again.");
          setUserId(null);
          setTimeout(() => navigate("/signin"), 3000);
        }
      }
    };

    getProfile();
  }, [userId, navigate, setUserId]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      // Handle notifications dropdown
      if (notificationsRef.current && !notificationsRef.current.contains(event.target)) {
        setIsNotificationsOpen(false);
      }
      // Handle mobile menu
      if (mobileMenuRef.current && 
          !mobileMenuRef.current.contains(event.target) &&
          !event.target.closest('button[aria-label="Menu"]')) {
        setIsNavOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    getNotifications();
  }, []);

  const getNotifications = async () => {
    try {
      const [trackRequestsRes, eventRequestsRes] = await Promise.all([
        axiosInstance.get("/track-requests/notifications"),
        axiosInstance.get("/event-registrations/pending")
      ]);
      
      const pendingTrackRequests = Array.isArray(trackRequestsRes.data) 
        ? trackRequestsRes.data.filter(request => request.status === 'pending')
        : [];
      
      const pendingEventRequests = Array.isArray(eventRequestsRes.data) 
        ? eventRequestsRes.data.filter(request => request.status === 'pending')
        : [];
      
      setTrackRequests(pendingTrackRequests);
      setEventRequests(pendingEventRequests);
    } catch (error) {
      console.error("Error fetching notifications:", error);
      setTrackRequests([]);
      setEventRequests([]);
    }
  };

  const toggleNavbar = () => setIsNavOpen(!isNavOpen);
  const isUserLoggedIn = () => !loading && !!userId;

  const handleSignOut = async () => {
    try {
      await axiosInstance.post("/users/signout");
      setUserId(null);
      setProfile(null);
      navigate("/signin");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const navLinkClass = ({ isActive }) =>
    `relative hover:bg-mainRed text-left rounded transition-all duration-50 font-bold
     sm:hover:text-mainRed sm:transition-all sm:hover:bg-transparent sm:justify-center flex items-center gap-2
     ${isActive ? "text-mainRed" : ""}`;

  const mobileLinkClass = ({ isActive }) => 
    `flex items-center gap-3 px-4 py-3 rounded-lg font-bold transition-colors duration-200
     ${isActive ? 'text-mainRed' : 'text-mainYellow hover:bg-mainRed/10'}`;

  const pendingRequestsCount = trackRequests.length + eventRequests.length;

  return (
    <nav className="sticky top-0 z-50 bg-accentBlue border-b border-accentGray">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Left Section - Logo */}
          <div className="w-1/4 flex justify-start">
            <NavLink to="/" className="flex items-center">
              <img src={logo} alt="Logo" className="w-12 h-12 mt-2" />
            </NavLink>
          </div>

          {/* Desktop Navigation */}
          <div className="w-2/4 hidden md:flex items-center justify-center space-x-5">
            <NavLink to="/" className={navLinkClass}>
              <FontAwesomeIcon icon={faHome} />
              <span>{t('navbar.home')}</span>
            </NavLink>
            <NavLink to="/tracks" className={navLinkClass}>
              <FontAwesomeIcon icon={faRoute} />
              <span>{t('navbar.tracks')}</span>
            </NavLink>
            <NavLink to="/events" className={navLinkClass}>
              <FontAwesomeIcon icon={faCalendarAlt} />
              <span>{t('navbar.events')}</span>
            </NavLink>
            {isUserLoggedIn() && (
              <NavLink to="/profile" className={navLinkClass}>
                <FontAwesomeIcon icon={faUser} />
                <span>{t('navbar.profile')}</span>
              </NavLink>
            )}
          </div>

          {/* Right side items */}
          <div className="md:w-1/4 flex items-center space-x-4">
            <LanguageSwitcher />
            {isUserLoggedIn() ? (
              <>
                {/* Notifications */}
                <div className="relative" ref={notificationsRef}>
                  <button
                    onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                    className="relative p-2 text-mainYellow hover:text-mainRed transition-colors">
                    <FontAwesomeIcon icon={faBell} className="text-xl" />
                    {pendingRequestsCount > 0 && (
                      <span className="absolute top-0 right-0 flex items-center justify-center w-4 h-4 bg-mainRed text-white text-xs font-bold rounded-full">
                        <FontAwesomeIcon icon={faExclamation} />
                      </span>
                    )}
                  </button>
                  {isNotificationsOpen && (
                    <div className="absolute min-w-80 left-1/2 transform -translate-x-1/2 sm:right-0 top-full mt-2 w-full sm:w-96 sm:max-w-none rounded-lg bg-accentBlue shadow-lg z-10 border border-accentGray">
                      <div className="p-4">
                        <h3 className="text-lg font-semibold text-mainYellow mb-4">{t('notifications.title')}</h3>
                        {pendingRequestsCount === 0 ? (
                          <div className="text-gray-400 text-center py-4">
                            {t('notifications.noNotifications')}
                          </div>
                        ) : (
                          <div className="max-h-96 overflow-y-auto space-y-2">
                            {trackRequests.map((request) => (
                                <TrackRequest 
                                  key={request._id} 
                                  request={request} 
                                  action={t('notifications.wantsToJoin')}
                                  showActions={false}
                                />
                              ))}
                            {eventRequests.map((request) => (
                                <EventRequest 
                                  key={request._id} 
                                  request={request}
                                  showActions={false}
                                />
                              ))}
                          </div>
                        )}
                        <NavLink to="/notifications" className="block text-center mt-4 text-sm text-mainYellow hover:text-mainRed transition-colors">
                          {t('notifications.viewAll')}
                        </NavLink>
                      </div>
                    </div>
                  )}
                </div>

                {/* Sign Out */}
                <button 
                  onClick={handleSignOut} 
                  className="relative w-auto text-center overflow-hidden text-mainRed hover:bg-mainRed rounded transition-all duration-500
                            sm:px-6 sm:py-2 sm:rounded hover:text-mainYellow min-w-0 flex-shrink-0 whitespace-nowrap flex items-center gap-2 font-bold">
                  <FontAwesomeIcon icon={faSignOutAlt} />
                  <span className="hidden md:inline">{t('navbar.signout')}</span>
                </button>
              </>
            ) : (
              <>
                <NavLink to="/signin" className="relative w-auto text-center overflow-hidden text-mainRed hover:bg-mainRed rounded transition-all duration-500
                                               sm:px-6 sm:py-2 sm:rounded hover:text-mainYellow min-w-0 flex-shrink-0 whitespace-nowrap font-bold hidden md:flex">
                  {t('navbar.signin')}
                </NavLink>
                <NavLink to="/signup" className="relative w-auto text-center overflow-hidden hover:bg-mainRed rounded transition-all duration-500
                                               sm:px-6 sm:py-2 sm:rounded sm:hover:text-mainYellow min-w-0 flex-shrink-0 whitespace-nowrap font-bold hidden md:flex">
                  {t('navbar.signup')}
                </NavLink>
              </>
            )}

            {/* Mobile menu button */}
            <button 
              onClick={toggleNavbar}
              aria-label="Menu"
              className="md:hidden p-2 text-mainRed hover:text-mainYellow transition-colors"
            >
              <FontAwesomeIcon icon={isNavOpen ? faTimes : faBars} className="text-xl" />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      <div className={`fixed inset-0 z-50 md:hidden ${isNavOpen ? 'visible' : 'invisible'}`}>
        {/* Backdrop */}
        <div 
          className={`fixed inset-0 bg-black/50 transition-opacity duration-300 ${
            isNavOpen ? 'opacity-100' : 'opacity-0'
          }`}
          onClick={toggleNavbar}
        />

        {/* Sidebar Menu */}
        <div
          ref={mobileMenuRef}
          className={`fixed top-0 right-0 h-full w-64 bg-accentBlue transform transition-transform duration-300 ease-in-out shadow-xl ${
            isNavOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
        >
          <div className="flex flex-col h-full">
            <div className="p-4 border-b border-accentGray">
              <img src={logo} alt="Logo" className="w-12 h-12" />
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              <NavLink to="/" onClick={toggleNavbar} className={mobileLinkClass}>
                <FontAwesomeIcon icon={faHome} />
                <span>{t('navbar.home')}</span>
              </NavLink>
              
              <NavLink to="/tracks" onClick={toggleNavbar} className={mobileLinkClass}>
                <FontAwesomeIcon icon={faRoute} />
                <span>{t('navbar.tracks')}</span>
              </NavLink>

              <NavLink to="/events" onClick={toggleNavbar} className={mobileLinkClass}>
                <FontAwesomeIcon icon={faCalendarAlt} />
                <span>{t('navbar.events')}</span>
              </NavLink>

              {isUserLoggedIn() && (
                <>
                  <NavLink to="/profile" onClick={toggleNavbar} className={mobileLinkClass}>
                    <FontAwesomeIcon icon={faUser} />
                    <span>{t('navbar.profile')}</span>
                  </NavLink>
                  <NavLink to="/notifications" onClick={toggleNavbar} className={mobileLinkClass}>
                    <FontAwesomeIcon icon={faBell} />
                    <span>{t('navbar.notifications')}</span>
                    {pendingRequestsCount > 0 && (
                      <span className="ml-auto flex items-center justify-center w-4 h-4 bg-mainRed text-white text-xs font-bold rounded-full">
                        <FontAwesomeIcon icon={faExclamation} />
                      </span>
                    )}
                  </NavLink>
                </>
              )}
            </div>

            {/* Mobile Footer Section */}
            <div className="p-4 border-t border-accentGray">
              {isUserLoggedIn() ? (
                <button
                  onClick={handleSignOut}
                  className="w-full flex items-center gap-2 text-mainRed hover:text-mainYellow transition-colors font-bold"
                >
                  <FontAwesomeIcon icon={faSignOutAlt} />
                  <span>{t('navbar.signout')}</span>
                </button>
              ) : (
                <div className="flex flex-col gap-2">
                  <NavLink
                    to="/signin"
                    onClick={toggleNavbar}
                    className="text-center py-2 text-mainRed hover:text-mainYellow transition-colors font-bold"
                  >
                    {t('navbar.signin')}
                  </NavLink>
                  <NavLink
                    to="/signup"
                    onClick={toggleNavbar}
                    className="text-center py-2 text-white bg-mainRed/80 hover:bg-mainRed rounded-lg transition-colors font-bold"
                  >
                    {t('navbar.signup')}
                  </NavLink>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Alert Message */}
      {alert && (
        <div className="bg-red-500 text-white p-4 text-center">
          {alert}
        </div>
      )}
    </nav>
  );
};

export default Navbar;