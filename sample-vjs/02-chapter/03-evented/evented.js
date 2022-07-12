

/**
 * 给 target 对象上挂载 sources的东西
 */
function assign(target, ...sources) {
  sources.forEach((source) => {

    console.log(" source = ", source);

    Object.keys(source).forEach((key) => {

      console.log(" key = ", key);

      target[key] = source[key];
    })
  });
}

const normalizeListenArgs = (self, args) => {

  const isTargetingSelf = args.length < 3 || args[0] === self || args[0] === self.eventBusEl_;
  let target;
  let type;
  let listener;

  target = self;
  [type, listener] = args;

  return {isTargetingSelf, target, type, listener};
}


/**
 * 
 */
const listen = (target, method, type, listener) => {

  console.log('绑定上了 = ', target, method, type, listener);

  method = 'on';
  type = 'blur';
  listener = function () {
    console.log(" blure ");
  }

  if(target.nodeName) {
    // 给标签绑定

  } else {

     console.log(" 测一次 ", target[method])

    // 给非标签绑定，比如类，
    // target[method](type, listener);
  }
}

const EventedMixin = {
  on(...args) {

    const {isTargetingSelf, target, type, listener} = normalizeListenArgs(this, args);


    // var target = this;
    // var [type, listener ] = args;

    console.log('绑定');
    // // console.log(" on = ", target, type, listener);
    listen(target, 'on', type, listener);

    if (!isTargetingSelf) {

      console.log('取消帮i的那个')


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
  off(...args) {

  },
  trigger(...args) {
    
  },
}


function evented(target, options = {}) {
  console.log(" target =  ", target);
  const { eventBusKey } = options;

  if(eventBusKey) {
    if(!target[eventBusKey].nodeName) {
      throw new Error(`这个类没有关联 dom 元素`);
    }

    target.eventBusEl_ = target[eventBusKey];
  } else {
    target.eventBusEl_ = document.createElement('span');
  }

  target.eventBusEl_ = document.createElement('span');

  assign(target, EventedMixin);
}
