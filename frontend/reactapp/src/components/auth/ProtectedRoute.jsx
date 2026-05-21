import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

// Aizsargā maršrutu. Ja lietotājs nav pieslēdzies, novirza uz /login.
// Ja norādīts requireRole, papildus pārbauda, vai lietotājam ir vajadzīgā loma.
function ProtectedRoute({ children, requireRole }) {
    const { user, loading, hasRole } = useAuth();
    const location = useLocation();

    if (loading) {
        return <div className="p-6 text-gray-500">Ielādē...</div>;
    }

    if (!user) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    if (requireRole && !hasRole(requireRole)) {
        return (
            <div className="max-w-xl mx-auto p-8 mt-12 bg-white rounded-lg shadow-md text-center">
                <h2 className="text-xl font-semibold text-vea-neutral mb-2">Nav pietiekamu tiesību</h2>
                <p className="text-sm text-vea-text">
                    Tev nav tiesību apskatīt šo sadaļu. Sazinies ar sistēmas administratoru.
                </p>
            </div>
        );
    }

    return children;
}

export default ProtectedRoute;
