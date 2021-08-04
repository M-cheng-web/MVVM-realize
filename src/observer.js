function Observer(data) {
  this.data = data;
  this.walk(data);
}

Observer.prototype = {
  walk: function (data) {
    var self = this;
    Object.keys(data).forEach(function (key) {
      self.defineReactive(data, key, data[key]);
    });
  },
  defineReactive: function (data, key, val) {
    var dep = new Dep();
    var childObj = observeInit(val);
    Object.defineProperty(data, key, {
      enumerable: true,
      configurable: true,
      get: function getter() {
        dep.addSub();
        return val;
      },
      set: function setter(newVal) {
        if (newVal === val) {
          return;
        }
        val = newVal;
        dep.notify();
      }
    });
  }
};

function observeInit(value, vm) {
  if (!value || typeof value !== 'object') {
    return;
  }
  return new Observer(value);
};

function Dep() {
  this.subs = new Set();
}
Dep.prototype = {
  addSub: function () {
    if (Dep.target) {
      this.subs.add(Dep.target);
    }
  },
  notify: function () {
    this.subs.forEach(function (watcher) {
      watcher.proxy.dirty = true
      watcher.update()
    });
  }
};
Dep.target = null;


export {
  observeInit,
  Dep
}