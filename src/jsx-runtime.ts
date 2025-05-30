import { Component } from './component';
import { isClass } from './lib/helper';
import { Props } from './types/component';
import { NodeItem } from './types/nodeTree';
import { JSONValue } from './types/type';

// Type Definitions for JSX processing
type ComponentConstructor = new (
    props?: Record<string, unknown>
) => Component<any>;
type FunctionalComponent = (
    props?: Record<string, unknown>
) => NodeItem | null | undefined;
type JsxTag = string | ComponentConstructor | FunctionalComponent;

type JsxChild = NodeItem | string;

export function jsx(tag: JsxTag, props: Props): NodeItem | null | undefined {
    if (isClass(tag)) {
        // tag is ComponentConstructor
        return createNodeByClass(tag as ComponentConstructor, props);
    } else if (typeof tag === 'string') {
        // tag is html tag string
        return createNode(tag, props);
    } else if (typeof tag === 'function') {
        // tag is FunctionalComponent
        return (tag as FunctionalComponent)(props);
    } else {
        // console.error('jsx: invalid tag argument', tag);
        throw new Error('jsx: invalid arguments for tag');
    }
}

export function jsxs(
    tag: JsxTag | { name?: string },
    props: Props
): NodeItem | null | undefined {
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
    let attributes: Record<string, unknown> = { ...props }; // Copy props to attributes
    let componentInstance: Component<any> | undefined = undefined;

    if (typeof tag === 'string') {
        tagName = tag;
    } else if (isClass(tag)) {
        // This case should ideally be handled by createNodeByClass if it involves instantiation.
        // If createNode is called directly with a class, it means we might just use its name as a tag,
        // which is unusual for component-based frameworks unless it's for custom elements.
        // The original code had `tagName = tag.name;`
        // For now, let's assume if it's a class, it should have been handled by createNodeByClass.
        // This path in createNode for a class tag is ambiguous.
        // Sticking to original logic:
        tagName = (tag as ComponentConstructor).name; // Or a custom resolver for class to tag name
    } else if (typeof tag === 'function') {
        // Functional component, use its name as tag (convention) or handle differently
        tagName =
            (tag as FunctionalComponent).name || 'UnknownFunctionComponent';
    } else {
        throw new Error('createNode: invalid tag type');
    }

    let childrenNodes: NodeItem[] = [];
    if (attributes && attributes.children) {
        const currentChildren = attributes.children;
        delete attributes.children; // Remove children from attributes object

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

    // The attributes passed to NodeItem should not contain children.
    // Props for the component (if any) might be different from HTML attributes.
    // For now, all remaining props are passed as attributes.
    const node: NodeItem = {
        tag: tagName,
        attributes: attributes as Record<
            string,
            | string
            | number
            | boolean
            | undefined
            | Record<string, string | number>
        >, // Cast after children removal
        children: childrenNodes,
        props: { ...props }, // Store original props separately if needed
        component: componentInstance, // This would be set if createNode handled class instantiation
    };
    return node;
}

export function Fragment(): null {
    // Fragment component itself doesn't render, its children are hoisted.
    return null; // The actual processing is in jsxs/jsx
}

export function createNodeByClass(
    ClassConstructor: ComponentConstructor,
    props: Record<string, JSONValue> = {}
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
    renderedNode.props = { ...(renderedNode.props || {}), ...(props || {}) }; // Merge props

    return renderedNode;
}
