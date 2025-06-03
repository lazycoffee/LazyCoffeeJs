import { describe, expect, it } from 'bun:test';
import { Component } from '../src/component';
import { jsx, JsxItem, jsxs } from '../src/jsx-runtime';
import { NodeItem } from '@/types/nodeTree';
import { createElementTree } from '@/element';
import { init } from './lib/common';

init();

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
        state = {
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
    const nodeTree = appInstance.render() as NodeItem;
    const element = createElementTree(nodeTree) as HTMLElement;
    it('should render a list of items', () => {
        expect(element).toBeDefined();
        if (!element) {
            return;
        }
        // verify root element
        expect(element.tagName.toUpperCase()).toBe('DIV');
        expect(element.getAttribute('id')).toBe('list');
        const ul = element.firstChild as HTMLElement;
        expect(ul.tagName.toUpperCase()).toBe('UL');
        // verify first item
        const li = ul.firstChild as HTMLElement;
        expect(li.tagName.toUpperCase()).toBe('LI');
        const span = li.firstChild as HTMLElement;
        expect(span.tagName.toUpperCase()).toBe('SPAN');
        expect(span.textContent).toBe('张三');
        // verify sub children
        const subChild = li.children[2] as HTMLElement;
        expect(subChild.tagName.toUpperCase()).toBe('UL');
        const subChildLi = subChild.firstChild as HTMLElement;
        expect(subChildLi.tagName.toUpperCase()).toBe('LI');
        const subChildSpan = subChildLi.firstChild as HTMLElement;
        expect(subChildSpan.tagName.toUpperCase()).toBe('SPAN');
        expect(subChildSpan.textContent).toBe('张三儿1');
    });
});
