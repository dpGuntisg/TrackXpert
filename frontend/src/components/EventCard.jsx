import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useTranslation } from 'react-i18next';
import axiosInstance from '../utils/axios';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';

const EventCard = ({ event }) => {

    const {t} = useTranslation();
    const navigate = useNavigate();

    return(
        <div></div>
    );
};

export default EventCard;