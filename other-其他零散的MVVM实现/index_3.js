// --------------------------------- 2.4版本 ---------------------------------


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
  // 收集依赖
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
    this.deps.forEach(watcher => watcher.update())
  }
}
// 正在运行的watcher
Dep.target = null


// --------------------------------- targetStack ---------------------------------
const targetStack = []
// 将上一个watcher推到栈里，更新Dep.target为传入的_target变量。
function pushTarget(_target) {
  if (Dep.target) targetStack.push(Dep.target)
  Dep.target = _target
}
// 取回上一个watcher作为Dep.target，并且栈里要弹出上一个watcher。
function popTarget() {
  Dep.target = targetStack.pop()
}


// --------------------------------- Watcher ---------------------------------
class Watcher {
  constructor(getter, options = {}) {
    const { computed } = options
    this.getter = getter
    this.computed = computed

    if (computed) {
      this.dep = new Dep()
    } else {
      this.get()
    }
  }

  get() {
    pushTarget(this)
    this.value = this.getter()
    popTarget()
    return this.value
  }

  // 仅为computed使用
  depend() {
    this.dep.depend()
  }

  update() { // 这个也不需要的
    // if (this.computed) {
    //   this.get()
    //   this.dep.notify()
    // } else {
    //   this.get()
    // }
    // this.get()
  }
}


// --------------------------------- 执行 ---------------------------------
let data = {
  msg: 100
}


reactive(data)

new Watcher(() => {
  document.getElementById('mvvm-app').innerHTML = `msg is ${data.msg}`
})


function computed(getter) {
  let def = {}
  const computedWatcher = new Watcher(getter, { computed: true })
  Object.defineProperty(def, 'value', {
    get() {
      // 先让computedWatcher收集渲染watcher作为自己的依赖
      computedWatcher.depend() // 这个也不需要的
      // 在这次执行用户传入的函数中，又会让响应式的值收集到`computedWatcher`
      return computedWatcher.get()
    }
  })
  return def
}

let names = computed(() => {
  return data.msg + 100
})

let age = computed(() => {
  return names.value + 100 + data.msg
})


// 这里甚至都不需要这些了  因为本质上再次调用computed的时候才会重新计算
// 所有有关于改变的依赖存储都不需要了, 除非改用另外一种方式来实现计算属性


