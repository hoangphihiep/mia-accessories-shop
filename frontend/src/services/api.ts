import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Thêm token vào mỗi request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token') || sessionStorage.getItem('token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Xử lý lỗi toàn cục (Global Error Handling) và Refresh Token
let isRefreshing = false;
let failedQueue: any[] = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response) {
      const isAuthUrl = originalRequest.url?.includes('/auth/login') || originalRequest.url?.includes('/auth/register');
      
      if (error.response.status === 401 && !isAuthUrl && !originalRequest._retry) {
        if (isRefreshing) {
          return new Promise(function(resolve, reject) {
            failedQueue.push({ resolve, reject });
          }).then(token => {
            originalRequest.headers.Authorization = 'Bearer ' + token;
            return api(originalRequest);
          }).catch(err => {
            return Promise.reject(err);
          });
        }

        originalRequest._retry = true;
        isRefreshing = true;

        const refreshToken = localStorage.getItem('refreshToken') || sessionStorage.getItem('refreshToken');
        
        if (!refreshToken) {
          isRefreshing = false;
          handleLogout();
          return Promise.reject(error);
        }

        try {
          const { data } = await axios.post(`${api.defaults.baseURL}/auth/refresh`, { token: refreshToken });
          
          const storage = localStorage.getItem('refreshToken') ? localStorage : sessionStorage;
          storage.setItem('token', data.token);
          storage.setItem('refreshToken', data.refreshToken);
          
          api.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
          originalRequest.headers.Authorization = `Bearer ${data.token}`;
          
          processQueue(null, data.token);
          return api(originalRequest);
        } catch (err) {
          processQueue(err, null);
          handleLogout();
          return Promise.reject(err);
        } finally {
          isRefreshing = false;
        }
      } else if (error.response.status === 403 && !isAuthUrl) {
         handleLogout();
      }
    }
    return Promise.reject(error);
  }
);

function handleLogout() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  localStorage.removeItem('refreshToken');
  sessionStorage.removeItem('token');
  sessionStorage.removeItem('user');
  sessionStorage.removeItem('refreshToken');
  
  if (window.location.pathname !== '/login') {
    window.location.href = '/login';
  }
}

export default api;
