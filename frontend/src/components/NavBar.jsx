import React from "react";
import { NavLink } from "react-router-dom";
import { useState, useEffect } from "react";
import axios from "axios";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars } from "@fortawesome/free-solid-svg-icons";
function Navbar() {

  const [profile, setProfile] = useState(null);
  const [error, setError] = useState(null);
  const [alert, setAlert] = useState("");
  useEffect(() => {
      const getProfile = async () => {
          const token = localStorage.getItem('token');
          if (token) {
              try {
                  const response = await axios.get("http://localhost:5000/api/profile", {
                      headers: {
                          Authorization: `Bearer ${token}`,
                      },
                  });
                  setProfile(response.data.user);
              } catch (error) {
                  if (error.response && error.response.status === 401) {
                      localStorage.removeItem('token');
                      setError("Session expired.");
                      setAlert("Your session has ended. Please sign in again.");
                      setTimeout(() => {
                          window.location.href = "/signin";
                      },3000)
                  } else {
                      setError("Failed to get profile information");
                  }
              }
          }
      };
          
      getProfile();
  }, []);

    const [isNavOpen, setNavIsOpen] = useState(false);
    const toggleNavbar = () =>{ //toggle navbar, default state is false
      setNavIsOpen(!isNavOpen)
    }

    const isUserLoggedIn = () => { //check if user is logged by checking if token is in local storage

      const user = localStorage.getItem("token");
      return user !== null;
    };

    const handleSignOut = async () => {
      const token = localStorage.getItem("token");
    
      await axios.post("http://localhost:5000/api/signout", {}, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
    
      localStorage.removeItem("token");
      window.location.reload();
    };

    return(
        <nav className="p-6 sticky top-0 z-50 bg-mainBlue">
        <div className='flex sm:items-center font-semibold flex-col
                        sm:flex-row '>
          <div className="flex items-center justify-between">
            <NavLink to="/">
              <h1 className="text-mainRed text-3xl font-black italic hover:text-red-800 cursor-pointer">
                TrackXpert
              </h1>
            </NavLink>  
            {/* Hamburger menu button */}
            <button
              onClick={toggleNavbar} //if button is pressed toggle navbar
              className="sm:hidden block text-mainRed focus:outline-none" >
              <FontAwesomeIcon icon={faBars} size="2xl" />
            </button>
          </div>

          <div className={`flex flex-col
                          sm:mx-auto sm:flex sm:flex-row sm:space-x-5 sm:items-center ${isNavOpen ? 'block' : 'hidden sm:block'}`}>
            <NavLink to="/"> <button className="relative overflow-hidden hover:bg-mainRed w-full text-left rounded transition-all duration-500
                                          sm:hover:text-mainRed sm:transition-all sm:hover:bg-transparent ">HOME</button> </NavLink>
            <NavLink to="/tracks"> <button className="relative overflow-hidden hover:bg-mainRed w-full text-left rounded transition-all duration-500
                                                sm:hover:text-mainRed sm:transition-all sm:hover:bg-transparent  ">TRACKS</button> </NavLink>
            <NavLink to="/leaderboard"> <button className="relative overflow-hidden hover:bg-mainRed w-full text-left rounded transition-all duration-500
                                                      sm:hover:text-mainRed sm:transition-all sm:hover:bg-transparent">LEADERBOARD</button> </NavLink>
            {isUserLoggedIn() && (
              <NavLink to="/profile"> <button className="relative overflow-hidden hover:bg-mainRed w-full text-left rounded transition-all duration-500
                                                      sm:hover:text-mainRed sm:transition-all sm:hover:bg-transparent">PROFILE</button> </NavLink>
            )}
          </div>
          <div className={`flex flex-col
                          sm:flex-row ${isNavOpen ? 'block' : 'hidden sm:block'}`}>

            {!isUserLoggedIn() && (
            <NavLink to="/signup"> 
              <button className="relative overflow-hidden hover:bg-mainRed text-left rounded transition-all duration-500
                                 sm:px-4 sm:py-2 sm:rounded sm:transition-all sm:duration-300 sm:hover:text-mainYellow">
                SIGN UP
              </button>
            </NavLink>
                      )}
            {!isUserLoggedIn() && (
            <NavLink to="/signin"> 

              <button className="relative overflow-hidden text-mainRed hover:bg-mainRed text-left rounded transition-all duration-500
                                 sm:px-4 sm:py-2 sm:rounded sm:transition-all sm:duration-300 hover:text-mainYellow
                                 ">
                  SIGN IN
              </button>
            </NavLink>
            )}



            {isUserLoggedIn() && (
              <button className="relative overflow-hidden text-mainRed hover:bg-mainRed text-left rounded transition-all duration-500
                                 sm:px-4 sm:py-2 sm:rounded sm:transition-all sm:duration-300 hover:text-mainYellow"
                onClick={handleSignOut}>
                SIGN OUT
              </button>
            )}

          </div>
        </div>
        {alert && (
        <div className="flex justify-center">
          <div className="flex justify-center alert alert-error mt-4 w-1/2 bg-red-500 text-white p-4 rounded">
            {alert}
          </div>
        </div>
      )}
      </nav>
    )
}

export default Navbar;