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
    // console.log('this.deps', this.deps);
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
    const { computed, watch, callback } = options
    this.getter = getter
    this.computed = computed
    this.watch = watch
    this.callback = callback
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
      this.dep.notify()
    } else if (this.watch) {
      const oldValue = this.value
      this.get()
      this.callback(this.value, oldValue)
    } else {
      this.get()
    }
  }
}


// --------------------------------- 执行 ---------------------------------
let data = {
  msg: 'a',
  msg2: 'b',
  cheng: {
    xin: {
      han: 1,
    }
  }
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
        computedWatcher.depend()
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


names.value
age.value



function watch(_key, _callback, start, deep) {
  const _obj = data
  if (deep) {
    deepWatch(_obj, _key, _callback)
  } else {
    building(_obj, _key, _callback)
  }

  if (start) {
    _callback(_obj[_key], _obj[_key])
  }
}

// 深度遍历
function deepWatch(_obj, _key, _callback) {
  if (typeof _obj[_key] === 'object') {
    building(_obj, _key, _callback)
    Object.keys(_obj[_key]).forEach(key => deepWatch(_obj[_key], key, _callback))
  } else {
    building(_obj, _key, _callback)
  }
}

function building(_obj, _key, _callback) {
  Object.defineProperty(_obj, _key, {
    set(newValue) {
      _callback(newValue, _obj[_key])
    }
  })
}

watch('cheng', (newValue, oldValue) => {
  data.msg2 = newValue + 'watch改变后'
  console.log('新值', newValue);
  console.log('旧值', oldValue);
}, true, true)
