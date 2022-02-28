// 测试： `undefined`、`任意的函数`以及`symbol值`，出现在`非数组对象`的属性值中时在序列化过程中会被忽略

// 几个问题：
//   1. 数组在被序列化时这几个值会被忽略吗？ // 这三个值不会被忽略，但是都会被序列化为null
//   2. 测试下除undefined其他两个会出现什么情况 // 一样会被胡咧忽略

// ---------- 1
let signInfo = [
  {
    fieldId: 539,
    value: function a() {}
  },
  {
    fieldId: 540,
    value: Symbol(1)
  },
  {
    fieldId: 546,
    value: undefined
  },
]

console.log(JSON.stringify(signInfo));


// --------- 2
let info = [1, Symbol(1), undefined]
console.log(JSON.stringify(info));