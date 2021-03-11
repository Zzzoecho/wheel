const PENDING = 'pending'
const FULFILLED = 'fulfilled'
const REJECTED = 'rejected'

function MyPromise(fn) {
  let self = this
  self.value = null // 成功时返回的值
  self.reason = null // 失败原因
  self.status = PENDING
  self.onFulfilled = null // 成功回调
  self.onRejected = null // 失败回调

  const resolve = value => {
    if (self.status === PENDING) {
      setTimeout(() => {
        self.value = value
        self.onFulfilled(self.value)
      }, 0)
    }
  }
  const reject = reason => {
    if (self.status === PENDING) {
      setTimeout(() => {
        self.reason = reason
        self.onRejected(self.reason)
      }, 0)
    }
  }

  try {
    fn(resolve, reject)
  } catch (e) {
    reject(e)
  }
}

MyPromise.prototype.then = function (onFulfilled, onRejected) {
  if (this.status === PENDING) {
    this.onFulfilled = onFulfilled
    this.onRejected = onRejected
  } else if (this.status === FULFILLED) {
    onFulfilled(this.value)
  } else {
    onRejected(this.reason)
  }
}

module.exports = MyPromise
