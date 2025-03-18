import React, { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBars } from "@fortawesome/free-solid-svg-icons";

const Navbar = () => {
  const [profile, setProfile] = useState(null);
  const [alert, setAlert] = useState("");
  const [isNavOpen, setIsNavOpen] = useState(false);

  useEffect(() => {
    const getProfile = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;

      try {
        const response = await axios.get("http://localhost:5000/api/users/profile", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setProfile(response.data.user);
      } catch (error) {
        if (error.response?.status === 401) {
          localStorage.removeItem("token");
          setAlert("Your session has ended. Please sign in again.");
          setTimeout(() => (window.location.href = "/signin"), 3000);
        }
      }
    };

    getProfile();
  }, []);

  const toggleNavbar = () => setIsNavOpen(!isNavOpen);
  const isUserLoggedIn = () => !!localStorage.getItem("token");

  const handleSignOut = async () => {
    const token = localStorage.getItem("token");
    await axios.post("http://localhost:5000/api/users/signout", {}, {
      headers: { Authorization: `Bearer ${token}` },
    });
    localStorage.removeItem("token");
    window.location.reload();
  };

  const navLinkClass = ({ isActive }) =>
    `relative hover:bg-mainRed w-full text-left rounded transition-all duration-50
     sm:hover:text-mainRed sm:transition-all sm:hover:bg-transparent sm:justify-center 
     ${isActive ? "text-mainRed font-bold drop-shadow-[0px_0px_10px_rgba(254,1,1,0.9)]" : ""}`;

  return (
    <nav className="p-6 sticky top-0 z-50 bg-mainBlue">
      <div className="flex sm:items-center font-semibold flex-col sm:flex-row">
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
        <div className={`flex flex-col sm:flex-row sm:mx-auto sm:space-x-5 sm:items-center ${isNavOpen ? 'block' : 'hidden sm:block'}`}>
          <NavLink to="/" className={navLinkClass}>HOME</NavLink>
          <NavLink to="/tracks" className={navLinkClass}>TRACKS</NavLink>
          <NavLink to="/events" className={navLinkClass}>EVENTS</NavLink>
          {isUserLoggedIn() && <NavLink to="/profile" className={navLinkClass}>PROFILE</NavLink>}
        </div>

        {/* Authentication Buttons */}
        <div className={`flex flex-col sm:flex-row ${isNavOpen ? 'block' : 'hidden sm:block'}`}>
          {!isUserLoggedIn() ? (
            <>
              <NavLink to="/signup">
                <button className="relative overflow-hidden hover:bg-mainRed text-left rounded transition-all duration-500
                              sm:px-4 sm:py-2 sm:rounded sm:hover:text-mainYellow">
                  SIGN UP
                </button>
              </NavLink>
              <NavLink to="/signin">
                <button className="relative overflow-hidden text-mainRed hover:bg-mainRed text-left rounded transition-all duration-500
                              sm:px-4 sm:py-2 sm:rounded hover:text-mainYellow">
                  SIGN IN
                </button>
              </NavLink>
            </>
          ) : (
            <button onClick={handleSignOut} className="relative overflow-hidden text-mainRed hover:bg-mainRed text-left rounded transition-all duration-500
                          sm:px-4 sm:py-2 sm:rounded hover:text-mainYellow">
              SIGN OUT
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
