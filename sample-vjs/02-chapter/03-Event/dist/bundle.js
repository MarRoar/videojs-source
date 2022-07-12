'use strict';

/**
 * GUIDs 
 */

const _initialGuid = 3;

let _guid = _initialGuid;

function newGUID() {
  return _guid++;
}

let FakeWeakMap;

if (window.WeakMap) {
  FakeWeakMap = class {
    constructor() {
      this.vdata = 'vdata' + Math.floor(window.performance && window.performance.now() || Date.now());
      this.data = {};
    }

    set(key, value) {
      const access = key[this.vdata] || newGUID();

      if(!key[this.vdata]) {
         key[this.vdata] = access;
      }

      this.data[access] = value;

      return this;
    }

    get(key) {
      const access = key[this.vdata];

      if (access) {
        return this.data[access];
      }

      return undefined;
    }

    has(key) {
      const access = key[this.vdata];

      return access in this.data;
    }

    delete(key) {
      const access = key[this.vdata];

      if(access) {
         delete this.data[access];
         delete key[this.vdata];
      }
    }

  };
}

var DomData = window.WeakMap ? new WeakMap() : new FakeWeakMap();

// 循环遍历事件类型数组，并为每种类型调用请求的方法。
function _handleMultipleEvents(fn, elem, types, callback) {
  types.forEach(function(type) {
    // Call the event method for each one of the types
    fn(elem, type, callback);
  });
}


/**
 * Whether passive event listeners are supported
 */
let _supportsPassive = false;

(function() {
  try {
    const opts = Object.defineProperty({}, 'passive', {
      get() {
        _supportsPassive = true;
      }
    });

    window.addEventListener('test', null, opts);
    window.removeEventListener('test', null, opts);
  } catch (e) {
    // disregard
  }
})();


function fixEvent(event) {

  function returnTrue() {
    return true;
  }

  function returnFalse() {
    return false;
  }

  // Test if fixing up is needed
  // Used to check if !event.stopPropagation instead of isPropagationStopped
  // But native events return true for stopPropagation, but don't have
  // other expected methods like isPropagationStopped. Seems to be a problem
  // with the Javascript Ninja code. So we're just overriding all events now.
  if (!event || !event.isPropagationStopped) {
    const old = event || window.event;

    event = {};
    // Clone the old object so that we can modify the values event = {};
    // IE8 Doesn't like when you mess with native event properties
    // Firefox returns false for event.hasOwnProperty('type') and other props
    //  which makes copying more difficult.
    // TODO: Probably best to create a whitelist of event props
    for (const key in old) {
      // Safari 6.0.3 warns you if you try to copy deprecated layerX/Y
      // Chrome warns you if you try to copy deprecated keyboardEvent.keyLocation
      // and webkitMovementX/Y
      if (key !== 'layerX' && key !== 'layerY' && key !== 'keyLocation' &&
          key !== 'webkitMovementX' && key !== 'webkitMovementY') {
        // Chrome 32+ warns if you try to copy deprecated returnValue, but
        // we still want to if preventDefault isn't supported (IE8).
        if (!(key === 'returnValue' && old.preventDefault)) {
          event[key] = old[key];
        }
      }
    }

    // The event occurred on this element
    if (!event.target) {
      event.target = event.srcElement || document;
    }

    // Handle which other element the event is related to
    if (!event.relatedTarget) {
      event.relatedTarget = event.fromElement === event.target ?
        event.toElement :
        event.fromElement;
    }

    // Stop the default browser action
    event.preventDefault = function() {
      if (old.preventDefault) {
        old.preventDefault();
      }
      event.returnValue = false;
      old.returnValue = false;
      event.defaultPrevented = true;
    };

    event.defaultPrevented = false;

    // Stop the event from bubbling
    event.stopPropagation = function() {
      if (old.stopPropagation) {
        old.stopPropagation();
      }
      event.cancelBubble = true;
      old.cancelBubble = true;
      event.isPropagationStopped = returnTrue;
    };

    event.isPropagationStopped = returnFalse;

    // Stop the event from bubbling and executing other handlers
    event.stopImmediatePropagation = function() {
      if (old.stopImmediatePropagation) {
        old.stopImmediatePropagation();
      }
      event.isImmediatePropagationStopped = returnTrue;
      event.stopPropagation();
    };

    event.isImmediatePropagationStopped = returnFalse;

    // Handle mouse position
    if (event.clientX !== null && event.clientX !== undefined) {
      const doc = document.documentElement;
      const body = document.body;

      event.pageX = event.clientX +
        (doc && doc.scrollLeft || body && body.scrollLeft || 0) -
        (doc && doc.clientLeft || body && body.clientLeft || 0);
      event.pageY = event.clientY +
        (doc && doc.scrollTop || body && body.scrollTop || 0) -
        (doc && doc.clientTop || body && body.clientTop || 0);
    }

    // Handle key presses
    event.which = event.charCode || event.keyCode;

    // Fix button for mouse clicks:
    // 0 == left; 1 == middle; 2 == right
    if (event.button !== null && event.button !== undefined) {

      // The following is disabled because it does not pass videojs-standard
      // and... yikes.
      /* eslint-disable */
      event.button = (event.button & 1 ? 0 :
        (event.button & 4 ? 1 :
          (event.button & 2 ? 2 : 0)));
      /* eslint-enable */
    }
  }

  // Returns fixed-up instance
  return event;
}


