function isObject(val) {
  return typeof val === 'object'
}

// --------------------------------- reactive ---------------------------------
function reactive(data) {
  if (isObject(data)) {
    Object.keys(data).forEach(key => {
      defineReactive(data, key)
    })
  }
  return data
}
function defineReactive(data, key) {
  let val = data[key]
  const dep = new Dep()

  Object.defineProperty(data, key, {
    get() {
      dep.depend()
      return val
    },
    set(newVal) {
      val = newVal
      dep.notify()
    }
  })

  if (isObject(val)) {
    reactive(val)
  }
}


// --------------------------------- Dep ---------------------------------
class Dep {
  constructor() {
    this.deps = new Set()
  }
  depend() {
    if (Dep.target) {
      this.deps.add(Dep.target)
    }
  }
  notify() {
    console.log('this.deps', this.deps);
    this.deps.forEach(watcher => {
      watcher.proxy.dirty = true
      watcher.update()
    })
  }
}
Dep.target = null


// --------------------------------- targetStack ---------------------------------
const targetStack = []
function pushTarget(_target) {
  if (Dep.target) targetStack.push(Dep.target)
  Dep.target = _target
}
function popTarget() {
  Dep.target = targetStack.pop()
}


// --------------------------------- Watcher ---------------------------------
class Watcher {
  constructor(getter, options = {}) {
    const { computed } = options
    this.getter = getter
    this.computed = computed
    this.proxy = {
      value: '',
      dirty: true,
    }

    if (computed) {
      this.dep = new Dep()
    } else {
      this.get()
    }
  }

  get() {
    pushTarget(this)
    this.value = this.getter()
    this.proxy.dirty = false
    this.proxy.value = this.value
    popTarget()
    return this.value
  }

  // 仅为computed使用
  depend() {
    this.dep.depend()
  }

  update() {
    if (this.computed) {
      // this.get()
      this.dep.notify()
    } else {
      this.get()
    }
  }
}


// --------------------------------- 执行 ---------------------------------
let data = {
  msg: 'a',
  msg2: 'b'
}


reactive(data)

new Watcher(() => {
  document.getElementById('mvvm-app').innerHTML = `msg is ${data.msg}`
})
new Watcher(() => {
  document.getElementById('mvvm-app').innerHTML = `msg2 is ${data.msg2}`
})


function computed(getter, name) {
  let def = {}
  const computedWatcher = new Watcher(getter, { computed: true })
  Object.defineProperty(def, 'value', {
    get() {
      if (computedWatcher.proxy.dirty) {
        console.log('取新值', name);
        computedWatcher.depend()
        return computedWatcher.get()
      } else {
        console.log('取旧值', name);
        computedWatcher.depend() // 这个非常重要   没有这个会出现下面注释的问题
        return computedWatcher.proxy.value
      }
    }
  })
  return def
}

let names = computed(() => {
  return data.msg2 + '我'
}, 'names')

let age = computed(() => {
  return names.value + data.msg
}, 'age')


// 这俩个也要加上    没有这个会出现下面注释的问题
names.value
age.value

// 如果这样的话会出现一个问题  在一开始并没有去获取这俩个计算属性
// 会导致data没有存这俩个的watcher, 也就导致一开始去更改data并不会主动更改这俩个计算属性
// 同样的: 在没有调用过age这个计算属性的时候,先去调用names, 那么当names发生改变的时候, 并不会触发age的改变, 因为names并没有age的watcher


// 现在需要一开始就使用这俩个计算属性,而且要达到age先调用的这种情况
// 因为如果names先调用,那么age在调用的时候并不会触发names的获取新值的方法,也就不会导致后续的将age的watcher存放到names的deps内
// 这一点要优化掉, 可以考虑在获取旧值的时候也将旧值的deps内存放当前的watcher