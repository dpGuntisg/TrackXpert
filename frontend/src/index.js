import React, { Suspense } from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import './i18n/i18n';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

import NotFoundPage from './pages/NotFoundPage';
import SignInPage from './pages/SignInPage';
import SignUpPage from './pages/SignUpPage';
import TracksPage from './pages/TracksPage';
import TrackDetailPage from './pages/TrackDetailPage';
import EventPage from './pages/EventPage';
import CreateEventPage from './pages/CreateEventPage';
import ProfilePage from './pages/ProfilePage';
import NotificationPage from './pages/NotificationPage';
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
        element: (
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        ),
        errorElement: <NotFoundPage />,
      },
      {
        path: "/events",
        element: <EventPage />,
        errorElement: <NotFoundPage />,
      },
      {
        path: "/create-event",
        element: (
          <ProtectedRoute>
            <CreateEventPage />
          </ProtectedRoute>
        ),
        errorElement: <NotFoundPage />,
      },
      {
        path: "/notifications",
        element: (
          <ProtectedRoute>
            <NotificationPage />
          </ProtectedRoute>
        ),
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
    <Suspense fallback={<div>Loading...</div>}>
      <AuthProvider>
        <RouterProvider router={router} />
      </AuthProvider>
    </Suspense>
  </React.StrictMode>
);
