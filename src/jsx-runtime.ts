import { Component } from './component';
import { isClass } from './lib/helper';
import { NodeItem, Props } from './types/nodeTree';
import { JSONType } from './types/type';

export type ComponentConstructor = new (props?: JSONType) => Component<any>;
type FunctionalComponent = (props?: JSONType) => NodeItem | null | undefined;
type JsxTag = string | ComponentConstructor | FunctionalComponent;

type JsxChild = NodeItem | string;
export type JsxItem = NodeItem | undefined | null;

export function jsx(tag: JsxTag, props: Props): JsxItem {
    if (isClass(tag)) {
        // tag is ComponentConstructor
        return createNodeByClass(tag as ComponentConstructor, props as Props);
    } else if (typeof tag === 'string') {
        // tag is html tag string
        return createNode(tag, props);
    } else if (typeof tag === 'function') {
        // tag is FunctionalComponent
        return (tag as FunctionalComponent)(props as JSONType);
    } else {
        // console.error('jsx: invalid tag argument', tag);
        throw new Error('jsx: invalid arguments for tag');
    }
}

export function jsxs(tag: JsxTag | { name?: string }, props: Props): JsxItem {
    // Special handling for Fragment, often represented as a function or a special symbol/object
    if (typeof tag === 'function' && tag.name === 'Fragment') {
        // Assuming Fragment is a function component
        return createNode('fragment', props);
    }
    // Or if Fragment is passed as an object like { name: 'Fragment' } (less common for JSX)
    if (
        typeof tag === 'object' &&
        (tag as { name?: string }).name === 'Fragment'
    ) {
        return createNode('fragment', props);
    }

    // Delegate to jsx for other cases, as jsxs is mainly an optimization for static children
    // or specific fragment handling. The core logic for node creation should be similar.
    // However, given the original code, jsxs seems to be a direct call to createNode for non-Fragments.
    if (typeof tag === 'string' || isClass(tag) || typeof tag === 'function') {
        return createNode(tag as JsxTag, props);
    } else {
        // console.error('jsxs: invalid tag argument', tag);
        throw new Error('jsxs: invalid arguments for tag');
    }
}

function createNode(tag: JsxTag, props: Props): NodeItem {
    let tagName: string;
    let attributes: any;
    if (typeof props === 'object') {
        attributes = { ...props };
    }
    let componentInstance: Component<any> | undefined = undefined;

    if (typeof tag === 'string') {
        tagName = tag;
    } else if (isClass(tag)) {
        tagName = (tag as ComponentConstructor).name;
    } else if (typeof tag === 'function') {
        tagName =
            (tag as FunctionalComponent).name || 'UnknownFunctionComponent';
    } else {
        throw new Error('createNode: invalid tag type');
    }

    let childrenNodes: NodeItem[] = [];
    if (attributes && attributes.children) {
        const currentChildren = attributes.children;
        delete attributes.children;

        const processChild = (child: JsxChild): NodeItem => {
            if (typeof child === 'string') {
                return {
                    tag: 'text',
                    text: child,
                    attributes: {},
                    children: [],
                };
            }
            return child; // Assumes child is already a NodeItem
        };

        if (Array.isArray(currentChildren)) {
            childrenNodes = currentChildren.map(processChild);
        } else {
            childrenNodes = [processChild(currentChildren as JsxChild)];
        }
    }
    const _props: any = Object.assign({}, props);
    const node: NodeItem = {
        tag: tagName,
        attributes: attributes,
        children: childrenNodes,
        props: _props,
        component: componentInstance,
    };
    return node;
}

export function Fragment(): null {
    return null;
}

export function createNodeByClass(
    ClassConstructor: ComponentConstructor,
    props: { [key: string]: any } = {}
): NodeItem {
    const componentInstance = new ClassConstructor(props);
    const renderedNode = componentInstance.render(props);

    if (!renderedNode) {
        return {
            tag: 'fragment',
            attributes: {},
            children: [],
            component: componentInstance,
            props: props || {},
        };
    }

    renderedNode.component = componentInstance;
    const _props = Object.assign({}, props);
    Object.assign(renderedNode.props || {}, _props);
    renderedNode.props = _props;

    return renderedNode;
}
