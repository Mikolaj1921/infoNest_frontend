import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // musthave for cookies to be sent in cross-origin requests
});

// add a request interceptor to include the token in headers
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // this will catch all errors from API calls and log them
    const message = error.response?.data?.message || 'Щось пішло не так';
    console.error('API Error:', message);
    return Promise.reject(error);
  },
);

export default api;
