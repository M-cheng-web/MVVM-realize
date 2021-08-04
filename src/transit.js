// 中转作用
// 区分data和 computed 分别调用两种

import Watcher from './watcher.js'
import { computed } from './computed.js'

function transit(vm, exp, fun) {
  if (vm.data[exp]) {
    new Watcher(vm, exp, fun);
    fun.call(vm, vm[exp])
  } else {
    new computed(vm, exp, fun);
    console.log('实验', vm[exp]);
  }
}

export default transit
