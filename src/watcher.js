import { Dep } from './observer.js'

const targetStack = []
function pushTarget(_target) {
  if (Dep.target) targetStack.push(Dep.target)
  Dep.target = _target
}
function popTarget() {
  Dep.target = targetStack.pop()
}

function Watcher(vm, exp, cb, options = {}, getter) {
  const { computed, watch, callback } = options
  this.vm = vm;
  this.exp = exp;
  this.cb = cb; // 渲染函数
  this.getter = getter; // 获取值函数
  this.computed = computed
  this.watch = watch
  this.callback = callback
  this.proxy = {
    value: '',
    dirty: true,
  }

  if (computed) {
    this.dep = new Dep()
  } else if (watch) {
    this.watchGet()
  } else {
    this.get()
  }
}

Watcher.prototype = {
  update() {
    if (this.computed && this.cb) { // 渲染计算属性
      this.get()
      this.dep.notify()
    } else if (this.computed) { // 更新计算属性(不涉及渲染)
      this.dep.notify()
    } else if (this.watch) { // 触发watch
      const oldValue = this.proxy.value
      this.watchGet()
      if (oldValue !== this.proxy.value) {
        this.callback(this.proxy.value, oldValue)
      }
    } else { // 更新data, 触发依赖其的属性更新
      this.get()
    }
  },
  get() {
    pushTarget(this)
    const value = this.getValue(this.exp)
    if (value !== this.proxy.value) {
      this.cb && this.cb.call(this.vm, value)
      this.proxy.dirty = false
      this.proxy.value = value
    }
    popTarget()
    return value;
  },
  watchGet() {
    pushTarget(this)
    const value = this.getter.call(this.vm)
    this.proxy.dirty = false
    this.proxy.value = value
    popTarget()
  },
  getValue(exp) {
    if (this.computed) {
      const val = this.vm.computed[exp].call(this.vm)
      return val
    } else {
      return this.vm.data[exp]
    }
  },
  depend() {
    this.dep.addSub()
  }
};

export default Watcher;