import axios from "axios";

const AUTH_BASE_URL = "/api/auth";
const REQUEST_BASE_URL = "/api/requests";
const USER_BASE_URL = "/api/user";
const MODULE_BASE_URL = "/api/module";
const GATEWAY_BASE_URL = "/api/gateway";

const createAuthenticatedApi = (baseURL) => {
    const api = axios.create({ baseURL });
    
    api.interceptors.request.use(
      config => {
        const token = localStorage.getItem('token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      error => Promise.reject(error)
    );
    
    api.interceptors.response.use(
      response => response,
      error => {
        // if (error.response && error.response.status === 403) {
        //   localStorage.removeItem('token');
        //   window.location.href = '/login';
        // }
        return Promise.reject(error);
      }
    );
    
    return api;
  };

// Auth API
const authApi = axios.create({
    baseURL: AUTH_BASE_URL,
});

export const authApiService = {
    login: (credentials) =>
        authApi.post("/login", credentials).then((res) => res.data),
    register: (userData) =>
        authApi.post("/register", userData).then((res) => res.data),
    verifyEmail: (email) =>
        authApi.post("/password/verifyEmail", email).then((res) => res.data),
    verifyOTP: (data) =>
        authApi.post("/password/verifyOTP", data).then((res) => res.data),
    resetPassword: (data) =>
        authApi.post("/password/reset", data).then((res) => res.data),
};

// Request API
const requestApi = createAuthenticatedApi(REQUEST_BASE_URL);

export const requestApiService = {
    submit: (request) =>
        requestApi.post("/submit", request).then((res) => res.data),
    getAllRequestsByModule: (moduleCode) => requestApi.get(`/module/${moduleCode}`).then((res) => res.data),
    getAllRequestsByProfessor: (professorId) =>
        requestApi.get(`/professor/${professorId}`).then((res) => res.data),
    getRequestsByStudent: (studentId) =>
        requestApi.get(`/student/${studentId}`).then((res) => res.data),
    getRequestDetailsByStudent: (studentId, requestId) =>
        requestApi.get(`/student/${studentId}/${requestId}`).then((res) => res.data),
    getRequestsByProfessor: (professorId) =>
        requestApi.get(`/professor/${professorId}`).then((res) => res.data),
    deleteRequest: (requestId) =>
        requestApi.delete(`/${requestId}`).then((res) => res.data),
    updateRequest: (requestId, status) =>
        requestApi.put(`/${requestId}`, status).then((res) => res.data),
};

// User API
const userApi = createAuthenticatedApi(USER_BASE_URL);

export const userApiService = {
    getAllUsers: () => userApi.get("/all").then((res) => res.data),
    updateUser: (userData) =>
        userApi
            .post(`/${userData.matrix_id}`, userData)
            .then((res) => res.data),
    deleteUser: (id) => userApi.delete(`${id}`).then((res) => res.data),
    // getAllProfessors: () => userApi.get('/all/professors').then(res => res.data),
};

// Module API
const moduleApi = createAuthenticatedApi(MODULE_BASE_URL);

export const moduleApiService = {
    // getAllModules: () => moduleApi.get('/all').then(res => res.data),
    updateEducator: (data) =>
        moduleApi.post("/updateEducator", data).then((res) => res.data),
    getClassesByModule: (moduleCode) =>
        moduleApi.get(`/classes/${moduleCode}`).then((res) => res.data),
    updateEnrollmentByModule: (data) =>
        moduleApi
            .post(`/updateEnrollment/${data.moduleCode}`, data.modifiedStudents)
            .then((res) => res.data),
    getModulesByProfessor: (professorId) =>
        moduleApi.get(`/professor/modules/${professorId}`).then((res) => res.data),
    getModulesByStudent: (studentID) =>
        moduleApi.get(`/students/${studentID}/modules`).then((res) => res.data),
    getAllFaculties: () => moduleApi.get("/all/faculties").then((res) => res.data),
};

// Gateway API
const gatewayApi = createAuthenticatedApi(GATEWAY_BASE_URL);

export const gatewayApiService = {
    getAllModules: () => gatewayApi.get("/modules/all").then((res) => res.data),
    getAllStudentsByModule: (moduleCode) =>
        gatewayApi.get(`/students/${moduleCode}`).then((res) => res.data),
    getEnrolledStudentsByModule: (moduleCode) =>
        gatewayApi.get(`/students/enrolled/${moduleCode}`).then((res) => res.data),
    getModulesTakenByStudent: (studentID) =>
        gatewayApi.get(`/students/${studentID}/modules`).then((res) => res.data),
    getModulesWithRequestsByProfessor: (profId) =>
        gatewayApi.get(`/modules/${profId}`).then((res) => res.data),
};
