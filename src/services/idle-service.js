// Manages when a user has gone idle
let _timeoutId;
let _idleCallback = null;
let _notIdleEvents = [
  "mousedown",
  "mousemove",
  "keypress",
  "scroll",
  "touchstart",
];
let _FIVE_MINUTES_IN_MS = 5 * 60 * 1000;

const IdleService = {
  setIdleCallback(idleCallback) {
    // store a callback when the user goes idle
    _idleCallback = idleCallback;
  },
  // called when user interacts with page
  resetIdleTimer(ev) {
    console.info("event: ", ev.type);
    // remove any timeouts
    clearTimeout(_timeoutId);
    // queue callback for another 5 minutes
    _timeoutId = setTimeout(_idleCallback, _FIVE_MINUTES_IN_MS);
  },
  registerIdleTimerResets() {
    // register the time for events when a user interacts
    _notIdleEvents.forEach((event) =>
      document.addEventListener(event, IdleService.resetIdleTimer, true)
    );
  },
  unRegisterIdleResets() {
    // remove queued callbacks and events that will queue callbacks
    clearTimeout(_timeoutId);
    _notIdleEvents.forEach((event) =>
      document.removeEventListener(event, IdleService.resetIdleTimer, true)
    );
  },
};

export default IdleService;
