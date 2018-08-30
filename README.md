# Roy-Ast  ![buildStatus](https://travis-ci.org/windyGex/roy.svg?branch=master)

A quick static tools for royjs.

## Install

```shell
npm install @royjs/ast --save
```

## Usage

### Action

```js
import {Action} from '@royjs/ast';

const action = new Action(code);
```

#### add(name) 添加一个action

#### remove(name) 移除一个action

#### parse()  获得当前声明的 action 列表

#### rename(oldName, newName) 重命名一个action
