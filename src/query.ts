import { Component } from './component';
import { queryNodeList } from './nodeTree';
import { NodeItem } from './types/nodeTree';

// Using Component<any> as the proxy's represented type.
// This is a common pattern for dynamic proxies that should behave like an instance of a class.
export function query(selector: string): Component<any>[] {
    return queryNodeList(selector)
        .map((node) => componentProxyFactory(node))
        .filter((proxy): proxy is Component<any> => proxy !== undefined); // Ensure no undefined from map
}

export function queryOne(selector: string): Component<any> | undefined {
    const results = query(selector);
    return results.length > 0 ? results[0] : undefined;
}

function componentProxyFactory(node: NodeItem): Component<any> | undefined {
    if (!node.component) {
        return undefined; // If there's no component, there's nothing to proxy
    }
    // The target object for the proxy is not strictly used here since all operations
    // are delegated to node.component.
    return new Proxy(node.component, { // Proxying the component itself
        get(targetComponent, prop, receiver) {
            // targetComponent is node.component
            if (prop === 'isProxy') return true; // Example: way to identify proxy if needed

            // Prioritize properties/methods directly on the component instance
            if (Reflect.has(targetComponent, prop)) {
                const value = Reflect.get(targetComponent, prop, receiver);
                if (typeof value === 'function') {
                    return value.bind(targetComponent);
                }
                return value;
            }

            // Fallback or specific proxy behaviors can be added here if needed
            // console.warn(`Property "${String(prop)}" not found on component or its prototype chain.`);
            return undefined; // Or throw error, depending on desired strictness
        },
        set(targetComponent, prop, newValue, receiver) {
            // Allow setting properties on the component
            return Reflect.set(targetComponent, prop, newValue, receiver);
        }
    }) as Component<any>; // Assert that the proxy behaves like Component<any>
}
