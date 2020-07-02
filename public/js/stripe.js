import { showAlert } from './alert.js';

const stripe = Stripe(
  'pk_test_51GzhveLyMdjB7CThWdKlQrpWOy46jRskMx8xMXH0sPkjOmcFVUJtNTiY8vQ7HCdCeNXx87YKfeAQpcdjUkzIQvX900UzeWYZjW'
);

const bookTour = async (tourId) => {
  try {
    // STEP 1 => get checkout Session from API
    const session = await axios(`/api/v1/bookings/checkout-session/${tourId}`);
    //console.log(session);
    // STEP 2 => Create checkout form + charge from card
    await stripe.redirectToCheckout({
      sessionId: session.data.session.id,
    });
  } catch (err) {
    console.log(err);
    showAlert('error', err);
  }
};

const bookBtn = document.getElementById('book-tour');

if (bookBtn) {
  bookBtn.addEventListener('click', (e) => {
    e.target.textContent = 'Processing...';
    const tourId = e.target.dataset.tourId;
    bookTour(tourId);
  });
}
