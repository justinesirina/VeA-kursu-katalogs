import axios from 'axios';

// Use Docker backend hostname only when explicitly running inside Docker network.
// When running locally (npm start), always use localhost regardless of how the
// browser accesses the page (localhost, 127.0.0.1, host.docker.internal, etc.)
const backendUrl = process.env.REACT_APP_API_URL || 'http://localhost:8080/api';

const api = axios.create({
    baseURL: backendUrl,
});

// F9 — automātiski pievieno X-Actor-User-Id header katram pieprasījumam, ja
// CurrentUserSwitcher ir izvēlējies lietotāju. Backend žurnālā fiksē šo lietotāju
// kā darbības veicēju. Phase 5 (Spring Security) aizstās ar autentificētu user.
api.interceptors.request.use((config) => {
    if (typeof window !== 'undefined') {
        const stored = window.localStorage.getItem('currentUserId');
        if (stored) {
            config.headers = config.headers || {};
            config.headers['X-Actor-User-Id'] = stored;
        }
    }
    return config;
});

export default api;
