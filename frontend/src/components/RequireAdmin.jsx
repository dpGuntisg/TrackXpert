import { useAuth } from "../context/AuthContext";
import { useTranslation } from 'react-i18next';

const RequireAdmin = ({ children }) => {
    const { role, loading } = useAuth();
    const { t } = useTranslation();

    if (loading) {
        return (
            <div className="flex h-screen w-screen items-center justify-center bg-mainBlue">
                <div className="flex flex-col items-center">
                    <div className="loader ease-linear rounded-full border-4 border-t-4 border-mainRed h-12 w-12 mb-4"></div>
                    <p className="text-lg">{t('tracks.loading')}</p>
                </div>
            </div>
        );
    }

    if (role !== "admin") {
        return (
            <div className="flex h-screen w-screen items-center justify-center bg-mainBlue">
                <div className="flex flex-col items-center">
                    <h1 className="text-4xl font-bold text-mainRed">403</h1>
                    <p className="text-white mt-2">{t('admin.unauthorized') || 'Unauthorized Access'}</p>
                </div>
            </div>
        );
    }
    

    return children;
};

export default RequireAdmin;
