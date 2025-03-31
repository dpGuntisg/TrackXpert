import React from "react";
import Navbar from "./NavBar";
import { Outlet } from "react-router-dom";
import { ToastContainer, Slide } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Footer from "./Footer";
function Layout() {
    return (
        <div>
            <Navbar />
            <Outlet />
            <Footer />
            <ToastContainer
                position="top-center"
                autoClose={3000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                theme="dark"
                transition={Slide}
            />
        </div>
    );
}

export default Layout;