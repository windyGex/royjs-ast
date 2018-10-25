# Roy-Ast  ![buildStatus](https://travis-ci.org/windyGex/roy.svg?branch=master)

A quick static tools for royjs.

## Install

```shell
npm install @royjs/ast --save
```

## Usage

```js
import {Store} from '@royjs/ast';
const store = new Store(code);
```

## API
## Classes

<dl>
<dt><a href="#Store">Store</a></dt>
<dd><p>解析Royjs的Store数据</p>
</dd>
<dt><a href="#View">View</a></dt>
<dd><p>解析Royjs的视图数据</p>
</dd>
</dl>

<a name="Store"></a>

## Store
解析Royjs的Store数据

**Kind**: global class

* [Store](#Store)
    * [new Store(code)](#new_Store_new)
    * [.parse()](#Store+parse) ⇒
    * [.remove(name)](#Store+remove) ⇒
    * [.renameState(oldName, newName)](#Store+renameState) ⇒
    * [.modifyState(name, value)](#Store+modifyState) ⇒
    * [.modify(name, content)](#Store+modify) ⇒
    * [.rename(oldName, newName)](#Store+rename) ⇒
    * [.add(name)](#Store+add) ⇒
    * [.modifyUrl(node, url)](#Store+modifyUrl) ⇒

<a name="new_Store_new"></a>

### new Store(code)
Store的构造函数


| Param | Type | Description |
| --- | --- | --- |
| code | <code>String</code> | 传入的store的代码 |

<a name="Store+parse"></a>

### store.parse() ⇒
解析store文件

**Kind**: instance method of [<code>Store</code>](#Store)
**Returns**: 返回state，actions，urls
<a name="Store+remove"></a>

### store.remove(name) ⇒
根据name移除某个定义的action

**Kind**: instance method of [<code>Store</code>](#Store)
**Returns**: 修改后的代码

| Param | Type | Description |
| --- | --- | --- |
| name | <code>String</code> | action的名字 |

<a name="Store+renameState"></a>

### store.renameState(oldName, newName) ⇒
重命名某个state

**Kind**: instance method of [<code>Store</code>](#Store)
**Returns**: 修改后的代码

| Param | Type | Description |
| --- | --- | --- |
| oldName | <code>String</code> | 旧的state的名字 |
| newName | <code>String</code> | 新的state的名字 |

<a name="Store+modifyState"></a>

### store.modifyState(name, value) ⇒
修改状态的值

**Kind**: instance method of [<code>Store</code>](#Store)
**Returns**: 修改后的代码

| Param | Type | Description |
| --- | --- | --- |
| name | <code>String</code> | 状态的名称 |
| value | <code>String</code> | 状态的值 |

<a name="Store+modify"></a>

### store.modify(name, content) ⇒
根据action的名字，修改action内容

**Kind**: instance method of [<code>Store</code>](#Store)
**Returns**: 修改后的代码

| Param | Type | Description |
| --- | --- | --- |
| name | <code>String</code> | action的名字 |
| content | <code>String</code> | action的内容 |

<a name="Store+rename"></a>

### store.rename(oldName, newName) ⇒
重命名某个action

**Kind**: instance method of [<code>Store</code>](#Store)
**Returns**: 修改后的代码

| Param | Type | Description |
| --- | --- | --- |
| oldName | <code>String</code> | action的名称 |
| newName | <code>String</code> | action的新的名称 |

<a name="Store+add"></a>

### store.add(name) ⇒
增加一个action， 如果存在同名action则不会添加

**Kind**: instance method of [<code>Store</code>](#Store)
**Returns**: 修改后的代码

| Param | Type | Description |
| --- | --- | --- |
| name | <code>String</code> | action的名称 |

<a name="Store+modifyUrl"></a>

### store.modifyUrl(node, url) ⇒
修改store中请求url

**Kind**: instance method of [<code>Store</code>](#Store)
**Returns**: 返回修改的代码

| Param | Type | Description |
| --- | --- | --- |
| node | <code>Node</code> | 指定的节点，该节点需包含start和end两个属性 |
| url | <code>String</code> | 替换的URL |

<a name="View"></a>

## View
解析Royjs的视图数据

**Kind**: global class

* [View](#View)
    * [new View(code)](#new_View_new)
    * [.parse()](#View+parse) ⇒
    * [.attrs(node, name, value)](#View+attrs)
    * [.removeAttr(node, name)](#View+removeAttr)
    * [.remove(name)](#View+remove)
    * [.removeByStart(start)](#View+removeByStart)
    * [.cloneByStart(start)](#View+cloneByStart)
    * [.add(node, child)](#View+add)
    * [.rename(}, newName)](#View+rename)
    * [.find(})](#View+find) ⇒ <code>Array</code>
    * [.findByStart(start, isPath)](#View+findByStart)
    * [.findBy(callback, isPath)](#View+findBy)

<a name="new_View_new"></a>

### new View(code)
View的构造函数


| Param | Type | Description |
| --- | --- | --- |
| code | <code>String</code> | 传入的view的代码 |

<a name="View+parse"></a>

### view.parse() ⇒
解析视图数据

**Kind**: instance method of [<code>View</code>](#View)
**Returns**: 返回 class和elements值
<a name="View+attrs"></a>

### view.attrs(node, name, value)
为一个节点设置属性

**Kind**: instance method of [<code>View</code>](#View)

| Param | Type |
| --- | --- |
| node | <code>Node</code> \| <code>String</code> |
| name | <code>String</code> |
| value | <code>String</code> |

<a name="View+removeAttr"></a>

### view.removeAttr(node, name)
移除一个节点属性

**Kind**: instance method of [<code>View</code>](#View)

| Param | Type | Description |
| --- | --- | --- |
| node | <code>Node</code> \| <code>String</code> |  |
| name | <code>String</code> | 要移除的属性名称 |

<a name="View+remove"></a>

### view.remove(name)
根据名称移除一个节点

**Kind**: instance method of [<code>View</code>](#View)

| Param | Type |
| --- | --- |
| name | <code>String</code> |

<a name="View+removeByStart"></a>

### view.removeByStart(start)
根据起始位置移除一个节点

**Kind**: instance method of [<code>View</code>](#View)

| Param | Type |
| --- | --- |
| start | <code>String</code> \| <code>Int</code> |

<a name="View+cloneByStart"></a>

### view.cloneByStart(start)
根据起始位置复制一个节点

**Kind**: instance method of [<code>View</code>](#View)

| Param | Type |
| --- | --- |
| start | <code>String</code> \| <code>Int</code> |

<a name="View+add"></a>

### view.add(node, child)
为一个节点加入子节点

**Kind**: instance method of [<code>View</code>](#View)

| Param | Type | Description |
| --- | --- | --- |
| node | <code>String</code> \| <code>node</code> | 父节点 |
| child | <code>String</code> | 子节点的代码 |

<a name="View+rename"></a>

### view.rename(}, newName)
重命名一个节点，如果寻找到多个节点，只会重命名第一个

**Kind**: instance method of [<code>View</code>](#View)

| Param | Type | Description |
| --- | --- | --- |
| } | <code>String</code> | oldName |
| newName | <code>String</code> |  |

<a name="View+find"></a>

### view.find(}) ⇒ <code>Array</code>
根据name寻找节点

**Kind**: instance method of [<code>View</code>](#View)

| Param | Type | Description |
| --- | --- | --- |
| } | <code>String</code> | name |

<a name="View+findByStart"></a>

### view.findByStart(start, isPath)
根据起始位置寻找节点，如果第二个参数为true，则返回节点的路径

**Kind**: instance method of [<code>View</code>](#View)

| Param | Type |
| --- | --- |
| start | <code>String</code> \| <code>Int</code> |
| isPath | <code>Boolean</code> |

<a name="View+findBy"></a>

### view.findBy(callback, isPath)
根据callback过滤节点，如果第二个参数为true，则返回节点的路径

**Kind**: instance method of [<code>View</code>](#View)

| Param | Type |
| --- | --- |
| callback | <code>function</code> |
| isPath | <code>Boolean</code> |



