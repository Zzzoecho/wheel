/**
 * Promise 3种状态
 * 1. pending: 初始, 可切换到 fulfilled or rejected
 * 2. fulfilled, 不可更改, 必须返回不可变的 value
 * 3. rejected, 不可更改, 必须返回不可变的 reason
 *
 *
 * https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Promise
 * promises/A+ 规范: https://promisesaplus.com/
 */


const PENDING = 'pending'
const FULFILLED = 'fulfilled'
const REJECTED = 'rejected'


function MyPromise(fn) {
  this.state = PENDING
  this.result = null
  this.callbacks = []
}


/**
 * 状态转变函数
 * @param promise 要转变状态的 promise
 * @param state 目标状态
 * @param result 返回值. 当 fulfilled 时, 作为 value; 当 rejected 时, 作为 reason
 */
const transition = (promise, state, result) => {
  if (promise.state !== PENDING) return
  promise.state = state
  promise.result = result
}


/**
 * then 方法
 * 1. 两个参数都是可选参数. 但必须是函数, 否则忽略
 * 2. 只能在 promise 状态符合时调用, 返回 value / reason
 * 3. 必须在当前宏任务队列清空后执行, 可以用 setTimeout or nextTick 实现
 * 4. 必须作为函数调用. this 在严格模式下指向 undefined, 普通模式指向 全局对象
 * 5. then 方法可能被调用多次, onFulfilled 和 onRejected 的回调必须按注册顺序执行
 * 6. then 必须返回 promise, 且返回的 promise 也有自己的 state 和 result, 由 onFulfilled 和 onRejected 的行为指定
 *  6.1 如果 onFulfilled / onRejected 返回了值, 用 promise 包裹后返回
 *  6.2
 * @param onFulfilled
 * @param onRejected
 */
MyPromise.prototype.then = function(onFulfilled, onRejected) {
  return new MyPromise((resolve, reject) => {
    let callback = { onFulfilled, onRejected, resolve, reject }

    if (this.state === PENDING) {
      this.callbacks.push(callback)
    } else {
      setTimeout(() => handleCallback(callback, this.state, this.result), 0)
    }
  })
}

const handleCallback = () => {

}
