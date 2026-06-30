/* =============================================================
   app.js
   This is the "brain" of the app. It does four things:

   1. Listens for the "Find My Vada Pav" button tap.
   2. Asks the phone for the user's GPS location.
   3. Searches OpenStreetMap (a free, no-API-key-needed map
      database) for nearby vada pav / vada pav-ish food spots.
   4. Shows the closest one, with a button that opens the
      phone's normal navigation app for walking directions.

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

/* This will remember the winning shop's coordinates so the
   "Get Directions" button knows where to send the user. */
let winningShop = null;

/* This timer rotates the joke text while we're loading. */
let jokeRotationTimer = null;

/* ---------- 2. Simple helper: switch which screen is visible ---------- */
function showScreen(screenToShow) {
  [screenStart, screenLoading, screenResult, screenError].forEach((screen) => {
    screen.hidden = (screen !== screenToShow);
  });
}

/* ---------- 3. Helper: turn meters into a friendly distance string ---------- */
function formatDistance(meters) {
  if (meters < 1000) {
    return `${Math.round(meters)} m`;
  }
  return `${(meters / 1000).toFixed(1)} km`;
}

/* ---------- 4. Helper: estimate walking time ---------- */
/* Average walking speed is roughly 80 metres per minute.
   This is a friendly estimate, not GPS-grade routing. */
function estimateWalkMinutes(meters) {
  const minutes = Math.round(meters / 80);
  return Math.max(1, minutes); // never show "0 min"
}

/* ---------- 5. Helper: distance between two GPS points ---------- */
/* This is the "Haversine formula" — a standard maths formula
   for measuring distance between two points on a sphere (Earth).
   You don't need to understand the maths, just trust it works! */
