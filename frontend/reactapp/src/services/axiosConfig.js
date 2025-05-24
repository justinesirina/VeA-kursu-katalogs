import axios from 'axios';

const isDocker = window.location.hostname !== 'localhost';

const api = axios.create({
    baseURL: isDocker ? 'http://backend-app:8080/api' : 'http://localhost:8080/api',
});

export default api;
