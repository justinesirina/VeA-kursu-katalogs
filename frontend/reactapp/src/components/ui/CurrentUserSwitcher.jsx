import { useEffect, useState } from 'react';
import { UserCircle2 } from 'lucide-react';
import api from '../../services/axiosConfig';

const STORAGE_KEY = 'currentUserId';

// TODO: aizvietot ar īstu autentifikāciju (Phase 5 — Spring Security + frontend useAuth).
// Šobrīd lietotājs izvēlas, kā kura loma viņš darbojas; izvēle saglabājas localStorage.

export function getCurrentUserId() {
    const raw = typeof window !== 'undefined' ? window.localStorage.getItem(STORAGE_KEY) : null;
    if (!raw) return null;
    const num = Number(raw);
    return Number.isFinite(num) ? num : null;
}

export function setCurrentUserId(id) {
    if (typeof window === 'undefined') return;
    if (id == null || id === '') {
        window.localStorage.removeItem(STORAGE_KEY);
    } else {
        window.localStorage.setItem(STORAGE_KEY, String(id));
    }
    window.dispatchEvent(new Event('currentUserId:change'));
}

export function useCurrentUserId() {
    const [id, setId] = useState(getCurrentUserId());
    useEffect(() => {
        const sync = () => setId(getCurrentUserId());
        window.addEventListener('currentUserId:change', sync);
        window.addEventListener('storage', sync);
        return () => {
            window.removeEventListener('currentUserId:change', sync);
            window.removeEventListener('storage', sync);
        };
    }, []);
    return id;
}

function userLabel(u) {
    if (!u) return '—';
    const name = [u.name, u.surname].filter(Boolean).join(' ').trim();
    const role = u.role?.roleName ? ` · ${u.role.roleName}` : '';
    return `${name || u.email || 'Lietotājs'}${role}`;
}

function CurrentUserSwitcher() {
    const [users, setUsers] = useState([]);
    const [open, setOpen] = useState(false);
    const currentId = useCurrentUserId();

    useEffect(() => {
        let cancelled = false;
        api.get('/users')
            .then(res => { if (!cancelled) setUsers(res.data || []); })
            .catch(() => { /* tihs error — switcher paliek tukšs */ });
        return () => { cancelled = true; };
    }, []);

    const current = users.find(u => u.id === currentId);

    return (
        <div className="relative">
            <button
                type="button"
                onClick={() => setOpen(o => !o)}
                className="flex items-center gap-1.5 text-white/90 hover:text-white text-xs px-2 py-1 rounded hover:bg-white/10 transition-colors max-w-[220px]"
                aria-haspopup="listbox"
                aria-expanded={open}
                title="Aktīvais lietotājs (dev režīms)"
            >
                <UserCircle2 className="w-4 h-4 shrink-0" aria-hidden="true" />
                <span className="truncate">
                    {current ? userLabel(current) : 'Izvēlies lietotāju'}
                </span>
            </button>

            {open && (
                <>
                    <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} aria-hidden="true" />
                    <ul
                        className="absolute right-0 top-full mt-1 z-50 w-72 max-h-80 overflow-y-auto bg-white border border-gray-200 rounded shadow-lg text-sm text-vea-text"
                        role="listbox"
                    >
                        <li>
                            <button
                                type="button"
                                onClick={() => { setCurrentUserId(null); setOpen(false); }}
                                className={`w-full text-left px-3 py-2 hover:bg-gray-50 ${currentId == null ? 'bg-gray-50 font-medium' : ''}`}
                            >
                                — Nav norādīts —
                            </button>
                        </li>
                        {users.map(u => (
                            <li key={u.id}>
                                <button
                                    type="button"
                                    onClick={() => { setCurrentUserId(u.id); setOpen(false); }}
                                    className={`w-full text-left px-3 py-2 hover:bg-gray-50 ${u.id === currentId ? 'bg-vea-green-light font-medium' : ''}`}
                                    role="option"
                                    aria-selected={u.id === currentId}
                                >
                                    {userLabel(u)}
                                </button>
                            </li>
                        ))}
                    </ul>
                </>
            )}
        </div>
    );
}

export default CurrentUserSwitcher;
