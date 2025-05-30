import { produce } from 'immer';
import { getNodeById } from './nodeTree';
import { removeitemInArray, uuid } from './lib/helper';
import { JSONValue } from './types/type'; // Added import
import { createElement, createElementTree, removeNodeElement } from './element';
import { replaceNode, updateDomAttributes } from './lib/nodeUpdater';
import { NodeItem } from './types/nodeTree';

export class Component<T extends Record<string, JSONValue> = Record<string, JSONValue>> {
    constructor() {}
    render(props: Record<string, JSONValue>): NodeItem | undefined | null {
        return;
    }
    state: T = {} as T;
    readonly _id: string = uuid();
    setState(nextState: Partial<T>) {
        this.state = produce(this.state, (draft: T) => { // Changed draft type
            Object.assign(draft, nextState);
        });
        this.updateNode();
    }
    updateState(updater: (draft: T) => void) { // Changed return type of updater
        this.state = produce(this.state, updater);
        this.updateNode();
    }
    updateNode() {
        const oldNode = getNodeById(this._id);
        console.log('state', this.state);
        console.log('updateNode', oldNode);
        if (!oldNode) {
            throw new Error('updateNode: node not found');
        }
        // const component = this as any; // Removed 'as any'
        const newNode = this.render(oldNode.props as Record<string, JSONValue>); // Used 'this' directly
        console.log('newNode', newNode);
        if (!newNode) { // Added check for newNode, as render can return undefined/null
            // TODO: Handle cases where render returns no node.
            // This might mean unmounting the component or leaving the old node.
            // For now, we'll throw an error or log, as replacing with null is problematic.
            console.error('Component render returned no node. Old node:', oldNode);
            // Or perhaps, if the intention is to remove the component, handle that explicitly.
            // This part of the logic needs clarification based on framework design.
            // For now, let's not modify the DOM if newNode is null/undefined.
            return; 
        }
        newNode.props = { ...oldNode.props, ...newNode.props };
        newNode.component = this; // Used 'this' directly
        // traverse node tree
        function recursive(_newNode: NodeItem, _oldNode: NodeItem) {
            // 替换节点实例
            _oldNode.component = _newNode.component;
            _oldNode.props = _newNode.props;
            if (_newNode.tag !== _oldNode.tag) {
                // tag不一样时，直接替换
                replaceNode(_newNode, _oldNode);
            } else {
                // tag一样时，比较属性，并更新
                updateDomAttributes(_newNode, _oldNode);
            }
            _oldNode.attributes = _newNode.attributes;
            const newChildren = _newNode.children || [];
            const oldChildren = _oldNode.children || [];
            const length = Math.max(newChildren.length, oldChildren.length);
            for (let i = 0; i < length; i++) {
                const newChild = newChildren[i];
                let oldChild = oldChildren[i];
                if (!newChild) {
                    // 新节点不存在时，删除旧节点
                    oldChild.element && removeNodeElement(oldChild.element);
                    removeitemInArray(oldChildren, oldChild);
                    continue;
                }
                if (!oldChild) {
                    // 旧节点不存在时，创建新节点
                    oldChild = {
                        ...newChild,
                        parent: _oldNode,
                    };
                    oldChild.element = createElement(oldChild);
                    if (!_oldNode.element) {
                        throw new Error('updateNode: oldNode.element is null');
                    }
                    _oldNode.element.appendChild(oldChild.element);
                    oldChildren.push(oldChild);
                }
                recursive(newChild, oldChild);
            }
        }
        recursive(newNode, oldNode);
    }
}
