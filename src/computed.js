import Watcher from './watcher.js'

function computed(vm, exp, fun) {
  const computedWatcher = new Watcher(vm, exp, fun, { computed: true })
  Object.defineProperty(vm, exp, {
    configurable: true,
    enumerable: true,
    get() {
      if (computedWatcher.proxy.dirty) {
        console.log('取新值', exp)
        computedWatcher.depend()
        let value = computedWatcher.get()
        return value
      } else {
        console.log('取旧值', exp)
        computedWatcher.depend()
        return computedWatcher.proxy.value
      }
    }
  })
}

function computedInit(value, vm) {
  if (!value || typeof value !== 'object') {
    return;
  }
  Object.keys(value).forEach(key => {
    new computed(vm, key)
  })
}

export {
  computed,
  computedInit
}