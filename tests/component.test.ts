import { describe, expect, it } from 'bun:test';
import { Component } from '../src/component';
import { jsx, JsxItem, jsxs } from '../src/jsx-runtime';
import { NodeItem } from '@/types/nodeTree';
import { JSONValue } from '@/types/type';

type ListItem = {
    id: number;
    name: string;
    age: number;
    done: boolean;
    children?: ListItem[];
};

type State = {
    list: ListItem[];
};

describe('Component', () => {
    class App extends Component<State> {
        public state = {
            list: [
                {
                    id: 1,
                    name: '张三',
                    age: 18,
                    done: false,
                    children: [
                        {
                            id: 11,
                            name: '张三儿1',
                            age: 18,
                            done: false,
                        },
                        {
                            id: 22,
                            name: '张三儿2',
                            age: 19,
                            done: true,
                        },
                    ],
                },
                {
                    id: 2,
                    name: '李四',
                    age: 19,
                    done: true,
                },
            ],
        };
        doneItem(id: number) {
            console.log('id: ', id);
            this.updateState((draft: State) => {
                function updateList(list: State['list']) {
                    list.forEach((item) => {
                        if (item.id === id) item.done = true;
                        if (item.children) updateList(item.children);
                    });
                }
                updateList(draft.list);
            });
        }
        createList(list: State['list']) {
            const listEL: JsxItem[] = list
                .map((item: ListItem) => {
                    const style = { color: item.done ? 'red' : 'green' };
                    const child1 = jsx('span', {
                        children: item.name,
                    });
                    const button = jsx('button', {
                        onClick: this.doneItem.bind(this, item.id),
                        children: '删除',
                    });
                    const child2 = item.done ? '' : button;
                    const child3 = item.children
                        ? this.createList(item.children)
                        : [];
                    return jsxs('li', {
                        style,
                        children: [child1, child2, child3],
                    });
                })
                .filter(Boolean);
            return jsx('ul', { children: listEL });
        }
        render() {
            const { list } = this.state;
            const listEl = this.createList(list);
            return jsx('div', {
                id: 'list',
                children: listEl,
            });
        }
    }
    const appInstance = new App();
    it('should have a state property', () => {
        expect(appInstance.state.list).toBeDefined();
    });
});
