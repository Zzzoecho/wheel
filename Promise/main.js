const MyPromise = require('./index')

const sleep = (num) => {
  return new MyPromise((resolve, reject) => {
    if (num === 1) {
      resolve('成功')
    } else {
      reject('失败')
    }
  })
}

sleep(2).then(res => {
  console.log(res)
}).catch(e => {
  console.log('fail', e)
})
