import { describe, expect, it } from 'bun:test';
import { Component } from '../src/component';
import { JsxItem } from '../src/jsx-runtime';
import { NodeItem } from '@/types/nodeTree';
import { createElementTree } from '@/element';
import { render } from '@/renderer';
import { queryOne } from '@/query';

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
                    const child1 = <span>{item.name}</span>;
                    const button = (
                        <button onClick={this.doneItem.bind(this, item.id)}>
                            删除
                        </button>
                    );
                    const child2 = item.done ? '' : button;
                    const child3 = item.children
                        ? this.createList(item.children)
                        : [];
                    return <li style={style}>{[child1, child2, child3]}</li>;
                })
                .filter(Boolean);
            return <ul>{listEL}</ul>;
        }
        render() {
            const { list } = this.state;
            const listEl = this.createList(list);
            return <div id="list">{listEl}</div>;
        }
    }
    render(<App />, document.body);
    const appInstance = queryOne('#list') as App;
    it('should have a state property', () => {
        expect(appInstance.state.list).toBeDefined();
    });
    const nodeTree = appInstance.render() as NodeItem;
    const element = createElementTree(nodeTree) as HTMLElement;
    const ul = element.firstChild as HTMLElement;
    it('should render a list of items', () => {
        expect(element).toBeDefined();
        if (!element) {
            return;
        }
        expect(element.tagName.toUpperCase()).toBe('DIV');
        expect(element.getAttribute('id')).toBe('list');
        expect(ul.tagName.toUpperCase()).toBe('UL');
        expect(ul.children.length).toBe(2);
    });
    const li = ul.firstChild as HTMLElement;
    const span = li.firstChild as HTMLElement;
    it('each item should have a person name', () => {
        expect(li.tagName.toUpperCase()).toBe('LI');
        expect(span.tagName.toUpperCase()).toBe('SPAN');
        expect(span.textContent).toBe('张三');
    });
    const subChild = li.children[2] as HTMLElement;
    const subChildLi = subChild.firstChild as HTMLElement;
    const subChildSpan = subChildLi.firstChild as HTMLElement;
    it('should render a list of sub children', () => {
        expect(subChild.tagName.toUpperCase()).toBe('UL');
        expect(subChildLi.tagName.toUpperCase()).toBe('LI');
        expect(subChild.children.length).toBe(2);
    });
    it('sub child should render a person name', () => {
        expect(subChildSpan.tagName.toUpperCase()).toBe('SPAN');
        expect(subChildSpan.textContent).toBe('张三儿1');
    });
    it('sub child li should style color green', () => {
        expect(subChildLi.style.color).toBe('green');
    });
    it('should change sub child li style color to red', () => {
        const button = subChildLi.children[1] as HTMLButtonElement;
        button.click();
        setTimeout(() => {
            expect(subChildLi.style.color).toBe('red');
        }, 100);
    });
});
