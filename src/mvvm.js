import Compile from './compile.js'
import { watchInit } from './watch.js'
import { observeInit } from './observer.js'
import { computedInit } from './computed.js'

function MVVM(options) {
  var self = this;
  this.data = options.data;
  this.methods = options.methods;
  this.computed = options.computed;
  this.watch = options.watch;

  Object.keys(this.data).forEach(function (key) {
    self.proxyKeys(key);
  });

  observeInit(this.data);
  computedInit(this.computed, this);
  watchInit(this.watch, this);

  new Compile(options.el, this);
}

MVVM.prototype = {
  proxyKeys: function (key) {
    var self = this;
    Object.defineProperty(this, key, {
      enumerable: false,
      configurable: true,
      get: function getter() {
        return self.data[key];
      },
      set: function setter(newVal) {
        self.data[key] = newVal;
      }
    });
  },
}

export default MVVM
