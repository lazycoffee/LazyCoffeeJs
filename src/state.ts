import { produce } from 'immer';
import { Component } from './component'; // Import Component
import { JSONValue } from './types/type'; // Import JSONValue

// S represents the state type of the component
export function setState<S extends Record<string, JSONValue>>(
    node: Component<S>, 
    updater: (draft: S) => void
) {
    node.state = produce(node.state, updater);
    // update node elements
    // This typically would trigger a re-render, e.g., by calling node.updateNode()
    // if 'node' is a Component instance that has such a method.
    if (typeof (node as any).updateNode === 'function') {
        (node as any).updateNode();
    }
}