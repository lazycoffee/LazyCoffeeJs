import { Component } from './component';
import { queryNodeList } from './nodeTree';
import { NodeItem } from './types/nodeTree';

export function query(selector: string): any[] {
    return queryNodeList(selector).map((node) => componentProxyFactory(node));
}
export function queryOne(selector: string): any {
    return query(selector)[0];
}
function componentProxyFactory(node: NodeItem) {
    return new Proxy(
        {},
        {
            get(target, prop) {
                const component = node.component;
                if (!component) {
                    return;
                }
                if (!Reflect.has(component, prop)) {
                    throw new Error('instanceProxyFactory: invalid property');
                }
                const p = prop as keyof Component;
                const value = component[p];
                if (typeof value === 'function') {
                    return value.bind(component);
                }
                return value;
            },
        }
    );
}
