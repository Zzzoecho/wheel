class MyPromise {
  static PENDING = 'pending';
  static FULFILLED = 'fulfilled'; // 成功
  static REJECTED = 'REJECTED'; // 失败

  constructor(fn) {
    this.state = MyPromise.PENDING;
    this.callbacks = [];
    fn(this._resolve.bind(this))
  }

  _resolve(value) {
    setTimeout(() => {
      console.log(this, value)
      this.callbacks.forEach(fn => fn(value))
    })
  }

  _reject(reason) {

  }

  then(onFulfilled, onRejected) {
    this.callbacks.push(onFulfilled)
    return this
  }
}

export default MyPromise
