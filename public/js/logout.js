import { showAlert } from './alert.js';

const logOutBtn = document.querySelector('.nav__el--logout');

const logout = async () => {
  try {
    console.log('sending request');
    const res = await axios({
      method: 'GET',
      url: '/api/v1/users/logout',
    });
    if ((res.data.status = 'success')) location.reload(true);
    //console.log('success');
    // console.log(res.data);
  } catch (err) {
    //console.log('found error');
    showAlert('error', 'Error logging out! Try again.');
  }
};

if (logOutBtn) {
  logOutBtn.addEventListener('click', logout);
}
