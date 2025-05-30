# LazyCoffee Object Oriented Development Framework

A simple, easy-to-use, object-oriented web development framework with no learning curve.

## Beta

The current version is a beta version and may contain bugs. Please do not use it in a production environment. If you encounter any issues, please feel free to submit an issue.

## Quick Start

### Installation

```bash
npm install lc_ood_framework
```

### TypeScript Configuration

If you need to use TypeScript, you need to add the following configuration to your `tsconfig.json`:

```json
{
    "compilerOptions": {
        "jsx": "react-jsx",
        "jsxImportSource": "lc_ood_framework"
        // Other configurations...
    }
}
```

### Build Tool Configuration

Currently, only RollDown configuration has been tested. Other build tools have not yet been tested and will be updated later.

```json
// rolldown
{
    "jsx": {
        "mode": "automatic",
        "jsxImportSource": "lc_ood_framework"
    }
    // Other configurations...
}
```

### Usage

Usage is no different from current popular frameworks:

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

## Framework Design Features

This framework draws heavily on the design philosophies of React and Vue. Here are the design features of this framework:

### Modify Component State Variables Anywhere

Although, like React and Vue, state variables in this framework are passed down from top to bottom. But this framewrok is different, you do not need to declare state variables in the upper layer to control lower-level components when modifying state variables. All components are independent, just like native DOM elements. You only need to find the element and then modify it. For example, if you create a dialog component and want to show a dialog to the user, you just need to find the component instance and call its dialog method:

```tsx
import { queryOne } from 'lc_ood_framework'; // Corrected: querOne to queryOne

function submit() {
    const confirmModal = queryOne('#confirm-modal');
    confirmModal.open('Are you sure?', function () { // Corrected: fcuntion to function
        // do something
    });
}
```

For example, in the dialog component, all state variables are encapsulated within the class and do not need to be passed in from elsewhere:

```tsx
import { Component } from 'lc_ood_framework';

class ConfirmModal extends Component {
    state = {
        visible: false,
        content: '', // Added for clarity, as it's used in render
        callback: null as (() => void) | null, // Added for clarity
    };
    open(content: string, callback: () => void) { // Added types for clarity
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
        // Assuming this.state.content is used for the dialog message
        return <div style={style}>{this.state.content}</div>; 
    }
    // Other code
}
```

### State Variables are Immutable

With the help of Immer, you don't need to worry about the mutability of state variables. You can just modify them directly, and it will trigger changes in the DOM elements.

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
                    <li key={todo.id}> {/* Added key for list items */}
                        [{todo.done ? 'done' : ''}]:
                        {todo.content}
                    </li>
                ))}
            </ul>
        );
    }
    // Other methods/logic
}
```

## Code Terminology

Here is the code terminology for this framework:

-   `Component`: Component
-   `State`: State variable
-   `Props`: Properties
-   `node`: AST node
-   `element`: DOM element

## Issues

Due to the framework's design features or development progress, the framework currently has the following issues:

1. When the `render` function returns empty (e.g. null or undefined), no element will be attached to the DOM tree. Similar to native DOM lookup logic, the component instance cannot be found using the `query` method.
2. Component properties are passed through to the root element of the `render` output.
3. Similar to React, event handlers need to start with `on` and the event name should be in camelCase, e.g., `onClick`, `onMouseEnter`, `onMouseLeave`.

## Contributing to This Project
We warmly welcome your contributions to this project.

## Future Plans

-   [15%]: # Improve .d.ts files, enhance type hinting
-   [0%]: # Unit tests, increase framework robustness
-   [0%]: # Framework Logo

## Author is Currently Unemployed

I am currently unemployed. If you don't mind my relatively older age (40), you can contact me: elantion@gmail.com, 18666133756 (WeChat same number).
I have previously worked at large companies like Meizu and Huawei, have experience managing small teams, am a full-stack web/Node.js developer, know basic Linux operations, love open source, and enjoy tinkering.

## License

MIT