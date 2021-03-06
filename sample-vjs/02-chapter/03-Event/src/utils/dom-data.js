
import * as Guid from './guid.js';

let FakeWeakMap;

if (window.WeakMap) {
  FakeWeakMap = class {
    constructor() {
      this.vdata = 'vdata' + Math.floor(window.performance && window.performance.now() || Date.now());
      this.data = {};
    }

    set(key, value) {
      const access = key[this.vdata] || Guid.newGUID();

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

  }
}

export default window.WeakMap ? new WeakMap() : new FakeWeakMap();