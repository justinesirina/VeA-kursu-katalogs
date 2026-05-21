import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * 404 lapa nepazīstamiem maršrutiem. Sasniegt to var:
 *   - tieši ievadot nepareizu URL pārlūkā;
 *   - sekojot vecai/sabojātai saitei.
 *
 * Pieejama autentificētam lietotājam, lai sniegtu UX kontekstu (galvene + atpakaļ).
 * Neautentificētam lietotājam ProtectedRoute pirms tās novirza uz /login.
 */
function NotFound() {
    const navigate = useNavigate();
    const { user } = useAuth();

    return (
        <div className="max-w-xl mx-auto p-8 mt-12 bg-white rounded-lg shadow-md text-center">
            <p className="text-5xl font-bold font-heading text-vea-green mb-2">404</p>
            <h1 className="text-xl font-semibold font-heading text-vea-neutral mb-2">
                Lapa nav atrasta
            </h1>
            <p className="text-sm text-vea-text mb-5">
                Adrese, ko mēģini atvērt, sistēmā nepastāv vai ir mainījusies.
                Pārbaudi saites pareizību vai atgriezies uz kataloga sākumu.
            </p>
            <div className="flex justify-center gap-2 flex-wrap">
                <button
                    onClick={() => navigate('/')}
                    className="bg-vea-green text-white px-4 py-2 rounded text-base hover:bg-vea-green-dark"
                >
                    Uz kataloga sākumu
                </button>
                {user && (
                    <button
                        onClick={() => navigate(-1)}
                        className="bg-white border border-gray-300 text-vea-neutral px-4 py-2 rounded text-base hover:bg-gray-100"
                    >
                        Atpakaļ
                    </button>
                )}
            </div>
        </div>
    );
}

export default NotFound;
