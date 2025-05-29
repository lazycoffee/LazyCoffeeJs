# LazyCoffee Object oriented development framework

一款简单易用的，不需要学习成本的，面向对象的web开发框架。

## beta

当前版本为 beta 版本，可能存在 bug，请勿用于生产环境，如有问题请随时提 issue。

## 快速开始

### 安装

```bash
npm install lc_ood_framework
```

### TypeScript 配置

如果需要使用 TypeScript，需要在 tsconfig.json 中添加以下配置：

```json
{
    "compilerOptions": {
        "jsx": "react-jsx",
        "jsxImportSource": "lc_ood_framework"
        // 其他配置...
    }
}
```

### 构建工具配置

当前只测试过 RollDown 配置，其他构建工具还没测试过，后面会更新。

```json
// rolldown
{
    "jsx": {
        "mode": "automatic",
        "jsxImportSource": "lc_ood_framework"
    }
    // 其他配置...
}
```

### 使用

使用方法跟现流行框架并无区别：

```tsx
import { Component } from 'lc_ood_framework';
class App extends Component {
    render() {
        return <div>Hello World</div>;
    }
}
const app = new App();
app.mount('#app');
```

## 框架设计特性

本框架很多参考了 React, Vue 的设计思想，以下是本框架的设计特性：

### 任意地方修改组件状态变量

虽然跟 React, Vue 一样，本框架状态变量也是从上向下传递，但在修改状态变量时，你不需要在上层声明状态变量，然后用来控制下层组件，所有组件都是独立的，跟原生 dom 一样，你只需找到元素，然后修改元素即可。例如你创建了一个弹窗组件，然后想弹窗提示用户时，你只需找到该组件实例，然后调用其弹窗方法即可：

```tsx
import {querOne} from 'lc_ood_framework';

function submit() {
    const confirmModal = queryOne('#confirm-modal');
    confirmModal.open('Are you sure?', fcuntion () {
        // do something
    });
}
```

弹窗组件里，所有的状态变量都封装在 class 里，不需要从别的地方传入：

```tsx
import { Component } from 'lc_ood_framework';

class ConfirmModal extends Component {
    state = {
        visible: false,
    };
    open(content, callback) {
        this.setState({
            visible: true,
            content,
            callback,
        });
    }
    render() {
        const style = {
            display: this.state.visible ? 'block' : 'none',
        };
        return <div style={style}>{content}</div>;
    }
    // 其他代码
}
```

### 状态变量为不可变变量

在 immer 的帮助下，你不需要考虑状态变量的可变性，你只需直接修改，即可触发 DOM 元素的变化。

```tsx
import { Component } from 'lc_ood_framework';
class App extends Component {
    constructor() {
        super();
        setTimeout(() => {
            this.updateState((draft) => {
                draft.todoList[1].done = true;
            });
        }, 1000);
    }
    state = {
        todoList: [
            {
                id: 1,
                content: 'todo 1',
                done: false,
            },
            {
                id: 2,
                content: 'todo 2',
                done: false,
            },
        ],
    };
    render() {
        return (
            <ul>
                {this.state.todoList.map((todo) => (
                    <li>
                        [{todo.done ? 'done' : ''}]:
                        {todo.content}
                    </li>
                ))}
            </ul>
        );
    }
    // 其他代理
}
```

## 代码单词语义

以下是本框架的代码单词语义：

-   `Component`：组件
-   `State`：状态变量
-   `Props`：属性
-   `node`: AST 节点
-   `element`: DOM 元素

## 问题

由于框架设计特性本身或进度的原因，目前框架存在以下问题：

1. 当 render 函数返回为空时，就不会有任何元素附着在 DOM 树上，与原生查找逻辑一样，无法通过`query`方法找到该组件实例。
2. 组件的属性会透传到 render 根元素上
3. 跟 React 一样，添加事件时需要以 on 开头，事件名以驼峰命名，例如 onClick, onMouseEnter, onMouseLeave 等。

## 为本项目贡献
我们非常欢迎您为本项目贡献代码。

## 未来计划

-   [15%]: # 完善.d.ts 文件，增加类型提示
-   [0%]: # 单元测试，增加框架健壮性
-   [0%]: # 本框架 Logo

## 作者失业中

本人当前失业中，如不介意本人年龄较大（40），可以联系本人：elantion@gmail.com,18666133756（微信同号）
曾在魅族、华为大公司工作过，有管理小团队的经验，web/nodejs 双料全栈开发，会基本的linux运维，热爱开源，喜欢折腾。

## License

MIT