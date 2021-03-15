let obj = {};

let song = "发如雪";
obj.singer = "周杰伦";

Object.defineProperty(obj, 'music', {
    // value: '七里香',
    configurable: true,
    // writable: true,
    enumerable: true,
    get() {
        console.log('get', song);
        return song
    },
    set(val) {
        console.log('set', val);
        song = val
    }
})

console.log(obj);

delete obj.music
console.log(obj);


for (const key in obj) {
    console.log('key', key);
}

console.log(obj.music);
obj.music = '夜曲'
console.log(obj);

console.log(obj.music);
