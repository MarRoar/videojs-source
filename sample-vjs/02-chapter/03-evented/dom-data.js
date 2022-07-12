
let FakeWeakMap;

if (window.WeakMap) {
  FakeWeakMap = class {
    constructor() {
      this.vdata = 'vdata' + Math.floor(window.performance && window.performance.now() || Date.now());
      this.data = {};
    }

    set(key, value) {
      const access = key[this.vdata] 
    }

  }
}
