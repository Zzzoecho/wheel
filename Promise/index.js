/**
 * Promise 3种状态
 * 1. pending: 初始, 可切换到 fulfilled or rejected
 * 2. fulfilled, 不可更改, 必须返回不可变的 value
 * 3. rejected, 不可更改, 必须返回不可变的 reason
 *
 * https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Promise
 * promises/A+ 规范: https://promisesaplus.com/
 * 执行 npm run test 来校验 promise 是否符合A+规范
 */
const isFunction = val => typeof val === 'function'
const isObject = obj => !!(obj && typeof obj === 'object')
const isThenable = obj => (isFunction(obj) || isObject(obj) && 'then' in obj)
const isPromise = promise => promise instanceof MyPromise


const PENDING = 'pending'
const FULFILLED = 'fulfilled'
const REJECTED = 'rejected'


/**
 * MyPromise
 * @param {*} fn 回调函数
 */
function MyPromise(fn) {
  this.result = null
  this.state = PENDING
  this.callbacks = []

  let onFulfilled = value => transition(this, FULFILLED, value)
  let onRejected = reason => transition(this, REJECTED, reason)

  // 用 ignore 来确保, resolve / reject 只会调用一次
  let ignore = false
  let resolve = value => {
    if (ignore) return
    ignore = true
    console.log('resolve')
    resolvePromise(this, value, onFulfilled, onRejected)
  }
  let reject = reason => {
    if (ignore) return
    ignore = true
    onRejected(reason)
  }

  try {
    fn(resolve, reject)
  } catch (e) {
    reject(e)
  }
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

MyPromise.prototype.catch = function (onRejected) {
  return this.then(null, onRejected)
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
  // 当状态变更时, 异步清空所有 callbacks
  setTimeout(() => handleCallbacks(promise.callbacks, state, result), 0)
}

const handleCallbacks = (callbacks, state, result) => {
  while (callbacks.length) {
    handleCallback(callbacks.shift(), state, result)
  }
}

// 在当前 promise 和下一个 promise 之间进行状态传递
const handleCallback = (callback, state, result) => {
  let { onFulfilled, onRejected, resolve, reject } = callback

  try {
    if (state === FULFILLED) {
      isFunction(onFulfilled) ? resolve(onFulfilled(result)) : resolve(result)
    } else if (state === REJECTED) {
      isFunction(onRejected) ? resolve(onRejected(result)) : reject(result)
    }
  } catch (e) {
    reject(e)
  }
}

/**
 * 一些特殊的 value 被 resolve 时, 要做特殊处理
 * 1. 如果 result 是当前 promise, 抛错
 * 2. 如果 result 是另一个 promise, 沿用它的 state 和 result 状态
 * 3. 如果 result 是一个 thanable 对象, 先取它的 then 函数, 再 call then 函数, 重新进入
 * @param promise
 * @param result
 * @param resolve
 * @param reject
 * @returns {MyPromise|*}
 */
const resolvePromise = (promise, result, resolve, reject) => {
  if (promise === result) {
    let reason = new TypeError('Can not fufill promise with itself')
    return reject(reason)
  }

  if (isPromise(result)) {
    return result.then(resolve, reject)
  }

  if (isThenable(result)) {
    try {
      let then = result.then
      if (isFunction(then)) {
        return new MyPromise(then.bind(result)).then(resolve, reject)
      }
    } catch (e) {
      return reject(e)
    }
  }

  resolve(result)
}

MyPromise.deferred = function() {
  let defer = {};
  defer.promise = new Promise((resolve, reject) => {
    defer.resolve = resolve;
    defer.reject = reject;
  });
  return defer;
}

export default MyPromise
