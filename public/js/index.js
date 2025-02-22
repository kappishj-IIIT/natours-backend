/* eslint-disable */
import '@babel/polyfill';
import { displayMap } from './mapbox';
import { login, logout } from './login';
import { updateSettings } from './updateSettings';
import {bookTour} from "./stripe"

// DOM ELEMENTS
const mapBox = document.getElementById('map');
const loginForm = document.querySelector('.form--login');
const userDataForm = document.querySelector('.form-user-data');
const userPasswordForm = document.querySelector('.form-user-password');
const bookBtn=document.getElementById('book-tour')
// Enhanced logout button handling
const initLogoutButton = () => {
  const logOutBtn = document.querySelector('.nav__el--logout');
  if (logOutBtn) {
    console.log('Logout button found, adding listener');
    logOutBtn.addEventListener('click', (e) => {
      e.preventDefault();
      console.log('Logout clicked');
      logout();
    });
  }
};

// Initialize all event listeners
const initializeEventListeners = () => {
  // Initialize logout button
  initLogoutButton();

  // Handle map if present
  if (mapBox) {
    const locations = JSON.parse(mapBox.dataset.locations);
    displayMap(locations);
  }

  // Handle login form
  if (loginForm) {
    loginForm.addEventListener('submit', async e => {
      e.preventDefault();
      const email = document.getElementById('email').value;
      const password = document.getElementById('password').value;
      console.log('Login attempt for:', email);
       login(email, password);
    });
  }

  // Handle user data form
  if (userDataForm) {
    userDataForm.addEventListener('submit', async e => {
      e.preventDefault();
      const form=new FormData()
      form.append('name',document.getElementById('name').value)
      form.append('email',document.getElementById('email').value)
      form.append('photo',document.getElementById('photo').files[0])

      console.log(form)
      await updateSettings(form ,'data');
    });
  }

  // Handle password form
  if (userPasswordForm) {
    userPasswordForm.addEventListener('submit', async e => {
      e.preventDefault();
      document.querySelector('.btn--save-password').textContent = 'Updating...';

      const passwordCurrent = document.getElementById('password-current').value;
      const password = document.getElementById('password').value;
      const passwordConfirm = document.getElementById('password-confirm').value;
      console.log(password,passwordCurrent)
      
      await updateSettings(
        { passwordCurrent, password, passwordConfirm },
        'password'
      );

      // Reset form
      document.querySelector('.btn--save-password').textContent = 'Save password';
      document.getElementById('password-current').value = '';
      document.getElementById('password').value = '';
      document.getElementById('password-confirm').value = '';
    });
  }
};

// Initialize everything when DOM is ready
document.addEventListener('DOMContentLoaded', initializeEventListeners);

// Re-initialize when content updates (for single-page apps)
if (window.MutationObserver) {
  const observer = new MutationObserver((mutations) => {
    if (mutations.some(mutation => mutation.addedNodes.length > 0)) {
      initLogoutButton();
    }
  });

  observer.observe(document.body, { childList: true, subtree: true });
}

if(bookBtn)
{

  bookBtn.addEventListener('click',e=>{
    e.target.textContent='Processing...'
    const tourId=e.target.dataset.tourId
    bookTour(tourId)
  })
}