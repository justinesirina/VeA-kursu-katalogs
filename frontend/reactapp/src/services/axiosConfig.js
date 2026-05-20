import axios from 'axios';

// Use Docker backend hostname only when explicitly running inside Docker network.
// When running locally (npm start), always use localhost regardless of how the
// browser accesses the page (localhost, 127.0.0.1, host.docker.internal, etc.)
const backendUrl = process.env.REACT_APP_API_URL || 'http://localhost:8080/api';

const api = axios.create({
    baseURL: backendUrl,
    // F14 prasība — sūta JSESSIONID cookie ar katru pieprasījumu (sesijas autentifikācijai).
    withCredentials: true,
});

export default api;
