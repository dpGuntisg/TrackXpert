import React, { useState, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import axiosInstance from "../utils/axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBars } from "@fortawesome/free-solid-svg-icons";
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from "./LanguageSwitcher";
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { t } = useTranslation();
  const [profile, setProfile] = useState(null);
  const [alert, setAlert] = useState("");
  const [isNavOpen, setIsNavOpen] = useState(false);
  const { userId, setUserId, loading } = useAuth();
  const navigate = useNavigate();
  
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
    `relative hover:bg-mainRed text-left rounded transition-all duration-50
     sm:hover:text-mainRed sm:transition-all sm:hover:bg-transparent sm:justify-center 
     ${isActive ? "text-mainRed font-bold drop-shadow-[0px_0px_10px_rgba(254,1,1,0.9)]" : ""}`;

  return (
    <nav className="p-6 sticky top-0 z-50 bg-accentBlue">
      <div className="flex sm:items-center font-semibold flex-col justify-center sm:flex-row">
        <div className="flex items-center justify-between">
          <NavLink to="/">
            <h1 className="text-mainRed text-3xl font-black italic hover:text-red-800 cursor-pointer">
              TrackXpert
            </h1>
          </NavLink>
          <button onClick={toggleNavbar} className="sm:hidden text-mainRed focus:outline-none">
            <FontAwesomeIcon icon={faBars} size="2xl" />
          </button>
        </div>

        {/* Navigation Links */}

        <div className={`flex flex-col sm:flex-row sm:space-x-5 sm:items-center sm:gap-4 sm:justify-center sm:flex-grow text-center ${isNavOpen ? 'flex' : 'hidden sm:flex'}`}>
          <NavLink to="/" className={navLinkClass}> {t('navbar.home') }</NavLink>
          <NavLink to="/tracks" className={navLinkClass}> {t('navbar.tracks')} </NavLink>
          <NavLink to="/events" className={navLinkClass}> {t('navbar.events')} </NavLink>
          {isUserLoggedIn() && <NavLink to="/profile" className={navLinkClass}> {t('navbar.profile')} </NavLink>}
        </div>

        {/* Language Switcher */}
        <div className={`flex items-center sm:ml-auto ${isNavOpen? "flex" : "hidden sm:flex"}`}>
           <LanguageSwitcher />
        </div>

        {/* Authentication Buttons */}
        <div className={`flex flex-col sm:flex-row ${isNavOpen ? 'flex' : 'hidden sm:flex'}`}>
          {!isUserLoggedIn() ? (
            <>
              <NavLink to="/signup">
                <button className="relative w-auto text-center overflow-hidden hover:bg-mainRed rounded transition-all duration-500
                                  sm:px-6 sm:py-2 sm:rounded sm:hover:text-mainYellow min-w-0 flex-shrink-0 whitespace-nowrap">
                  {t('navbar.signup')}
                </button>
              </NavLink>
              <NavLink to="/signin">
                <button className="relative w-auto text-center overflow-hidden text-mainRed hover:bg-mainRed rounded transition-all duration-500
                                  sm:px-6 sm:py-2 sm:rounded hover:text-mainYellow min-w-0 flex-shrink-0 whitespace-nowrap">
                  {t('navbar.signin')}
                </button>
              </NavLink>
            </>
          ) : (
            <button onClick={handleSignOut} className="relative w-24 sm:w-auto text-center overflow-hidden text-mainRed hover:bg-mainRed rounded transition-all duration-500
                          sm:px-4 sm:py-2 sm:rounded hover:text-mainYellow whitespace-nowrap">
              {t('navbar.signout')}
            </button>
          )}
        </div>
      </div>

      {/* Alert Message */}
      {alert && (
        <div className="flex justify-center mt-4">
          <div className="alert alert-error w-1/2 bg-red-500 text-white p-4 rounded">{alert}</div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
