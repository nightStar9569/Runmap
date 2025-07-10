import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000', // Adjust if needed
  withCredentials: true, // Needed for refresh token cookie
});

export default api;
