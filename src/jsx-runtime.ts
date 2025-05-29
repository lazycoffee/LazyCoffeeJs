import { Component } from './component';
import { isClass } from './lib/helper';
import { NodeItem } from './types/nodeTree';

export function jsx(arg1: any, arg2: any) {
    if (isClass(arg1)) {
        return createNodeByClass(arg1, arg2);
    } else if (typeof arg1 === 'string') {
        return createNode(arg1, arg2);
    } else if (arg1 instanceof Function) {
        return arg1(arg2);
    } else {
        throw new Error('jsx: invalid arguments');
    }
}
export function jsxs(arg1: any, arg2: any) {
    if (arg1.name === 'Fragment') {
        return createNode('fragment', arg2);
    }
    return createNode(arg1, arg2);
}
function createNode(tag: any, attributes: any) {
    let tagName = tag;
    if (isClass(tag)) {
        tagName = tag.name;
    } else if (typeof tag === 'function') {
        tagName = tag.name;
    }
    if (typeof attributes.children === 'string') {
        attributes.children = [{ tag: 'text', text: attributes.children }];
    }
    let children = attributes.children || [];
    delete attributes.children;
    if (children.tag) {
        children = [children];
    } else if (Array.isArray(children)) {
        children = children.map((child: any) => {
            if (typeof child === 'string') {
                return { tag: 'text', text: child };
            }
            return child;
        });
    } else {
        console.log('children: ', children);
        throw new Error('createNode: invalid children');
    }
    const node: NodeItem = {
        tag: tagName,
        attributes,
        children,
    };
    return node;
}
export function Fragment() {}
export function createNodeByClass(
    anyClass: new () => Component<any>,
    props: any
) {
    const instance = new anyClass();
    const node = instance.render(props) || {
        tag: '',
        attributes: {},
        children: [],
    };
    node.props = props;
    node.component = instance;
    return node;
}
