import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';

import NotFoundPage from './pages/NotFoundPage';
import SignInPage from './pages/SignInPage';
import SignUpPage from './pages/SignUpPage';
import TracksPage from './pages/TracksPage';
import TrackDetailPage from './pages/TrackDetailPage';
import ProfilePage from './pages/ProfilePage';
import Layout from './components/Layout';
import App from './App';

const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />, 
    errorElement: <NotFoundPage />,
    children: [
      {
        path: "/", 
        element: <App />,
        errorElement: <NotFoundPage />,
      },
      {
        path: "tracks", 
        element: <TracksPage />,
        errorElement: <NotFoundPage />,
      },
      {
        path: "tracks/:id", 
        element: <TrackDetailPage />,
        errorElement: <NotFoundPage />,
      },
      {
        path: "/profile",
        element: <ProfilePage />,
        errorElement: <NotFoundPage />,
      },
    ],
  },
  {
    path: "/signin", 
    element: <SignInPage />,
    errorElement: <NotFoundPage />,
  },
  {
    path: "/signup", 
    element: <SignUpPage />,
    errorElement: <NotFoundPage />,
  },
  {
    path: "*", 
    element: <NotFoundPage />,
  },
]);

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);
