
import { newGUID } from './guid.js';

export const UPDATE_REFRESH_INTERVAL = 30;

export const bind = function (context, fn, uid) {
  // Make sure the function has a unique ID
  if (!fn.guid) {
    fn.guid = newGUID();
  }

  // Create the new function that changes the context
  const bound = fn.bind(context);

  // Allow for the ability to individualize this function
  // Needed in the case where multiple objects might share the same prototype
  // IF both items add an event listener with the same function, then you try to remove just one
  // it will remove both because they both have the same guid.
  // when using this, you need to use the bind method when you remove the listener as well.
  // currently used in text tracks
  bound.guid = (uid) ? uid + '_' + fn.guid : fn.guid;

  return bound;
}

export const throttle = function(fn, wait) {
  let last = window.performance.now();

  const throttled = function(...args) {
    const now = window.performance.now();

    if (now - last >= wait) {
      fn(...args);
      last = now;
    }
  };

  return throttled;
};

export const debounce = function(func, wait, immediate, context = window) {
  let timeout;

  const cancel = () => {
    context.clearTimeout(timeout);
    timeout = null;
  };

  /* eslint-disable consistent-this */
  const debounced = function() {
    const self = this;
    const args = arguments;

    let later = function() {
      timeout = null;
      later = null;
      if (!immediate) {
        func.apply(self, args);
      }
    };

    if (!timeout && immediate) {
      func.apply(self, args);
    }

    context.clearTimeout(timeout);
    timeout = context.setTimeout(later, wait);
  };
  /* eslint-enable consistent-this */

  debounced.cancel = cancel;

  return debounced;
};
