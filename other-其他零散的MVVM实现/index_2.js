let data = {
  name: 'cheng',
  age: 12,
  cc: 'cc'
}
let computed = {
  fullname: () => {
    return data.name + 'fullname' + data.age
  },
  shortname: () => {
    return data.name + 'shortname' + data.cc
  },
  longname: () => {
    return computed.fullname + 'longname' + data.cc
  },
}


Object.keys(data).forEach(key => {
  defineReactive(data, key, data[key])
})

function defineReactive(obj, name, value) {
  let dep = new Dep()
  Object.defineProperty(obj, name, {
    get() {
      dep.pushTarget()
      console.log(dep);
      return value
    },
    set(val) {
      console.log('cc', dep);
      value = val
      dep.notify()
    }
  })
}

function Dep() {
  this.targetArr = []

  this.pushTarget = function () {
    if (Dep.target) {
      this.targetArr.push(Dep.target)
    }
  }

  this.notify = function () {
    this.targetArr.forEach(watcher => {
      watcher.dirty = true
    })
  }
}
Dep.target = null;

function comWtcher(computed, name, cb) {
  this.proxy = {
    value: '',
    dirty: true,
  }
  defineWatcher(computed, name, cb, this.proxy)
  Dep.target = null
}

function defineWatcher(computed, name, cb, proxy) {
  Object.defineProperty(computed, name, {
    get() {
      if (proxy.dirty) {
        pushTarget(proxy)
        // Dep.target = proxy // 这样写会被替换掉
        proxy.dirty = false
        proxy.value = cb()
        console.log('获取新值', name);
        // Dep.target = null
        popTarget()
        return proxy.value
      } else {
        console.log('获取旧值', name, proxy);
        return proxy.value
      }
    }
  })
}


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


Object.keys(computed).forEach(key => {
  new comWtcher(computed, key, computed[key])
})










