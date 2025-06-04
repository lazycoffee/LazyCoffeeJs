import { createElementTree } from './element';
import { isClass } from './lib/helper';
import { ComponentConstructor, createNodeByClass } from './jsx-runtime'; // Assumes createNodeByClass returns NodeItem
import { cacheNodeTree } from './nodeTree';
import { NodeItem, NodeElement } from './types/nodeTree';
import { Component } from './component'; // For type definition

// Type for a class constructor that creates a Component instance
type ComponentClass = new (props?: Record<string, unknown>) => Component<any>;
// Type for what can be rendered: a Component class or a NodeItem tree
type RenderableInput = ComponentClass | NodeItem;

export function render(
    node: RenderableInput,
    domTarget: string | HTMLElement | null
) {
    let jsxNode: NodeItem;
    if (isClass(node)) {
        // node is ComponentClass here
        jsxNode = createNodeByClass(node as ComponentConstructor, {});
    } else {
        // node is NodeItem here
        jsxNode = node as NodeItem;
    }
    if (!domTarget) {
        throw new Error('DOM target is null or undefined');
    }
    mount(jsxNode, domTarget);
    return jsxNode;
}

export function mount(jsxNode: NodeItem, domTarget: string | HTMLElement) {
    let mountPoint: HTMLElement | null = null; // Initialize to null for safety
    if (typeof domTarget === 'string') {
        mountPoint = document.querySelector(domTarget);
    } else {
        mountPoint = domTarget;
    }

    if (!mountPoint) {
        throw new Error(
            `Mount point not found for selector/element: ${domTarget}`
        );
    }
    cacheNodeTree(jsxNode); // Assuming jsxNode is the root of the new tree
    const elementTree = createElementTree(jsxNode);

    if (elementTree) {
        // Clear existing content before appending new tree
        // mountPoint.innerHTML = ''; // Optional: depends on desired mount behavior
        mountPoint.appendChild(elementTree);
    } else {
        console.warn('createElementTree returned no valid element to mount.');
    }
}
