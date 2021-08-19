
function defineReactive(obj, name, value) {
  observable(obj[name])
  let dep = new Dep()
  Object.defineProperty(obj, name, {
    get() {
      console.log('触发get', name);
      dep.pushTarget()
      return value
    },
    set(val) {
      console.log('触发set', name);
      value = val
      dep.notify()
    }
  })
}

function observable(obj) {
  if (typeof obj !== 'object') return;
  Object.keys(obj).forEach(key => {
    defineReactive(obj, key, obj[key])
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
      watcher.update()
    })
  }
}
Dep.target = null;

function Watcher(vm, exp, cb) {
  this.vm = vm;
  this.exp = exp;
  this.cb = cb;
  this.value = this.get();  // 将自己添加到订阅器的操作
}
Watcher.prototype = {
  update: function () {
    this.run();
  },
  run: function () {
    var value = this.vm.data[this.exp];
    var oldVal = this.value;
    if (value !== oldVal) {
      this.value = value;
      this.cb.call(this.vm, value, oldVal);
    }
  },
  get: function () {
    Dep.target = this; // 全局变量 订阅者 赋值
    var value = this.vm.data[this.exp]  // 强制执行监听器里的get函数
    Dep.target = null; // 全局变量 订阅者 释放
    return value;
  }
};

let obj = {
  a: 123,
  b: 456,
  c: {
    d: 789
  }
}
// observable(obj)
// new Watcher(obj, 'c', (val) => {
//   console.log("val", val);
// })

// setTimeout(() => {
//   obj.c = 123
// }, 2000)


function MVVM(event) {
  const { el, data, methods } = event
  this.id = el.substring(1)
  this.body = document.getElementById(this.id)
  this.data = data
  this.methods = methods


  this.body.innerText = this.data.title

  observable(this.data)
  new Watcher(this, 'title', (val) => {
    this.body.innerText = val
  })

  setTimeout(() => {
    this.data.title = 123
  }, 2000)
}



















