import Watcher from './watcher.js'

function watch(vm, getter, callback) {
  new Watcher(vm, null, null, { watch: true, callback }, getter)
}

function watchInit(value, vm) {
  Object.keys(value).forEach(key => {
    watch(vm, function () { return this[key] }, (newValue, oldValue) => {
      value[key](newValue, oldValue)
    })
  })
}

export {
  watchInit
};
