/* =============================================================
   app.js
   This is the "brain" of the app. It does four things:

   1. Listens for the "Find My Vada Pav" button tap.
   2. Asks the phone for the user's GPS location.
   3. Plays the loading animation with rotating dad jokes.
   4. Shows the result card, with a button that opens Google
      Maps search for vada pav near the user.

   Every section below has comments explaining what it does,
   written for someone who has never coded before.
   ============================================================= */

/* ---------- 1. Grab references to all the HTML elements ---------- */
/* "document.getElementById" just means: "find the element in
   index.html that has this id, and let me control it from here." */

const screenStart = document.getElementById('screen-start');
const screenLoading = document.getElementById('screen-loading');
const screenResult = document.getElementById('screen-result');
const screenError = document.getElementById('screen-error');

const btnFind = document.getElementById('btn-find');
const btnRetry = document.getElementById('btn-retry');
const btnErrorRetry = document.getElementById('btn-error-retry');
const btnDirections = document.getElementById('btn-directions');

const loadingMessageEl = document.getElementById('loading-message');
const loadingBarEl = document.getElementById('loading-bar');

const resultNameEl = document.getElementById('result-name');
const resultDistanceEl = document.getElementById('result-distance');
const resultTimeEl = document.getElementById('result-time');
const resultAddressEl = document.getElementById('result-address');
const otherListEl = document.getElementById('other-list');
const othersWrapEl = document.getElementById('others-wrap');

const errorTitleEl = document.getElementById('error-title');
const errorBodyEl = document.getElementById('error-body');

/* The Google Maps search link we open from the result screen.
   No API key, no backend, no coordinates needed. */
const MAPS_SEARCH_URL = 'https://www.google.com/maps/search/?api=1&query=vada+pav+near+me';

/* This timer rotates the joke text while we're loading. */
let jokeRotationTimer = null;

/* This timer fires once the loading animation should finish. */
let loadingFinishTimer = null;

/* ---------- 2. Simple helper: switch which screen is visible ---------- */
function showScreen(screenToShow) {
  [screenStart, screenLoading, screenResult, screenError].forEach((screen) => {
    screen.hidden = (screen !== screenToShow);
  });
}

/* ---------- 3. Joke rotation while loading ---------- */
function startJokeRotation() {
  let progress = 0;
  loadingMessageEl.textContent = getRandomJoke();
  loadingBarEl.style.width = '8%';

  jokeRotationTimer = setInterval(() => {
    progress = Math.min(progress + 18, 92);
    loadingBarEl.style.width = `${progress}%`;

    loadingMessageEl.style.opacity = '0';
    setTimeout(() => {
      loadingMessageEl.textContent = getRandomJoke();
      loadingMessageEl.style.opacity = '1';
    }, 200);
  }, 1400);
}

function stopJokeRotation() {
  if (jokeRotationTimer) {
    clearInterval(jokeRotationTimer);
    jokeRotationTimer = null;
  }
  loadingBarEl.style.width = '100%';
}

/* ---------- 4. The main flow ---------- */
function findVadaPav() {
  showScreen(screenLoading);
  startJokeRotation();

  if (!('geolocation' in navigator)) {
    showError(
      "Your device won't share its location.",
      'This app needs GPS access to find nearby vada pav shops. Please use a phone or browser that supports location services.'
    );
    return;
  }

  navigator.geolocation.getCurrentPosition(
    () => {
      // We don't need the coordinates for anything — we just
      // needed permission. Let the loading animation play out,
      // then show the result card.
      finishLoadingThenShowResult();
    },
    (geoError) => {
      handleGeoError(geoError);
    },
    {
      enableHighAccuracy: true,
      timeout: 12000,
      maximumAge: 60000,
    }
  );
}

function handleGeoError(geoError) {
  stopJokeRotation();
  if (geoError.code === geoError.PERMISSION_DENIED) {
    showError(
      'Location access denied.',
      "We can't find the nearest vada pav without knowing where you are. Please allow location access in your browser settings and try again."
    );
  } else if (geoError.code === geoError.TIMEOUT) {
    showError(
      'Location is taking too long.',
      'Your GPS signal might be weak. Try moving near a window or outdoors, then try again.'
    );
  } else {
    showError(
      'Could not get your location.',
      'Something went wrong while finding where you are. Please check your device settings and try again.'
    );
  }
}

/* ---------- 5. Let the loading animation play out, then show the result ---------- */
/* No searching, no API calls — just a short, pleasant pause so the
   loading animation and dad jokes get to do their thing. */
function finishLoadingThenShowResult() {
  if (loadingFinishTimer) {
    clearTimeout(loadingFinishTimer);
  }
  loadingFinishTimer = setTimeout(() => {
    stopJokeRotation();
    showResult();
  }, 4200);
}

/* ---------- 6. Display the result screen ---------- */
function showResult() {
  resultNameEl.textContent = 'Mission Successful! 🎉';
  resultDistanceEl.textContent = 'Nearby';
  resultTimeEl.textContent = "Let's Go!";
  resultAddressEl.textContent = 'Tap below to find the nearest vada pav using Google Maps.';

  // No runner-up shops anymore — hide that section completely.
  otherListEl.innerHTML = '';
  othersWrapEl.hidden = true;

  showScreen(screenResult);
}

/* ---------- 7. Open Google Maps search ---------- */
function openDirections() {
  // Always opens a plain Google Maps search for vada pav near
  // the user — no coordinates, no API, no backend involved.
  window.open(MAPS_SEARCH_URL, '_blank');
}

/* ---------- 8. Error screen helper ---------- */
function showError(title, body) {
  errorTitleEl.textContent = title;
  errorBodyEl.textContent = body;
  showScreen(screenError);
}

/* ---------- 9. Wire up all the buttons ---------- */
btnFind.addEventListener('click', findVadaPav);
btnRetry.addEventListener('click', findVadaPav);
btnErrorRetry.addEventListener('click', findVadaPav);
btnDirections.addEventListener('click', openDirections);

/* ---------- 10. Register the Service Worker (makes the app installable) ---------- */
/* This is what allows the app to work offline and be "installed"
   on a phone's home screen like a real app. */
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('sw.js').catch(() => {
      // If this fails (e.g. running from file:// during testing),
      // the app still works fine, it just won't be installable yet.
    });
  });
}
