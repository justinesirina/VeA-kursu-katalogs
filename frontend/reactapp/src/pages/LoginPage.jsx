import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { LogIn } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import PasswordInput from '../components/ui/PasswordInput';
import veaLogo from '../assets/vea-logo.svg';

// F14 prasība - autorizācijas lapa kursu katalogā ar e-pastu un paroli.
function LoginPage() {
    const { login } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const redirectTo = location.state?.from?.pathname || '/';

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        if (!email.trim() || !password) {
            setError('Lūdzu, aizpildi visus laukus.');
            return;
        }
        setSubmitting(true);
        try {
            await login(email.trim(), password);
            navigate(redirectTo, { replace: true });
        } catch (err) {
            if (err.response?.status === 401) {
                setError('Nepareizs e-pasts vai parole.');
            } else {
                setError('Pieslēgšanās neizdevās. Lūdzu, mēģini vēlreiz.');
            }
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-vea-bg flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-white rounded-lg shadow-md p-8">
                <div className="flex justify-center mb-6">
                    <img src={veaLogo} alt="Ventspils Augstskola" className="h-12 w-auto" />
                </div>
                <h1 className="text-2xl font-semibold font-heading text-vea-neutral text-center mb-6">
                    Pieslēgties kursu katalogam
                </h1>

                {error && (
                    <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-sm text-red-700">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-vea-neutral mb-1">
                            E-pasts
                        </label>
                        <input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            autoComplete="email"
                            autoFocus
                            disabled={submitting}
                            className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-vea-green"
                        />
                    </div>

                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-vea-neutral mb-1">
                            Parole
                        </label>
                        <PasswordInput
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            autoComplete="current-password"
                            disabled={submitting}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={submitting}
                        className="w-full bg-vea-green text-white py-2 rounded font-medium hover:bg-vea-green-dark transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
                    >
                        <LogIn className="w-4 h-4" aria-hidden="true" />
                        {submitting ? 'Pieslēdzas...' : 'Pieslēgties'}
                    </button>
                </form>
            </div>
        </div>
    );
}

export default LoginPage;
