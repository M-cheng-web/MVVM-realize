import Watcher from './watcher.js'
import Transit from './transit.js'

function Compile(el, vm) {
  this.vm = vm;
  this.el = document.querySelector(el);
  this.fragment = null;
  this.init();
}

Compile.prototype = {
  init: function () {
    if (this.el) {
      this.fragment = this.nodeToFragment(this.el);
      this.compileElement(this.fragment);
      this.el.appendChild(this.fragment);
    } else {
      console.log('Dom元素不存在');
    }
  },
  nodeToFragment: function (el) {
    var fragment = document.createDocumentFragment();
    var child = el.firstChild;
    while (child) {
      // 将Dom元素移入fragment中
      fragment.appendChild(child);
      child = el.firstChild
    }
    return fragment;
  },
  compileElement: function (el) {
    var childNodes = el.childNodes;
    var self = this;
    [].slice.call(childNodes).forEach(function (node) {
      var reg = /\{\{(.*)\}\}/;
      var text = node.textContent;

      if (self.isElementNode(node)) { // 如果是元素节点
        self.compile(node);
      } else if (self.isTextNode(node) && reg.test(text)) { // 如果是文本节点
        // node : 'hello world'   text: {{ title }}
        // 在这个例子中进入到这是第二次进入了,在这之前就给node.text赋值了,所以这里node = hello world
        self.compileText(node, reg.exec(text)[1]);
      }

      if (node.childNodes && node.childNodes.length) { // 递归执行
        self.compileElement(node);
      }
    });
  },
  /**
   * 对元素节点进行挂载事件
   */
  compile: function (node) {
    var nodeAttrs = node.attributes; // 元素的所有属性
    var self = this;
    Array.prototype.forEach.call(nodeAttrs, function (attr) {
      var attrName = attr.name; // ps: v-model
      if (self.isDirective(attrName)) {
        var exp = attr.value; // ps: title
        var dir = attrName.substring(2); // model
        if (self.isEventDirective(dir)) {  // v-on 事件指令
          self.compileEvent(node, self.vm, exp, dir);
        } else {  // v-model 指令
          self.compileModel(node, self.vm, exp, dir);
        }
        node.removeAttribute(attrName); // 绑定事件后对这些属性清除
      }
    });
  },
  /**
   * 对文本进行值挂载
   */
  compileText: function (node, exp) {
    var self = this;

    Transit(this.vm, exp, function (value) {
      self.updateText(node, value);
    })

    // var initText = this.vm[exp];
    // this.updateText(node, initText);

    // new Watcher(this.vm, exp, function (value) {
    //   self.updateText(node, value);
    // });
  },
  /**
   * 给元素挂载事件
   * 当点击时会触发事件
   */
  compileEvent: function (node, vm, exp, dir) {
    var eventType = dir.split(':')[1]; // click
    var cb = vm.methods && vm.methods[exp];

    if (eventType && cb) { // 监听点击事件
      node.addEventListener(eventType, cb.bind(vm), false);
    }
  },
  /**
   * 给元素挂载 v-model
   * 值改变时或者触发input事件都会触发页面更新
   */
  compileModel: function (node, vm, exp, dir) {
    var self = this;

    // ps: hello world (因为在mvvm.js文件中有个Object.defineProperty会往vm中添加data中的各个属性)
    var val = this.vm[exp];
    this.modelUpdater(node, val); // 页面赋值 hello world
    new Watcher(this.vm, exp, function (value) {
      self.modelUpdater(node, value); // 每次 title变化的时候页面会重新赋值
    });

    node.addEventListener('input', function (e) {
      var newValue = e.target.value;
      if (val === newValue) {
        return;
      }
      self.vm[exp] = newValue; // this.title 赋值
      val = newValue;
    });
  },
  updateText: function (node, value) {
    node.textContent = typeof value == 'undefined' ? '' : value;
  },
  modelUpdater: function (node, value, oldValue) {
    node.value = typeof value == 'undefined' ? '' : value;
  },
  isDirective: function (attr) {
    return attr.indexOf('v-') == 0;
  },
  isEventDirective: function (dir) {
    return dir.indexOf('on:') === 0;
  },
  isElementNode: function (node) {
    return node.nodeType == 1;
  },
  isTextNode: function (node) {
    return node.nodeType == 3;
  }
}

export default Compile