import axios from 'axios';

const AUTH_BASE_URL = '/api/v1/auth';
const REQUEST_BASE_URL = '/api/v1/requests';

// Auth API
const authApi = axios.create({
    baseURL: AUTH_BASE_URL,
});

export const authApiService = {
    login: (credentials) => authApi.post('/login', credentials).then(res => res.data),
    register: (userData) => authApi.post('/register', userData).then(res => res.data),
    verifyEmail: (email) => authApi.post('/password/verifyEmail', email).then(res => res.data),
    verifyOTP: (data) => authApi.post('/password/verifyOTP', data).then(res => res.data),
    resetPassword: (data) => authApi.post('/password/reset', data).then(res => res.data),
};

// Request API
const requestApi = axios.create({
    baseURL: REQUEST_BASE_URL,
});

export const requestApiService = {
    submit: (request) => requestApi.post('/submit', request).then(res => res.data),
};