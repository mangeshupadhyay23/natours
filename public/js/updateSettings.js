import { showAlert } from './alert.js';

const userDataForm = document.querySelector('.form-user-data');
const userPasswordForm = document.querySelector('.form-user-password');
// Type is either 'password' or 'data';

export const updateSettings = async (data, type) => {
  try {
    const res = await axios({
      method: 'PATCH',
      url:
        type === 'data'
          ? 'http://localhost:3000/api/v1/users/updateME'
          : 'http://localhost:3000/api/v1/users/updateMyPassword',
      data,
    });

    if (res.data.status === 'success' || res.data.status === 'Success') {
      showAlert('success', `User ${type} updated successfully`);
      window.setTimeout(() => {
        location.assign('/me');
      }, 1500);
    }
  } catch (err) {
    showAlert('error', err.response.data.message);
  }
};

if (userDataForm) {
  userDataForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    document.querySelector('.btn--save-userData').textContent = 'Updating...';
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    await updateSettings({ name, email }, 'data');
    document.querySelector('.btn--save-userData').textContent = 'SAVE SETTINGS';
  });
}
if (userPasswordForm) {
  userPasswordForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    document.querySelector('.btn--save-password').textContent = 'Updating...';
    const passwordCurrent = document.getElementById('password-current').value;
    const password = document.getElementById('password').value;
    const passwordConfirm = document.getElementById('password-confirm').value;
    await updateSettings(
      { passwordCurrent, password, passwordConfirm },
      'password'
    );
    document.querySelector('.btn--save-password').textContent = 'SAVE PASSWORD';
  });
}