function distanceInMeters(lat1, lon1, lat2, lon2) {
  const R = 6371000; // Earth's radius in metres
  const toRad = (deg) => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/* ---------- 6. Joke rotation while loading ---------- */
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

/* ---------- 7. The main search flow ---------- */
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
    (position) => {
      const { latitude, longitude } = position.coords;
      searchNearbyShops(latitude, longitude);
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

/* ---------- 8. Search OpenStreetMap for nearby food spots ---------- */
/* We use the free "Overpass API" — a public database of real-world
   places (shops, restaurants, stalls) built from OpenStreetMap.
   No API key or account is required to use it. */
function searchNearbyShops(lat, lon) {
  const radiusMeters = 2000; // search within 2 km

  // This query asks Overpass for: any place tagged as a fast food
  // stall, restaurant, or food cart whose name mentions "vada pav"
  // or "vada", OR any general fast-food/snack place nearby as a
  // fallback if nothing specific is found.
  const query = `
    [out:json][timeout:15];
    (
      node(around:${radiusMeters},${lat},${lon})["name"~"vada", i];
      way(around:${radiusMeters},${lat},${lon})["name"~"vada", i];
      node(around:${radiusMeters},${lat},${lon})["amenity"="fast_food"];
      node(around:${radiusMeters},${lat},${lon})["amenity"="restaurant"]["cuisine"~"indian|street_food|snack", i];
    );
    out center;
  `;

  const url = 'https://overpass-api.de/api/interpreter?data=' + encodeURIComponent(query);

  fetch(url)
    .then((response) => {
      if (!response.ok) throw new Error('Network response was not OK');
      return response.json();
    })
    .then((data) => {
      processShopResults(data, lat, lon);
    })
    .catch(() => {
      stopJokeRotation();
      showError(
        'Could not reach the map service.',
        'Check your internet connection and try again. Even potatoes need WiFi sometimes.'
      );
    });
}

/* ---------- 9. Process raw search results into a clean shop list ---------- */
function processShopResults(data, userLat, userLon) {
  const elements = data.elements || [];

  // Turn raw map data into a simple, clean list of shops with
  // a name, coordinates, and distance from the user.
  let shops = elements
    .map((el) => {
      const lat = el.lat || (el.center && el.center.lat);
      const lon = el.lon || (el.center && el.center.lon);
      if (!lat || !lon) return null;

      const name = (el.tags && el.tags.name) || 'Unnamed Vada Pav Stall';
      const dist = distanceInMeters(userLat, userLon, lat, lon);

      return { name, lat, lon, distance: dist, tags: el.tags || {} };
    })
    .filter(Boolean);

  // Prefer results whose name actually mentions "vada" — these are
  // the real deal. If we find at least one, use only those.
  const vadaSpecific = shops.filter((s) => /vada/i.test(s.name));
  if (vadaSpecific.length > 0) {
    shops = vadaSpecific;
  }

  // Sort by distance, closest first.
  shops.sort((a, b) => a.distance - b.distance);

  // Remove obvious duplicates (same name within 30m of each other)
  const deduped = [];
  shops.forEach((shop) => {
    const isDupe = deduped.some(
      (d) => d.name === shop.name && Math.abs(d.distance - shop.distance) < 30
    );
    if (!isDupe) deduped.push(shop);
  });

  stopJokeRotation();

  if (deduped.length === 0) {
    showError(
      'No vada pav found nearby.',
      "We searched a 2 km radius and came up empty. Dad's snack emergency may require a road trip. Try again, or move to a denser area and search again."
    );
    return;
  }

  showResults(deduped.slice(0, 6)); // winner + up to 5 runner-ups
}

/* ---------- 10. Display the results screen ---------- */
function showResults(shops) {
  const winner = shops[0];
  winningShop = winner;

  resultNameEl.textContent = winner.name;
  resultDistanceEl.textContent = formatDistance(winner.distance);
  resultTimeEl.textContent = `${estimateWalkMinutes(winner.distance)} min`;

  const addressParts = [];
  if (winner.tags['addr:street']) addressParts.push(winner.tags['addr:street']);
  if (winner.tags['addr:suburb']) addressParts.push(winner.tags['addr:suburb']);
  resultAddressEl.textContent =
    addressParts.length > 0
      ? addressParts.join(', ')
      : 'Exact address unavailable — directions will guide you there.';

  // Build the "also nearby" list (everything except the winner)
  const rest = shops.slice(1);
  otherListEl.innerHTML = '';

  if (rest.length === 0) {
    othersWrapEl.hidden = true;
  } else {
    othersWrapEl.hidden = false;
    rest.forEach((shop) => {
      const card = document.createElement('div');
      card.className = 'other-card';

      const info = document.createElement('div');
      const nameEl = document.createElement('p');
      nameEl.className = 'other-card-name';
      nameEl.textContent = shop.name;
      const distEl = document.createElement('p');
      distEl.className = 'other-card-dist';
      distEl.textContent = `${formatDistance(shop.distance)} away`;
      info.appendChild(nameEl);
      info.appendChild(distEl);

      const goBtn = document.createElement('button');
      goBtn.className = 'other-card-go';
      goBtn.textContent = 'Go';
      goBtn.addEventListener('click', () => openDirections(shop));

      card.appendChild(info);
      card.appendChild(goBtn);
      otherListEl.appendChild(card);
    });
  }

  showScreen(screenResult);
}

/* ---------- 11. Open the phone's navigation app ---------- */
function openDirections(shop) {
  const target = shop || winningShop;
  if (!target) return;
  // This universal Google Maps link works on Android, iPhone,
  // and desktop — it opens the Maps app if installed, or the
  // website if not.
  const url = `https://www.google.com/maps/dir/?api=1&destination=${target.lat},${target.lon}&travelmode=walking`;
  window.open(url, '_blank');
}

/* ---------- 12. Error screen helper ---------- */
function showError(title, body) {
  errorTitleEl.textContent = title;
  errorBodyEl.textContent = body;
  showScreen(screenError);
}

/* ---------- 13. Wire up all the buttons ---------- */
btnFind.addEventListener('click', findVadaPav);
btnRetry.addEventListener('click', findVadaPav);
btnErrorRetry.addEventListener('click', findVadaPav);
btnDirections.addEventListener('click', () => openDirections(winningShop));

/* ---------- 14. Register the Service Worker (makes the app installable) ---------- */
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
