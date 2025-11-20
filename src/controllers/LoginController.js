// controllers/LoginController.js
import http from '../common/HttpSerivce';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ACCESS_TOKEN_KEY = 'ACCESS_TOKEN';

export async function login(email, password) {
  try {
    if (!email || !password) {
      return { success: false, message: 'Email and password are required', data: null };
    }

    // Remove old token
    await http.removeAccessToken();

    // Call API
    const res = await http.post('/member/login', { email, password });

    if (res.success) {
      return res
    } else {
      return { success: false, message: res.message || 'Login failed', data: null };
    }
  } catch (err) {
    console.error('Login error:', err);
    return { success: false, message: 'Something went wrong', data: null };
  }
}

/**
 * Optional: check if user is already logged in
 */
export async function checkLoggedIn() {
  try {
    const token = await AsyncStorage.getItem(ACCESS_TOKEN_KEY);
    return !!token;
  } catch (err) {
    return false;
  }
}
