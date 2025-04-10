import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axiosInstance from "../utils/axios";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faExclamationCircle, faCheckCircle } from '@fortawesome/free-solid-svg-icons';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';

export default function SignInPage() {
  const { t } = useTranslation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [touched, setTouched] = useState({ email: false, password: false });
  const navigate = useNavigate();
  const { setUserId } = useAuth();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
  
    try {
      const response = await axiosInstance.post("/users/signin", {
        email,
        password,
      });
      
      if (response.status === 200 && response.data.user) {
        setUserId(response.data.user._id);
        setSuccess(t('auth.signInSuccess'));
        navigate("/");
      } else {
        setError(t('auth.signInError'));
      }
    } catch (error) {
      if (error.response && error.response.data && error.response.data.message) {
        setError(error.response.data.message);
      } else if (error.request) {
        setError(t('common.noServerResponse'));
      } else {
        setError(t('common.unexpectedError'));
      }
    }
  };

  const handleBlur = (field) => {
    setTouched(prev => ({ ...prev, [field]: true }));
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden md:flex-row">
      {/* Left side with logo and animation */}
      <div className="flex flex-col w-full md:w-1/2 justify-center">
        <h1 className="text-7xl font-black text-main-red italic text-mainRed">TrackXpert</h1>
        <div className="hidden md:block md:relative w-3/4 h-full">
          <svg
            viewBox="0 0 400 100"
            className="w-full h-full"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M20,50 Q100,10 200,50 T380,50"
              stroke="#ccc"
              fill="none"
              strokeWidth="5"
            />
            <circle r="5" fill="#e63946">
              <animateMotion
                dur="3s"
                repeatCount="indefinite"
                path="M20,50 Q100,10 200,50 T380,50"
              />
            </circle>
            <circle r="5" fill="#1d3557">
              <animateMotion
                dur="4s"
                repeatCount="indefinite"
                path="M20,50 Q100,10 200,50 T380,50"
                begin="1s"
              />
            </circle>
          </svg>
        </div>
      </div>

      <div className="flex flex-col items-center justify-center w-full md:w-1/2 mt-24 md:mt-0 md:h-screen">
        <div className="w-96 max-w-[90%]">
          <h1 className="text-3xl font-bold mb-8 text-center">{t('auth.welcomeBack')}</h1>
          
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

          <form onSubmit={handleLogin} className="space-y-4 bg-accentBlue p-6 rounded-lg shadow-lg">
            <div className="space-y-1">
              <label htmlFor="email" className="text-sm font-medium text-gray-300">
                {t('auth.email')}
              </label>
              <input
                className={`w-full px-4 py-3 rounded-lg bg-inputBlue border transition-all duration-200 outline-none
                  ${touched.email && !email 
                    ? 'border-red-500 focus:border-red-500' 
                    : 'border-gray-700 focus:border-mainRed'}`}
                type="email"
                id="email"
                placeholder={t('auth.emailPlaceholder')}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onBlur={() => handleBlur('email')}
              />
              {touched.email && !email && (
                <p className="text-red-500 text-sm mt-1">{t('auth.requiredField')}</p>
              )}
            </div>

            <div className="space-y-1">
              <label htmlFor="password" className="text-sm font-medium text-gray-300">
                {t('auth.password')}
              </label>
              <input
                className={`w-full px-4 py-3 rounded-lg bg-inputBlue border transition-all duration-200 outline-none
                  ${touched.password && !password 
                    ? 'border-red-500 focus:border-red-500' 
                    : 'border-gray-700 focus:border-mainRed'}`}
                type="password"
                id="password"
                placeholder={t('auth.passwordPlaceholder')}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onBlur={() => handleBlur('password')}
              />
              {touched.password && !password && (
                <p className="text-red-500 text-sm mt-1">{t('auth.requiredField')}</p>
              )}
            </div>

            <button
              type="submit"
              className="w-full py-3 px-4 bg-mainRed text-white rounded-lg font-medium
                hover:bg-red-700 transition-colors duration-200
                focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-gray-800"
            >
              {t('auth.signIn')}
            </button>

            <div className="flex justify-center items-center gap-2 pt-4">
              <p className="text-gray-400">{t('auth.noAccount')}</p>
              <Link 
                to="/signup" 
                className="text-mainRed hover:text-red-400 font-medium transition-colors"
              >
                {t('auth.signUpHere')}
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}