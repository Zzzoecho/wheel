// import MyPromise from "./index.js";
import MyPromise from "./my.js";

const sleep = (num) => {
  return new MyPromise((resolve, reject) => {
    if (num === 1) {
      resolve('成功')
    } else {
      reject('失败')
    }
  })
}

// sleep(1).then(res => {
//   console.log(res)
// }).catch(e => {
//   console.log('fail', e)
// })

// 测试 event loop
const event = () => {
  return new MyPromise(resolve => {
    console.log('in promise')
    // setTimeout(() => {
    //   console.log('in setTimeout')
    //   resolve('1s')
    // }, 1000)
    resolve('同步')

  })
}

event().then((time) => {
  console.log('then -- 1', time)
}).then(time => {
  console.log('then -- 2', time)
})
