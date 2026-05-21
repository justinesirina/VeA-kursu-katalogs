import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import api from '../services/axiosConfig';

// F14 prasība - autorizācija: glabā ielogoto lietotāju un piedāvā login/logout/hasRole.
// Mount-time ielādē /auth/me, lai noskaidrotu, vai lietotājam jau ir sesija.

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Mount-time pārbauda esošo sesiju.
    useEffect(() => {
        api.get('/auth/me')
            .then(res => setUser(res.data))
            .catch(() => setUser(null))
            .finally(() => setLoading(false));
    }, []);

    const login = useCallback(async (email, password) => {
        const res = await api.post('/auth/login', { email, password });
        setUser(res.data);
        return res.data;
    }, []);

    const logout = useCallback(async () => {
        try {
            await api.post('/auth/logout');
        } finally {
            setUser(null);
        }
    }, []);

    // Pārbauda, vai lietotājam ir norādītā loma (kumulatīvi).
    const hasRole = useCallback((roleKey) => {
        if (!user || !user.effectiveRoles) return false;
        return user.effectiveRoles.includes(roleKey);
    }, [user]);

    const value = { user, loading, login, logout, hasRole };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth: AuthProvider trūkst');
    return ctx;
}
