# 学习来源：https://juejin.cn/post/7017588385615200270
# bug出现的场景
当表单数据非必填的情况下，`signInfo`字段的`value`值可能为`undefined`,经过JSON.stringify后的字符串对象缺少value key，导致后端parse之后无法正确读取value值，进而报接口系统异常，用户无法进行下一步动作。
```js
// 异常入参数据，数组字符串中没有value key
{
  signInfo: '[{"fieldId":539},{"fieldId":540},{"fieldId":546,"value":"10:30"}]'
}

// 正常入参数据
{
  signInfo: '[{"fieldId":539,"value":"银卡"},{"fieldId":540,"value":"2021-03-01"},{"fieldId":546,"value":"10:30"}]'
}

```

# 发现问题
```js
// 默认情况下数据是这样的
let signInfo = [
  {
    fieldId: 539,
    value: undefined
  },
  {
    fieldId: 540,
    value: undefined
  },
  {
    fieldId: 546,
    value: undefined
  },
]
// 经过JSON.stringify之后的数据,少了value key,导致后端无法读取value值进行报错

// 具体原因是`undefined`、`任意的函数`以及`symbol值`，出现在`非数组对象`的属性值中时在序列化过程中会被忽略

console.log(JSON.stringify(signInfo))
// '[{"fieldId":539},{"fieldId":540},{"fieldId":546}]'
```

# 解决方案
**将value值为undefined的项转化为空字符串再提交即可**
- 利用JSON.stringify第二个参数
```js
let signInfo = [
  {
    fieldId: 539,
    value: undefined
  },
  {
    fieldId: 540,
    value: undefined
  },
  {
    fieldId: 546,
    value: undefined
  },
]

// 判断到value为undefined，返回空字符串即可
JSON.stringify(signInfo, (key, value) => typeof value === 'undefined' ? '' : value)
// '[{"fieldId":539,"value":""},{"fieldId":540,"value":""},{"fieldId":546,"value":""}]'
```


# 深入学习
## 语法

JSON.stringify(value[, replacer [, space]])

## 参数

value
将要序列化成 一个 JSON 字符串的值。

replacer 可选

- 如果该参数是一个函数，则在序列化过程中，被序列化的值的每个属性都会经过该函数的转换和处理；
- 如果该参数是一个数组，则只有包含在这个数组中的属性名才会被序列化到最终的 JSON 字符串中；
- 如果该参数为 null 或者未提供，则对象所有的属性都会被序列化。


space 可选

- 指定缩进用的空白字符串，用于美化输出（pretty-print）；
- 如果参数是个数字，它代表有多少的空格；上限为10。
- 该值若小于1，则意味着没有空格；
- 如果该参数为字符串（当字符串长度超过10个字母，取其前10个字母），该字符串将被作为空格；
- 如果该参数没有提供（或者为 null），将没有空格。



## 返回值

一个表示给定值的JSON字符串。

## 异常

**当在循环引用时会抛出异常TypeError ("cyclic object value")（循环对象值）**
**当尝试去转换 BigInt 类型的值会抛出TypeError ("BigInt value can't be serialized in JSON")（BigInt值不能JSON序列化）.**


## 9大转换特性

- 1

1. undefined、任意的函数以及symbol值，出现在非数组对象的属性值中时在序列化过程中会被忽略
2. undefined、任意的函数以及symbol值出现在数组中时会被转换成 null。
3. undefined、任意的函数以及symbol值被单独转换时，会返回 undefined

- 2

**布尔值、数字、字符串的包装对象在序列化过程中会自动转换成对应的原始值。**

```js
console.log(JSON.stringify([new Number(1), new String("前端胖头鱼"), new Boolean(false)]))
// '[1,"前端胖头鱼",false]'
```

- 3

所有`以symbol为属性键`的属性都会被完全忽略掉，**即便 replacer 参数中强制指定包含了它们**

```js
console.log(JSON.stringify({
  [Symbol('前端胖头鱼')]: '前端胖头鱼'}
)) 
// '{}'
console.log(JSON.stringify({
  [ Symbol('前端胖头鱼') ]: '前端胖头鱼',
}, (key, value) => {
  if (typeof key === 'symbol') {
    return value
  }
}))
// undefined
```

- 4

NaN 和 Infinity 格式的数值及 null 都会被当做 null。

```js
console.log(JSON.stringify({
  age: NaN,
  age2: Infinity,
  name: null
}))
// '{"age":null,"age2":null,"name":null}'
```

- 5

**转换值如果有 toJSON() 方法，那么由这个方法定义什么值被进行序列化。**

```js
const toJSONObj = {
  name: '前端胖头鱼',
  toJSON () {
    return 'JSON.stringify'
  }
}

console.log(JSON.stringify(toJSONObj))
// "JSON.stringify"
```
- 6

Date 日期调用了 toJSON() 将其转换为了 string 字符串（同Date.toISOString()），因此会被当做字符串处理。

```js
const d = new Date()

console.log(d.toJSON()) // 2021-10-05T14:01:23.932Z
console.log(JSON.stringify(d)) // "2021-10-05T14:01:23.932Z"
```

- 7

对包含循环引用的对象（对象之间相互引用，形成无限循环）执行此方法，会抛出错误。

```js
let cyclicObj = {
  name: '前端胖头鱼',
}

cyclicObj.obj = cyclicObj

console.log(JSON.stringify(cyclicObj))
// Converting circular structure to JSON

```

- 8

其他类型的对象，包括 Map/Set/WeakMap/WeakSet，仅会序列化**可枚举的属性**

```js
let enumerableObj = {}

Object.defineProperties(enumerableObj, {
  name: {
    value: '前端胖头鱼',
    enumerable: true
  },
  sex: {
    value: 'boy',
    enumerable: false
  },
})

console.log(JSON.stringify(enumerableObj))
// '{"name":"前端胖头鱼"}'
```

- 9

当尝试去转换 BigInt 类型的值会抛出错误

```js
const alsoHuge = BigInt(9007199254740991)

console.log(JSON.stringify(alsoHuge))
// TypeError: Do not know how to serialize a BigInt
```
1