const passiveEvents = [
  'touchstart',
  'touchmove'
];



/**
 * 绑定事件
 */
function on(elem, type, fn) {
  console.log(" events = ", elem, type, fn);

  // 如果type 是数组的话，就循环遍历 on 事件
  if (Array.isArray(type)) {
    return _handleMultipleEvents(on, elem, type, fn);
  }

  if (!DomData.has(elem)) {
    DomData.set(elem, {});
  }

  const data = DomData.get(elem);

  // hanlders 用来存储
  if(!data.handlers) {
    data.handlers = {};
  }

  if(!data.handlers[type]) {
    data.handlers[type] = [];
  }

  if(!fn.guid) {
    fn.guid = newGUID();
  }

  // 根据事件的类型，存到数组里
  data.handlers[type].push(fn);

  console.log("data.dispatcher =  ~~ ", data.dispatcher);

  // 是否有 dispatcher 函数
  if (!data.dispatcher) {
    data.disabled = false;

    data.dispatcher = function(event, hash) {
      
      if (data.disabled) {
        return;
      }

      // 兼容处理 event 事件
      event = fixEvent(event);
      
      const handlers = data.handlers[event.type];
      if (handlers) {
        const handlersCopy = handlers.slice(0);

        for (let m = 0, n = handlersCopy.length; m < n; m++) {
          if (event.isImmediatePropagationStopped()) {
            break;
          } else {
            try {
              handlersCopy[m].call(elem, event, hash);
            } catch (e) {
              console.error('错了');
            }
          }
        }
      }
    };
  }

  if (data.handlers[type].length === 1) {
    if (elem.addEventListener) {
      let options = false;

      if (_supportsPassive && passiveEvents.indexOf(type) > -1) {
         options = {passive: true};
      }

      elem.addEventListener(type, data.dispatcher, options);
    } else if (elem.attachEvent) {
      elem.attachEvent('on' + type, data.dispatcher);
    }
  }
}

// 解绑
function off(elem, type, fn) {
  
}

// 触发
function trigger(elem, event, hash) {

  const elemData = DomData.has(elem) ? DomData.get(elem) : {};
  const parent = elem.parentNode || elem.ownerDocument;

  // 如果事件名称作为字符串传递，则会从中创建一个事件
  if (typeof event === 'string') {
    event = {type: event, target: elem};
  } else if (!event.target) {
    event.target = elem;
  }

  event = fixEvent(event);

  if (elemData.dispatcher) {
    elemData.dispatcher.call(elem, event, hash);
  
  // 如果位于DOM顶部，则触发默认操作，除非禁用。
  } else if (!parent && !event.defaultPrevented && event.target && event.target[event.type]) {
    if (!DomData.has(event.target)) {
      DomData.set(event.target, {});
    }
    const targetData = DomData.get(event.target);

    if (event.target[event.type]) {
      targetData.disabled = true;

      if (typeof event.target[event.type] === 'function') {
        event.target[event.type]();
      }

      targetData.disabled = false;
    }
  }

  return !event.defaultPrevented;
}

// 触发一次
function one(elem, type, fn) {
  
}

// 触发一次，然后关闭所有的事件配置
function any(elem, type, fn) {
  
}

var Events = /*#__PURE__*/Object.freeze({
  __proto__: null,
  fixEvent: fixEvent,
  on: on,
  off: off,
  trigger: trigger,
  one: one,
  any: any
});

const bind = function (context, fn, uid) {
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
};

/**
 * @file obj.js
 * @module obj
 */

/**
 * Get the keys of an Object
 *
 * @param {Object}
 *        The Object to get the keys from
 *
 * @return {string[]}
 *         An array of the keys from the object. Returns an empty array if the
 *         object passed in was invalid or had no keys.
 *
 * @private
 */
const keys = function(object) {
  return isObject(object) ? Object.keys(object) : [];
};

/**
 * Array-like iteration for objects.
 *
 * @param {Object} object
 *        The object to iterate over
 *
 * @param {obj:EachCallback} fn
 *        The callback function which is called for each key in the object.
 */
function each(object, fn) {
  keys(object).forEach(key => fn(object[key], key));
}

/**
 * Object.assign-style object shallow merge/extend.
 *
 * @param  {Object} target
 * @param  {Object} ...sources
 * @return {Object}
 */
