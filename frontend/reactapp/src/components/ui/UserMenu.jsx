import { useState } from 'react';
import { UserCircle2, LogOut } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

// Header lietotāja izvēlne — rāda ielogoto lietotāju un piedāvā iziet.
function UserMenu() {
    const { user, logout } = useAuth();
    const [open, setOpen] = useState(false);
    const navigate = useNavigate();

    if (!user) return null;

    const handleLogout = async () => {
        setOpen(false);
        await logout();
        navigate('/login', { replace: true });
    };

    const fullName = [user.name, user.surname].filter(Boolean).join(' ').trim() || user.email;
    const label = `${fullName} · ${user.roleName}`;

    return (
        <div className="relative">
            <button
                type="button"
                onClick={() => setOpen(o => !o)}
                className="flex items-center gap-1.5 text-white/90 hover:text-white text-xs px-2 py-1 rounded hover:bg-white/10 transition-colors max-w-[260px]"
                aria-haspopup="menu"
                aria-expanded={open}
            >
                <UserCircle2 className="w-4 h-4 shrink-0" aria-hidden="true" />
                <span className="truncate">{label}</span>
            </button>

            {open && (
                <>
                    <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} aria-hidden="true" />
                    <div className="absolute right-0 top-full mt-1 z-50 w-48 bg-white border border-gray-200 rounded shadow-lg text-sm text-vea-text">
                        <button
                            type="button"
                            onClick={handleLogout}
                            className="w-full text-left px-3 py-2 hover:bg-gray-50 flex items-center gap-2"
                        >
                            <LogOut className="w-4 h-4" aria-hidden="true" />
                            Iziet
                        </button>
                    </div>
                </>
            )}
        </div>
    );
}

export default UserMenu;
