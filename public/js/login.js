// login.js
import axios from 'axios';
import { showAlert } from './alerts';

export const login = async (email, password) => {
  try {
    console.log('Login attempt:', email);
    
    const res = await axios({
      method: 'POST',
      url: 'http://127.0.0.1:3000/api/v1/users/login',
      data: {
        email,
        password
      },
     
    });

    if (res.data.status === 'success') {
      showAlert('success', 'Logged in successfully!');
      window.setTimeout(() => {
        location.assign('/');
      }, 1500);
    }
  } catch (err) {
    showAlert('error', err.response?.data?.message || 'Error logging in');
  }
};

export const logout = async () => {
  try {
    console.log('Initiating logout...');
    
    const res = await axios({
      method: 'GET',
      url: 'http://127.0.0.1:3000/api/v1/users/logout',
      
       // Important for handling cookies
    });

    console.log('Logout response:', res.data);

    if (res.data.status === 'success') {
      console.log('Logout successful, reloading page...');
      // Using location.assign instead of reload for more reliable redirect
      location.assign('/');
    }
  } catch (err) {
    console.error('Logout error:', err);
    showAlert('error', 'Error logging out! Try again.');
  }
};