function assign(target, ...sources) {
  if (Object.assign) {
    return Object.assign(target, ...sources);
  }

  sources.forEach(source => {
    if (!source) {
      return;
    }

    each(source, (value, key) => {
      target[key] = value;
    });
  });

  return target;
}

/**
 * Returns whether a value is an object of any kind - including DOM nodes,
 * arrays, regular expressions, etc. Not functions, though.
 *
 * This avoids the gotcha where using `typeof` on a `null` value
 * results in `'object'`.
 *
 * @param  {Object} value
 * @return {boolean}
 */
function isObject(value) {
  return !!value && typeof value === 'object';
}

const isEvented = (object) =>
  object instanceof EventTarget ||
  !!object.eventBusEl_ &&
  ['on', 'one', 'off', 'trigger'].every(k => typeof object[k] === 'function');

/**
 * 判断值是否是有效事件类型
 */
const isValidEventType = (type) => {
  return (typeof type === 'string' && (/\S/).test(type)) ||
         (Array.isArray(type) && !!type.length);
};

// 验证值以确定其是否为有效的事件目标。如果没有，则抛出。
const validateTarget = (target) => {
  if (!target.nodeName && !isEvented(target)) {
    throw new Error('Invalid target; must be a DOM node or evented object.');
  }
};

const validateEventType = (type) => {
  if (!isValidEventType(type)) {
    throw new Error('Invalid event type; must be a non-empty string or array.');
  }
};

const validateListener = (listener) => {
  if (typeof listener !== 'function') {
    throw new Error('Invalid listener; must be a function.');
  }
};

const normalizeListenArgs = (self, args) => {

  const isTargetingSelf = args.length < 3 || args[0] === self || args[0] === self.eventBusEl_;
  let target;
  let type;
  let listener;

  if(isTargetingSelf) {
    target = self.eventBusEl_;

    if(args.length >= 3) {
      args.shift();
    }

    [type, listener] = args;
  } else {
    [type, listener, listener] = args;
  }

  validateTarget(target);
  validateEventType(type);
  validateListener(listener);

  listener = bind(self, listener);

  return {isTargetingSelf, target, type, listener};
};


/**
 * 
 */
const listen = (target, method, type, listener) => {

  if(target.nodeName) {
    // 给标签绑定

    Events[method](target, type, listener);
  } else {

     console.log("测一次，绑定到对象上 ", target[method]);

    // 给非标签绑定，比如类，
    // target[method](type, listener);
  }
};

const EventedMixin = {
  on(...args) {
    const {isTargetingSelf, target, type, listener} = normalizeListenArgs(this, args);

    listen(target, 'on', type, listener);

    if (!isTargetingSelf) {

      const removeListenerOnDispose = () => this.off(target, type, listener);

      const removeRemoverOnTargetDispose = () => this.off('dispose', removeListenerOnDispose);

      listen(this, 'on', 'dispose', removeListenerOnDispose);
      listen(target, 'on', 'dispose', removeRemoverOnTargetDispose);
    }
  },
  one(...args) {

  },
  any(...args) {

  },
  off(targetOrType, typeOrListener, listener) {
    
    console.log(" trigger = ", targetOrType, typeOrListener, listener);

    // 以该事件对象为目标
    if(!targetOrType || isValidEventType(targetOrType)) {
      off(this.eventBusEl_);
    
    // 以另一个事件对象为目标
    } else {

      const target = targetOrType;
      const type = typeOrListener;

      this.off('dispose', listener);
      if(target.nodeName) ; else {
        target.off(type, listener);
        target.off('dispose', listener);
      }
    }
  },
  trigger(event, hash) {
    return trigger(this.eventBusEl_, event, hash);
  },
};

function evented(target, options = {}) {
  const { eventBusKey } = options;

  if(eventBusKey) {
    if(!target[eventBusKey].nodeName) {
      throw new Error(`这个类没有关联 dom 元素`);
    }

    target.eventBusEl_ = target[eventBusKey];
  } else {
    target.eventBusEl_ = document.createElement('span');
  }

  assign(target, EventedMixin);

  if (target.eventedCallbacks) {
    target.eventedCallbacks.forEach((callback) => {
      callback();
    });
  }

  // 当释放任何事件对象时，它会删除其所有侦听器。
  target.on('dispose', () => {
    target.off();
    window.setTimeout(() => {
      target.eventBusEl_ = null;
    }, 0);
  });

  return target;
}

class Component {
  constructor() {

    this.el_ = this.createEl();
    
    evented(this, {eventBusKey: this.el_ ? 'el_' : null});
  }

  createEl() {
     return document.createElement('div');
  }

}

var oC = new Component();

// oC.on('blur', function () {
//   console.log('hello ~~');
// })

// oC.trigger('blur');

oC.trigger('dispose');

console.log("test = ", oC);
