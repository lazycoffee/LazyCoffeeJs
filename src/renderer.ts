import { createElementTree } from './element';
import { isClass } from './lib/helper';
import { createNodeByClass } from './jsx-runtime';
import { cacheNodeTree } from './nodeTree';

export function render(node: any, dom: string | HTMLElement | null) {
    let jsxNode = node;
    if (isClass(node)) {
        jsxNode = createNodeByClass(node, null);
    }
    if (!dom) {
        throw new Error('dom is null');
    }
    mount(jsxNode, dom);
}
export function mount(jsxNode: any, dom: string | HTMLElement) {
    let mountPoint: HTMLElement;
    if (typeof dom === 'string') {
        mountPoint = document.querySelector(dom) as HTMLElement;
    } else {
        mountPoint = dom;
    }
    if (!mountPoint) {
        throw new Error('mount point not found');
    }
    console.log('jsxNode: ', jsxNode);
    cacheNodeTree(jsxNode);
    const elementTree = createElementTree(jsxNode);
    console.log('elementTree: ', elementTree);
    mountPoint.appendChild(elementTree);
}
