const MyPromise = require('./index')

const sleep = () => {
  return new MyPromise((resolve, reject) => {
    console.log('in fn()', resolve)
    resolve('成功')
  })
}

sleep().then(res => {
  console.log(res)
})
