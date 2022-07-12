
import * as Events from '../utils/events.js';
import * as Fn from '../utils/fn';
import * as Obj from '../utils/obj';



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
}

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

  listener = Fn.bind(self, listener);

  return {isTargetingSelf, target, type, listener};
}


/**
 * 
 */
const listen = (target, method, type, listener) => {

  if(target.nodeName) {
    // 给标签绑定

    Events[method](target, type, listener);
  } else {

     console.log("测一次，绑定到对象上 ", target[method])

    // 给非标签绑定，比如类，
    // target[method](type, listener);
  }
}

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
      Events.off(this.eventBusEl_, targetOrType, typeOrListener);
    
    // 以另一个事件对象为目标
    } else {

      const target = targetOrType;
      const type = typeOrListener;

      this.off('dispose', listener);
      if(target.nodeName) {

        Events.off(target, type, listener);
        Events.off(target, 'dispose', listener);
      } else {
        target.off(type, listener);
        target.off('dispose', listener);
      }
    }
  },
  trigger(event, hash) {
    return Events.trigger(this.eventBusEl_, event, hash);
  },
}

export default function evented(target, options = {}) {
  const { eventBusKey } = options;

  if(eventBusKey) {
    if(!target[eventBusKey].nodeName) {
      throw new Error(`这个类没有关联 dom 元素`);
    }

    target.eventBusEl_ = target[eventBusKey];
  } else {
    target.eventBusEl_ = document.createElement('span');
  }

  Obj.assign(target, EventedMixin);

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
