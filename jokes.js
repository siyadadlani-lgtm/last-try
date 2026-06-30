/* =============================================================
   jokes.js
   This file is just a big LIST of terrible dad jokes and silly
   status messages. It has no logic in it — it only stores data.
   app.js will pick a random one of these to show while loading.

   Want to add your own joke later? Just add a new line inside
   the square brackets below, with a comma after it. That's it!
   ============================================================= */

const DAD_JOKES = [
  "Vada you waiting for?",
  "This is a starch emergency.",
  "The potato council has approved your route.",
  "Pav and order has been restored.",
  "We are operating at maximum carbacity.",
  "Warning: deliciousness detected nearby.",
  "Hold on, mashing the data together.",
  "Calculating the shortest distance to happiness.",
  "Pav-ering up the GPS satellites.",
  "This search has been deep-fried for extra flavour.",
  "Locating the nearest source of joy (it's fried).",
  "Patience, young padawan. Good things come to those who wait. So do vada pavs.",
  "Aloo there! Just a moment.",
  "Don't worry, we relish this kind of mission.",
  "Spice levels: currently being calibrated.",
  "Our satellites are powered by ghee.",
  "We knead a moment to find your match.",
  "Crust me, this will be worth it.",
  "Bun voyage! Sending you to the nearest shop.",
  "Mapping out a route that's positively crispy.",
  "Hang tight — we're on a roll.",
  "This app runs on dad jokes and potato starch.",
  "Finding your perfect pav-tner.",
  "Whisking up your location data.",
  "We're frying to find the best one for you.",
  "Hot take: vada pav fixes everything.",
  "Currently consulting the Department of Snacks.",
  "Pavlov's dog would be proud of this loading screen.",
  "Loading... unlike your patience, this won't run out.",
  "We've got 99 problems but a pav ain't one.",
  "Searching high and low, mostly low, for fried potatoes.",
  "Insert pun here. We're still working on it, like this search.",
  "Your hunger has been officially logged as urgent.",
  "Locating the chutney of your dreams.",
  "We promise this is faster than waiting for Dad to find his glasses.",
  "Running on mustard-powered engines.",
  "Initiating Operation: Feed Dad.",
  "Pls hold, potatoes are being peer-reviewed.",
  "This is not a drill. This is a vada pav drill.",
  "Scanning the neighbourhood for crunch potential.",
  "One small step for man, one giant leap for vada pav-kind.",
  "Pavsitively working on it.",
  "Your snack is currently in transit through the universe.",
  "We're un-frying our brains to compute this route.",
  "Quick! The chutney is getting impatient.",
  "Assembling the Avengers of Indian street food.",
  "Sir, this is a Vada Pav Locator, not a Wendy's.",
  "Just buttering up the server for you.",
  "Locating the bun that started it all.",
  "Triangulating using onions, garlic, and pure vibes.",
  "Our algorithm runs purely on green chutney.",
  "We've notified the potatoes of your incoming arrival.",
  "Don't quote us, but this might be the best decision today.",
  "Currently negotiating with the nearest frying pan.",
  "This loading bar is hungrier than you are.",
  "Pro tip: vada pavs taste better when found quickly. We're trying.",
  "We solemnly swear this search is up to good.",
  "Powered by 100% recycled dad jokes.",
  "Plot twist: the real treasure was the vada pav all along.",
];

/* =============================================================
   Tiny helper: pick a random joke from the list above.
   Used by app.js whenever it needs a fresh laugh.
   ============================================================= */
function getRandomJoke() {
  const index = Math.floor(Math.random() * DAD_JOKES.length);
  return DAD_JOKES[index];
}
