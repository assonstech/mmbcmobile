import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import { navigate } from "../common/NavigationService"
import Screen from '../utils/Screen';

// const BASE_URL = Platform.OS === 'android'
//   ? 'http://10.0.2.2:3000/api'
//   : 'http://localhost:3000/api';

// const BASE_Image_URL = Platform.OS === 'android'
//   ? 'http://10.0.2.2:3000'
//   : 'http://localhost:3000';

// const BASE_URL = 'https://assonstech-001-site2.ktempurl.com/api'

// const BASE_Image_URL = 'https://assonstech-001-site2.ktempurl.com'

const BASE_URL = 'http://assonstech-001-site6.ktempurl.com/api'
const BASE_Image_URL = 'http://assonstech-001-site6.ktempurl.com/'


const ACCESS_TOKEN_KEY = 'ACCESS_TOKEN';
const IS_DEFAULT_PASSWORD_KEY = 'IS_DEFAULT_PASSWORD'; // ✅ NEW KEY

const TIMEOUT = 15000;

export const getFullImageUrl = (relativePath) => {
  if (!relativePath) return null;
  if (relativePath.startsWith('http://') || relativePath.startsWith('https://')) {
    return relativePath;
  }

  const cleanPath = relativePath.startsWith('/')
    ? relativePath.slice(1)
    : relativePath;

  if (cleanPath.startsWith('uploads/')) {
    return `${BASE_Image_URL}${cleanPath}`;
  }

  return `${BASE_Image_URL}uploads/${cleanPath}`;
};

const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: TIMEOUT,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
});

export const formattedPrice = (amount) => new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
}).format(amount).replace('$', '');



// Attach access token to requests
apiClient.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem(ACCESS_TOKEN_KEY);
      console.log("token:", token);
      if (token) config.headers.Authorization = `Bearer ${token}`;
    } catch (e) { }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for 401
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.message === "Network Error") {
      navigate(Screen.NetworkError);
    }
    if (error.response?.status === 401) {
      await AsyncStorage.removeItem(ACCESS_TOKEN_KEY);
      navigate(Screen.Welcome);
    }
    return Promise.reject(error);
  }
);

// HTTP methods using API's default response
const get = async (url, params = {}, config = {}) => {
  try {
    const res = await apiClient.get(url, { params, ...config });
    return res.data; // { success, message, data }
  } catch (err) {
    return {
      success: false,
      message: err.response?.data?.message || err.message,
      code: err.response?.status,
      url: `${apiClient.defaults.baseURL}${url}`,
      data: err.response?.data || null,
    };
  }
};

const post = async (url, body = {}, config = {}) => {
  try {
    const res = await apiClient.post(url, body, config);
    return res.data;
  } catch (err) {
    return { success: false, message: err.message, data: null };
  }
};

const put = async (url, body = {}, config = {}) => {
  try {
    const res = await apiClient.put(url, body, config);
    return res.data;
  } catch (err) {
    return { success: false, message: err.message, data: null };
  }
};

const del = async (url, config = {}) => {
  try {
    const res = await apiClient.delete(url, config);
    return res.data;
  } catch (err) {
    return { success: false, message: err.message, data: null };
  }
};

const upload = async (url, formData, onUploadProgress = () => { }, config = {}) => {
  try {
    const res = await apiClient.post(url, formData, {
      ...config,
      headers: { 'Content-Type': 'multipart/form-data', ...(config.headers || {}) },
      onUploadProgress: (progressEvent) => {
        const { loaded, total } = progressEvent;
        const percent = total ? Math.round((loaded * 100) / total) : 0;
        onUploadProgress({ loaded, total, percent });
      },
    });
    return res.data;
  } catch (err) {
    return { success: false, message: err.message, data: null };
  }
};

// Token helpers
const setAccessToken = async (token) => {
  await AsyncStorage.setItem(ACCESS_TOKEN_KEY, token);
  apiClient.defaults.headers.common.Authorization = token ? `Bearer ${token}` : undefined;
};

const getAccessToken = async () => {
  return AsyncStorage.getItem(ACCESS_TOKEN_KEY);
};

const removeAccessToken = async () => {
  await AsyncStorage.removeItem(ACCESS_TOKEN_KEY);
  delete apiClient.defaults.headers.common.Authorization;
};

const setIsDefaultPassword = async (value) => {
  await AsyncStorage.setItem(IS_DEFAULT_PASSWORD_KEY, value ? "true" : "false");
};

// ✅ Retrieve as a boolean
const getIsDefaultPassword = async () => {
  const val = await AsyncStorage.getItem(IS_DEFAULT_PASSWORD_KEY);
  return val === 'true';
};

// ✅ Remove it (optional)
const removeIsDefaultPassword = async () => {
  await AsyncStorage.removeItem(IS_DEFAULT_PASSWORD_KEY);
};

export default {
  apiClient,
  get,
  post,
  put,
  delete: del,
  upload,
  setAccessToken,
  getAccessToken,
  removeAccessToken,
  setIsDefaultPassword,
  removeIsDefaultPassword,
  getIsDefaultPassword,
};
