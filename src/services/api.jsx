import axios from 'axios';

// Create a custom axios instance for API calls
const api = axios.create({
  baseURL: 'http://localhost/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Remove token logic: no request interceptor needed
// (or you can still add a generic interceptor if you like)
api.interceptors.request.use(
  (config) => {
    // Nếu sau này bạn muốn thêm gì vào request thì viết tại đây
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Remove token expiration handling if no auth
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Optional: log error to console
    console.error('API error:', error);
    return Promise.reject(error);
  }
);

export { api };
