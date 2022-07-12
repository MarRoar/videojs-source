
import DomData from './dom-data';
import * as Guid from './guid.js';

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


export function fixEvent(event) {

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
export function on(elem, type, fn) {
  console.log(" events = ", elem, type, fn);

  // 如果type 是数组的话，就循环遍历 on 事件
  if (Array.isArray(type)) {
    return _handleMultipleEvents(on, elem, type, fn);
  }

  if (!DomData.has(elem)) {
    DomData.set(elem, {});
  }

  const data = DomData.get(elem)

  // hanlders 用来存储
  if(!data.handlers) {
    data.handlers = {};
  }

  if(!data.handlers[type]) {
    data.handlers[type] = [];
  }

  if(!fn.guid) {
    fn.guid = Guid.newGUID();
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
              console.error('错了')
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
export function off(elem, type, fn) {
  
}

// 触发
export function trigger(elem, event, hash) {

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
export function one(elem, type, fn) {
  
}

// 触发一次，然后关闭所有的事件配置
export function any(elem, type, fn) {
  
}
